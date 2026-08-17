# 🪵 Модуль 4.1: Стек Grafana Loki & Grafana Alloy (LogQL)

**Grafana Alloy** — это современный унифицированный коллектор телеметрии от Grafana Labs (пришел на замену **Promtail** и **Grafana Agent**). Он собирает логи, метрики и трейсы, полностью совместим с экосистемой OpenTelemetry и Prometheus, и использует декларативный синтаксис конфигурации **Alloy / River**.

---

## 1. Архитектура стека (Alloy + Loki + Grafana)

1. **Grafana Alloy:** Агент на сервере. Читает файлы логов (например, `/var/log/*.log`, Docker контейнеры, systemd journal), навешивает лейблы (`app=nginx`, `env=prod`) и отправляет данные в Loki через HTTP API.
2. **Loki:** Сервер хранения логов. Индексирует только метаданные (лейблы), а сами сжатые данные логов складывает чанками в хранилище (локальный диск или S3/MinIO).
3. **Grafana:** Единый интерфейс для поиска по логам через вкладку **Explore** или панели дашбордов.

---

## 2. Шпаргалка по языку запросов LogQL

Синтаксис LogQL концептуально схож с PromQL:

```logql
# 1. Выбрать все логи сервиса nginx
{app="nginx"}

# 2. Найти строки, содержащие слово "error" (регистрозависимо)
{app="nginx"} |= "error"

# 3. Найти строки, не содержащие "healthcheck"
{app="nginx"} != "healthcheck"

# 4. Поиск по регулярному выражению (любые 5xx ошибки)
{app="nginx"} |~ "HTTP/1.1\" 5[0-9]{2}"

# 5. Парсинг JSON-логов и фильтрация по статусу
{app="backend"} | json | status_code >= 500

# 6. Превращение логов в метрику: Частота появления ошибок в секунду (Rate)
rate({app="nginx"} |= "error" [5m])

# 7. Подсчет количества ошибок по уровням (log level) за 5 минут
sum by (level) (count_over_time({app="payment-service"} | json [5m]))
```

---

## 3. Настройка Grafana Alloy (`config.alloy`)

Конфигурация Alloy пишется в формате блоков с направленным потоком данных (Pipeline):

```alloy
// 1. Поиск файлов логов на диске
local.file_match "app_logs" {
  path_targets = [
    {
      __path__  = "/var/log/*.log",
      job       = "system-logs",
      host      = "server-01",
    },
  ]
}

// 2. Чтение файлов и сохранение позиции смещения
loki.source.file "log_reader" {
  targets               = local.file_match.app_logs.targets
  forward_to            = [loki.process.add_labels.receiver]
  tail_from_end         = true
}

// 3. Обработка и трансформация логов (добавление меток)
loki.process "add_labels" {
  stage.regex {
    expression = "(?P<ip>\\d+\\.\\d+\\.\\d+\\.\\d+)"
  }

  stage.labels {
    values = {
      client_ip = "ip",
    }
  }

  forward_to = [loki.write.local_loki.receiver]
}

// 4. Отправка обработанных логов в Loki
loki.write "local_loki" {
  endpoint {
    url = "http://loki:3100/loki/api/v1/push"
  }
}
```

---

## 4. Почему именно Alloy, а не Promtail?

* **Promtail объявлен устаревшим (Deprecated):** Официальный фокус Grafana Labs полностью перешел на Alloy.
* **Универсальность:** Один бинарник Alloy заменяет сразу Promtail (логи), Node Exporter / Prometheus Scraper (метрики) и Jaeger/Tempo Agent (трейсы).
* **Поддержка OpenTelemetry (OTel):** Нативная совместимость с современными стандартами индустрии.
