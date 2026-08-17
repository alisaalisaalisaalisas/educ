# 🪵 Модуль 4.1: Grafana Loki & Grafana Alloy: Архитектура, River-манифесты, Продвинутый LogQL и Борьба с Кардинальностью

**Grafana Loki** (часто называемый «Prometheus для логов») — высокоэффективная горизонтально масштабируемая система централизованного сбора и анализа логов.

---

## 🏛️ 1. Архитектура: Индексация только метаданных

Главное концептуальное отличие Loki от Elasticsearch: **Loki не строит полнотекстовый инвертированный индекс по всему телу логов**.

* **Loki индексирует ТОЛЬКО метаданные (Лейблы):** `app`, `env`, `namespace`, `node`.
* **Тело логов сжимается алгоритмом gzip/snappy и складывается чанками (Chunks)** в дешевое объектное хранилище (S3 / MinIO / Ceph).
* **Результат:** Экономия до 80% оперативной памяти и диска по сравнению с классическим ELK.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                              GRAFANA LOKI                              │
│                                                                        │
│  ┌───────────────────────┐             ┌────────────────────────────┐  │
│  │ Distributor           │             │ Ingester                   │  │
│  │ (Валидация потоков,   │ ──────────► │ (Буферизация в RAM,        │  │
│  │  расчет хэшей меток)  │             │  нарезка чанков по 2-4 МБ) │  │
│  └───────────────────────┘             └─────────────┬──────────────┘  │
│                                                      │                 │
│  ┌───────────────────────┐             ┌─────────────▼──────────────┐  │
│  │ Querier / Query Front │ ◄─────────► │ Хранилище (S3 / MinIO):    │  │
│  │ (Параллельный поиск   │             │ 1. Chunks (Сжатые логи)    │  │
│  │  по чанкам в S3)      │             │ 2. TSDB Index (Лейблы)     │  │
│  └───────────────────────┘             └────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📜 2. Культура написания конфигурации Grafana Alloy (`config.alloy`)

> 💡 **Grafana Alloy** использует декларативный язык **River**, основанный на компонентах и направленных пайплайнах данных (`forward_to`).

Ниже представлен эталонный пайплайн сбора логов с фильтрацией спама, парсингом JSON и генерацией метрик:

```alloy
// =============================================================
// 1. Поиск файлов логов Nginx и системных журналов
// =============================================================
local.file_match "system_and_apps" {
  path_targets = [
    {
      __path__    = "/var/log/nginx/*access*.log",
      job         = "nginx",
      environment = "production",
    },
    {
      __path__    = "/var/log/apps/**/*.log",
      job         = "backend-apps",
      environment = "production",
    },
  ]
}

// =============================================================
// 2. Чтение файлов логов с сохранением позиции (Offset Tracking)
// =============================================================
loki.source.file "file_reader" {
  targets       = local.file_match.system_and_apps.targets
  forward_to    = [loki.process.clean_and_parse.receiver]
  tail_from_end = true
}

// =============================================================
// 3. Стадии обработки, фильтрации и обогащения (Processing Pipeline)
// =============================================================
loki.process "clean_and_parse" {
  // Стадия 1: Дропаем мусорные логи healthcheck от Kubernetes и мониторинга
  stage.drop {
    expression = ".*(healthz|readyz|kube-probe|Prometheus).*"
  }

  // Стадия 2: Парсинг JSON-структуры
  stage.json {
    expressions = {
      extracted_level   = "level",
      extracted_service = "service_name",
      extracted_status  = "http_status",
      extracted_latency = "duration_ms",
    }
  }

  // Стадия 3: Навешивание ТОЛЬКО низкокардинальных лейблов!
  stage.labels {
    values = {
      level   = "extracted_level",
      service = "extracted_service",
    }
  }

  // Стадия 4: Превращение логов 5xx в метрику Prometheus прямо внутри Alloy!
  stage.metrics {
    metric.counter "app_log_errors_total" {
      description = "Количество ошибок 5xx, извлеченных из логов"
      source      = "extracted_status"
      action      = "inc"
      match {
        selector = "{job=\"backend-apps\"}"
        value    = "5[0-9]{2}"
      }
    }
  }

  forward_to = [loki.write.remote_loki.receiver]
}

// =============================================================
// 4. Пакетная отправка данных в Loki (Batching & Retry)
// =============================================================
loki.write "remote_loki" {
  endpoint {
    url           = "http://loki-gateway.monitoring.svc:3100/loki/api/v1/push"
    batch_wait    = "1s"
    batch_size    = "1MiB"
    max_retries   = 5
    min_backoff   = "500ms"
  }
}
```

---

## ⚙️ 3. Эталонный конфиг сервера Loki (`loki.yaml`)

```yaml
auth_enabled: false

server:
  http_listen_port: 3100
  grpc_listen_port: 9096

common:
  path_prefix: /var/loki
  storage:
    s3:
      endpoint: s3.amazonaws.com
      bucketnames: my-company-loki-chunks
      region: eu-central-1
      insecure: false
  replication_factor: 3

schema_config:
  configs:
    - from: 2024-01-01
      store: tsdb # Современный быстрый движок индексов TSDB
      object_store: s3
      schema: v13
      index:
        prefix: loki_index_
        period: 24h

limits_config:
  retention_period: 30d        # Хранить логи ровно 30 дней
  max_query_length: 721h       # Максимальный диапазон одного запроса (30 дней)
  max_streams_per_user: 10000  # Защита от High Cardinality взрыва
  reject_old_samples: true
  reject_old_samples_max_age: 168h # Запрет записи логов старше 7 дней

compactor:
  working_directory: /var/loki/compactor
  retention_enabled: true      # Включение автоматической очистки старых логов
  compaction_interval: 10m
```

---

## 🧠 4. Глубокий разбор LogQL (Язык запросов Loki)

LogQL делится на две части: **Log Queries** (поиск текстовых строк) и **Metric Queries** (превращение логов в графики).

```text
  {app="nginx", env="prod"}  |= "error"  | json  | status_code >= 500
  └──────────┬───────────┘  └─────┬────┘ └──┬──┘ └────────┬────────┘
     1. Stream Selector        2. Filter   3.Parser  4. Label Filter
```

### 1. Операторы фильтрации строк (Line Filters)

* `|= "keyword"` — содержит подстроку (регистрозависимо).
* `!= "healthz"` — НЕ содержит подстроку.
* `|~ "HTTP/1.[01]\" 5[0-9]{2}"` — совпадение по регулярному выражению (Regex).
* `!~ "(kube-probe|curl)"` — исключение по регулярному выражению.

---

### 2. Парсеры рантайма (Parsers)

* `| json` — автоматически распаковывает JSON-лог и делает все ключи доступными как переменные.
* `| logfmt` — парсит логи вида `level=error user=42 msg="timeout"`.
* `| pattern "<ip> - - [<time>] \"<method> <uri>\" <status> <bytes>"` — мгновенный парсер Nginx без написания сложных регулярных выражений!
* `| regexp "(?P<trace_id>[a-f0-9]{32})"` — извлечение именованных групп через Regex.

---

### 3. Золотой банк метрических запросов LogQL

```logql
# 1. Частота появления ошибок (RPS) в сервисе billing
rate({app="billing", env="production"} |= "ERROR" [5m])

# 2. Суммарный объем входящих логов в секунду (Bytes per second)
sum by (app) (bytes_rate({env="production"}[5m]))

# 3. 99-й процентиль задержки Nginx (вычисленный прямо из логов доступа!)
quantile_over_time(0.99,
  {app="nginx"}
    | pattern "<_> - - <_> \"<_> <_> <_>\" <_> <_> <request_time>"
    | unwrap request_time [5m]
) by (status)

# 4. Топ-10 пользователей с ошибками авторизации за последние 30 минут
topk(10, sum by (user_id) (count_over_time({app="auth-api"} | json | status == 401 [30m])))
```

---

## 💣 5. Ловушки кардинальности в Loki (Cardinality Traps)

> ⚠️ **Главное правило архитектуры Loki:** Лейблы в Loki создают отдельные **потоки (Streams)**. Если лейбл имеет миллионы уникальных значений, Loki создаст миллионы мелких чанков, заполнит всю RAM и упадет в OOM!

| Поле лога | Можно делать лейблом в Loki? | Почему? | Как правильно работать в Loki |
| :--- | :--- | :--- | :--- |
| `environment` (`prod`, `dev`) | ✅ **ДА** | Низкая кардинальность (2–3 значения). | Навешивать в `stage.labels`. |
| `service_name` | ✅ **ДА** | Низкая кардинальность (10–100 сервисов). | Навешивать в `stage.labels`. |
| `level` (`INFO`, `ERROR`) | ✅ **ДА** | 5–6 значений. | Навешивать в `stage.labels`. |
| `user_id` / `email` | ❌ **КАТЕГОРИЧЕСКИ НЕТ!** | Миллионы уникальных ID взорвут TSDB. | Оставлять в теле лога и фильтровать через `\| json \| user_id == "48291"`. |
| `ip_address` | ❌ **КАТЕГОРИЧЕСКИ НЕТ!** | Сотни тысяч уникальных IP. | Фильтровать через LogQL: `\| pattern` или `\|~`. |
| `trace_id` / `request_id` | ❌ **КАТЕГОРИЧЕСКИ НЕТ!** | У каждого запроса свой уникальный ID. | Использовать Grafana Trace to Logs integration по поиску в теле. |

---

## 🚫 6. Таблица антипаттернов в Loki & Alloy

| ❌ Антипаттерн | Почему это плохо | ✅ Как делать правильно |
| :--- | :--- | :--- |
| Навешивание `ip_address` в лейблы Loki | High Cardinality шторм, исчерпание памяти и падение Ingestor. | Оставлять IP в строке лога и фильтровать в LogQL на лету. |
| Запись неструктурированных Plain-text логов | Замедляет поиск в 10 раз, требует тяжелых Regex при каждом запросе. | Писать логи приложений строго в формате **Structured JSON**. |
| Отсутствие отсечения логов `healthz` | 70% объема логов в S3 занимают бессмысленные проверки K8s readiness/liveness. | Фильтровать через `stage.drop` в агенте Alloy до отправки в Loki. |
| Отсутствие `retention_period` в конфиге Loki | Логи накапливаются годами, счета за хранилище S3 вырастают в сотни раз. | Включать `compactor` с `retention_period: 30d`. |
| Запрос LogQL без селектора потока `{}` | Loki пытается просканировать терабайты данных всего кластера, подвешивая Querier. | Всегда начинать запрос с точного селектора `{app="...", env="..."}`. |
