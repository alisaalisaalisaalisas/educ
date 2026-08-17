# 📊 Модуль 3.2: Prometheus & Grafana: Манифесты, Продвинутый PromQL и Культура Дашбордов

Связка **Prometheus + Grafana** — это де-факто признанный индустриальный стандарт мониторинга и визуализации метрик в Cloud Native экосистеме.

---

## 🏛️ 1. Архитектура и жизненный цикл скрейпинга

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          PROMETHEUS SERVER                             │
│                                                                        │
│  ┌───────────────────────┐             ┌────────────────────────────┐  │
│  │ Service Discovery     │             │ TSDB Storage (Disk / WAL)  │  │
│  │ (Kubernetes, File, DNS│             │ ┌────────────────────────┐ │  │
│  └──────────┬────────────┘             │ │ Blocks (2h) ➔ Compact  │ │  │
│             │                          │ └────────────────────────┘ │  │
│  ┌──────────▼────────────┐             └─────────────▲──────────────┘  │
│  │ Scrape Engine (Pull)  │                           │                 │
│  │ 1. Relabel (targets)  │ ────(HTTP GET /metrics)───┤                 │
│  │ 2. Scrape             │                           │                 │
│  │ 3. Metric Relabel     │ ──(Save Clean Metrics)────┘                 │
│  └───────────────────────┘                                             │
└─────────────┬────────────────────────────────────────┬─────────────────┘
              │                                        │
     (PromQL Queries)                         (Send Firing Alerts)
              ▼                                        ▼
    ┌──────────────────┐                     ┌──────────────────┐
    │     GRAFANA      │                     │   ALERTMANAGER   │
    │  (Визуализация)  │                     │  (Маршрутизация) │
    └──────────────────┘                     └──────────────────┘
```

---

## 📜 2. Эталонный Production-Ready конфиг `prometheus.yml`

Манифест ниже содержит правила Service Discovery, фильтрацию мусорных метрик (`metric_relabel_configs`), скрейп системных экспортеров и синтетических проверок Blackbox:

```yaml
global:
  scrape_interval: 15s     # Интервал опроса таргетов (по умолчанию 15 секунд)
  evaluation_interval: 15s # Интервал вычисления правил алертов и агрегаций
  scrape_timeout: 10s      # Таймаут ожидания HTTP-ответа от экспортера

# Подключение правил алертов
rule_files:
  - "/etc/prometheus/rules/*.yml"

# Подключение Alertmanager
alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

scrape_configs:
  # -------------------------------------------------------------
  # 1. Мониторинг самого Prometheus
  # -------------------------------------------------------------
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # -------------------------------------------------------------
  # 2. Мониторинг хостов Linux (Node Exporter)
  # -------------------------------------------------------------
  - job_name: 'node_exporter'
    file_sd_configs:
      - files:
          - '/etc/prometheus/targets/nodes/*.json'
    # Фильтрация метрик: вырезаем мусорные метрики для экономии 40% RAM
    metric_relabel_configs:
      - source_labels: [__name__]
        regex: '(go_gc_.*|go_memstats_.*|node_scrape_collector_.*)'
        action: drop

  # -------------------------------------------------------------
  # 3. Синтетический мониторинг доступности сайтов (Blackbox Exporter)
  # -------------------------------------------------------------
  - job_name: 'blackbox_http'
    metrics_path: /probe
    params:
      module: [http_2xx] # Проверка успешного HTTP 2xx и срока действия SSL
    static_configs:
      - targets:
          - https://example.com
          - https://api.example.com/healthz
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: blackbox-exporter:9115 # Адрес самого Blackbox Exporter

  # -------------------------------------------------------------
  # 4. Service Discovery в Kubernetes (Поды с аннотацией prometheus.io/scrape)
  # -------------------------------------------------------------
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      # Скрейпить только поды, где есть аннотация prometheus.io/scrape = true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      # Заменять порт скрейпа на значение из аннотации prometheus.io/port
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
        target_label: __address__
      # Сохранять человекочитаемые лейблы неймспейса и имени пода
      - source_labels: [__meta_kubernetes_namespace]
        target_label: namespace
      - source_labels: [__meta_kubernetes_pod_name]
        target_label: pod
```

---

## 🧰 3. Экспортеры: Настройка и Синтетические проверки

### 1. `Node Exporter` (Метрики ОС Linux)

Запуск через systemd unit `/etc/systemd/system/node_exporter.service`:

```ini
[Unit]
Description=Node Exporter
After=network.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter \
  --collector.systemd \
  --collector.processes \
  --collector.textfile.directory=/var/lib/node_exporter/textfile_collector \
  --no-collector.infiniband \
  --no-collector.xfs
Restart=always

[Install]
WantedBy=multi-user.target
```

* **Textfile Collector:** Позволяет складывать кастомные метрики из любых bash-скриптов и cronjob в текстовый файл `/var/lib/node_exporter/textfile_collector/backup.prom` в формате:
  `backup_last_success_timestamp{service="postgres"} 1723849200`.

---

### 2. `Blackbox Exporter` (`blackbox.yml`)

Используется для **внешнего мониторинга доступности сервисов** (HTTP, Ping, TCP, валидность SSL):

```yaml
modules:
  http_2xx:
    prober: http
    timeout: 5s
    http:
      valid_status_codes: [200, 204, 301, 302]
      method: GET
      fail_if_ssl: false
      fail_if_not_ssl: true # Требовать валидный HTTPS
      tls_config:
        insecure_skip_verify: false

  icmp_ping:
    prober: icmp
    timeout: 3s
    icmp:
      preferred_ip_protocol: ip4
```

---

## 🧠 4. Продвинутый PromQL: Шпаргалка и Тонкости

### 1. ⚔️ Битва титанов: `rate()` против `irate()` (ОЧЕНЬ ВАЖНО!)

| Функция | Как вычисляет | Когда использовать |
| :--- | :--- | :--- |
| **`rate(v[5m])`** | Вычисляет **среднее приращение** за весь 5-минутный интервал. Сглаживает кратковременные пики. | **ВСЕГДА для алертов и общих графиков.** Гарантирует отсутствие ложного шума. |
| **`irate(v[2m])`** | Вычисляет **мгновенную скорость** по двум последним точкам диапазона. Показывает резкие всплески. | **ТОЛЬКО для оперативных Zoom-in графиков в Grafana.** ❌ **НИКОГДА не использовать в правилах алертов!** |

---

### 2. Золотой банк формул PromQL

```promql
# 1. Загрузка CPU хоста в процентах (по всем ядрам)
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# 2. Использование RAM в % (с учетом кэшей и буферов ядра)
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# 3. 95-й процентиль времени ответа API (Latency p95)
histogram_quantile(0.95, sum by (le, service) (rate(http_request_duration_seconds_bucket[5m])))

# 4. Прогнозирование переполнения диска через 24 часа (Linear Prediction)
# Алерт сработает, если при текущей скорости записи диск заполнится менее чем за 1 день:
predict_linear(node_filesystem_free_bytes{mountpoint="/"}[4h], 86400) < 0

# 5. Детекция истечения срока действия SSL-сертификата (осталось < 14 дней)
(probe_ssl_earliest_cert_expiry - time()) / 86400 < 14

# 6. Доля ошибок HTTP 5xx от общего потока трафика (Error Rate %)
(sum by (service) (rate(http_requests_total{status=~"5.."}[5m]))
/
sum by (service) (rate(http_requests_total[5m]))) * 100

# 7. Проверка пропажи сервиса (Metric Absence)
absent(up{job="payment-service"} == 1)
```

---

## 🎨 5. Культура создания дашбордов в Grafana

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   3-УРОВНЕВАЯ ПИРАМИДА ДАШБОРДОВ                       │
├────────────────────────────────────────────────────────────────────────┤
│ 👑 УРОВЕНЬ 1: EXECUTIVE / HIGH-LEVEL OVERVIEW                          │
│    Общий светофор системы: Доступность (SLA), суммарный RPS,           │
│    процент ошибок 5xx по компании, статус бизнес-транзакций.           │
├────────────────────────────────────────────────────────────────────────┤
│ 🚀 УРОВЕНЬ 2: SERVICE / APPLICATION DASHBOARD                          │
│    Метрики RED: RPS сервиса, p95/p99 Latency, статус-коды ответов,     │
│    размер пула соединений к БД, очереди задач RabbitMQ/Kafka.          │
├────────────────────────────────────────────────────────────────────────┤
│ 🔧 УРОВЕНЬ 3: INFRASTRUCTURE / NODE DEEP-DIVE                          │
│    Метрики USE: CPU по ядрам, RAM, Disk I/O, Network drops, сокеты.    │
└────────────────────────────────────────────────────────────────────────┘
```

### 💡 Правила культуры Grafana

1. **Используйте переменные шаблонизации (Variables):**
   * Создавайте выпадающие списки `$environment`, `$cluster`, `$service`, `$node` с возможностью `Include All`.
   * Настраивайте цепочки зависимостей (Chained Variables), чтобы при выборе кластера `prod-eu` список нод фильтровался автоматически:
     `label_values(node_cpu_seconds_total{cluster="$cluster"}, instance)`.
2. **Единицы измерения (Units):**
   * Всегда явно указывайте единицы: `bytes (IEC)`, `milliseconds (ms)`, `requests/sec (rps)`, `percent (0-100)`. График без единиц измерения вводит дежурного в заблуждение!
3. **Цветовые пороги (Thresholds):**
   * Зеленый (OK: <70%), Желтый (Warning: 70–85%), Красный (Critical: >85%).
4. **Dashboard as Code (Provisioning):**
   * Храните JSON-модели дашбордов в Git и автоматически загружайте их через файлы провижининга `/etc/grafana/provisioning/dashboards/dashboards.yaml`.

---

## 🚫 6. Таблица антипаттернов в Prometheus & Grafana

| ❌ Антипаттерн | Почему это плохо | ✅ Как делать правильно |
| :--- | :--- | :--- |
| Использование `irate()` в алертах | Кратковременный всплеск на 1 секунду вызывает ложное срабатывание и шквал звонков ночью. | В алертах использовать **только `rate()`**. |
| Слишком частый интервал опроса `scrape_interval: 1s` | Увеличивает размер TSDB в 15 раз, перегружает CPU серверов и сеть. | Использовать стандартные `15s` или `30s`. |
| Игнорирование `metric_relabel_configs` | Экспортеры присылают тысячи ненужных внутренних метрик Go/Python, забивая память. | Дропать ненужные префиксы метрик через `action: drop`. |
| Отсутствие проверки `absent()` | Если сервис упал и перестал отдавать метрику, `rate(errors) > 5` перестанет существовать и алерт «погаснет», хотя сервис мертв. | Добавлять проверку `absent()` или проверять статус `up == 0`. |
| Хранение паролей в `datasources.yaml` в открытом виде | Утечка паролей к базам данных и Grafana Admin. | Использовать переменные окружения `$__env{DB_PASSWORD}`. |
