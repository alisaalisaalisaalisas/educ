# 7. Мониторинг и Observability

---

## Prometheus

**Prometheus** — система мониторинга и алертинга с открытым исходным кодом. Собирает метрики по модели pull (сам опрашивает endpoint'ы).

### Архитектура

```
Targets (экспортёры)          Prometheus Server
┌──────────┐                 ┌─────────────────┐
│ node_exp │──┐              │  Scrape Engine  │
│ :9100    │  │   pull /metrics  │               │
├──────────┤  ├──────────────→  TSDB (хранение) │
│ app      │  │              │               │
│ :8080    │──┘              │  PromQL       │──→ Grafana
├──────────┤                 │  (запросы)    │
│ kube-    │────────────────→│               │──→ Alertmanager
│ state    │                 │  Rules        │       │
└──────────┘                 └─────────────────┘     ▼
                                               Уведомления
                                            (Slack, Email, PD)
```

### Типы метрик

| Тип | Описание | Пример |
|---|---|---|
| **Counter** | Только растёт (сбросы при рестарте) | `http_requests_total` |
| **Gauge** | Может расти и падать | `temperature_celsius`, `memory_usage_bytes` |
| **Histogram** | Распределение значений (бакеты) | `http_request_duration_seconds` |
| **Summary** | Квантили (p50, p90, p99) | `rpc_duration_seconds` |

### PromQL — примеры запросов

```promql
# Частота запросов за 5 минут (rate)
rate(http_requests_total[5m])

# Частота ошибок (%)
rate(http_requests_total{status=~"5.."}[5m])
/ rate(http_requests_total[5m]) * 100

# 95-й перцентиль задержки
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Использование CPU в процентах (Node Exporter)
100 - (avg by(instance)(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Свободная память
node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes * 100

# Топ-5 Pod по CPU
topk(5, rate(container_cpu_usage_seconds_total[5m]))
```

### Конфигурация

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alerts/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets: ["alertmanager:9093"]

scrape_configs:
  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090"]

  - job_name: "node-exporter"
    static_configs:
      - targets: ["node-exporter:9100"]

  - job_name: "kubernetes-pods"
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
```

### Правила алертинга

```yaml
# alerts/app.yml
groups:
  - name: application
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate on {{ $labels.instance }}"
          description: "Error rate is {{ $value | humanizePercentage }}"

      - alert: PodCrashLooping
        expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
        for: 5m
        labels:
          severity: warning
```

---

## Grafana

**Grafana** — платформа визуализации и аналитики. Создаёт дашборды с графиками из различных источников данных.

### Возможности

| Функция | Описание |
|---|---|
| **Dashboards** | Интерактивные панели с графиками, таблицами, heatmaps |
| **Data Sources** | Prometheus, Loki, Elasticsearch, InfluxDB, MySQL и 100+ |
| **Alerting** | Встроенная система алертов с маршрутизацией |
| **Variables** | Шаблонные переменные для динамических дашбордов |
| **Annotations** | Маркеры событий на графиках (деплои, инциденты) |
| **Provisioning** | Конфигурация через YAML (GitOps-friendly) |

### Provisioning (конфигурация как код)

```yaml
# provisioning/datasources/prometheus.yml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true

  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
```

### Основные типы панелей

- **Time Series** — графики метрик во времени
- **Stat** — одиночное значение с цветовым индикатором
- **Gauge** — спидометр с порогами
- **Table** — табличный вывод данных
- **Logs** — просмотр логов (из Loki/Elasticsearch)
- **Heatmap** — тепловая карта

---

## Zabbix

**Zabbix** — платформа мониторинга корпоративного уровня для сетей, серверов, облаков и приложений.

### Архитектура

```
Zabbix Agent (на серверах) ──→ Zabbix Server ──→ Zabbix Frontend (Web UI)
                                    │
SNMP-устройства ────────────────────┤
                                    │
IPMI / JMX ─────────────────────────┤
                                    ▼
                              База данных
                          (PostgreSQL / MySQL)
```

### Ключевые концепции

| Концепция | Описание |
|---|---|
| **Host** | Отслеживаемое устройство/сервер |
| **Item** | Конкретная метрика (CPU load, free disk) |
| **Trigger** | Условие для алерта (`{host:cpu.load.avg(5m)}>2`) |
| **Action** | Действие при срабатывании триггера (email, скрипт) |
| **Template** | Набор items/triggers для типа устройства |
| **Discovery** | Автоматическое обнаружение хостов и ресурсов |
| **Proxy** | Промежуточный узел для распределённого мониторинга |

### Zabbix Agent — конфигурация

```ini
# /etc/zabbix/zabbix_agentd.conf
Server=zabbix-server.local
ServerActive=zabbix-server.local
Hostname=web-server-01
EnableRemoteCommands=1
UserParameter=app.status,curl -s http://localhost:3000/health | jq -r '.status'
```

### Zabbix vs Prometheus

| Аспект | Zabbix | Prometheus |
|---|---|---|
| Модель | Push + Pull | Pull |
| Хранение | SQL БД | TSDB |
| Конфигурация | Web UI | YAML-файлы |
| Масштабирование | Zabbix Proxy | Federation / Thanos |
| Экосистема | Всё в одном | Модульная (Grafana, Alertmanager) |
| Сильная сторона | Инфраструктурный мониторинг | Cloud-native / Kubernetes |

---

## Loki (Grafana)

**Loki** — система агрегации логов, оптимизированная для Grafana. «Prometheus для логов» — индексирует только метаданные (labels), а не содержимое.

### Архитектура

```
Приложения / Pods
    │
    ▼
Promtail / Grafana Alloy (агенты сбора логов)
    │
    │  push logs
    ▼
Loki (хранение + индексация по labels)
    │
    │  LogQL-запросы
    ▼
Grafana (визуализация логов)
```

### LogQL — примеры запросов

```logql
# Все логи из namespace marketplace
{namespace="marketplace"}

# Логи контейнера backend с фильтром по тексту
{container="backend"} |= "error"

# Логи без debug-уровня
{app="marketplace"} != "DEBUG"

# Парсинг JSON-логов
{app="backend"} | json | status_code >= 500

# Подсчёт ошибок за 5 минут (метрика из логов)
rate({app="backend"} |= "error" [5m])

# Топ-5 эндпоинтов по количеству ошибок
topk(5, sum by(path)(rate({app="backend"} | json | status >= 500 [5m])))
```

### Promtail — конфигурация

```yaml
# promtail-config.yml
server:
  http_listen_port: 9080

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: system
    static_configs:
      - targets: [localhost]
        labels:
          job: varlogs
          __path__: /var/log/*.log

  - job_name: containers
    static_configs:
      - targets: [localhost]
        labels:
          job: containers
          __path__: /var/lib/docker/containers/*/*-json.log
```

---

## Elastic Stack (ELK)

**Elastic Stack** — набор инструментов для сбора, хранения, анализа и визуализации логов и данных.

### Компоненты

```
Источники данных
    │
    ▼
Beats (Filebeat, Metricbeat) — лёгкие агенты сбора данных
    │
    ▼
Logstash — обработка, трансформация, обогащение данных
    │
    ▼
Elasticsearch — поисковый движок, хранение и индексация
    │
    ▼
Kibana — визуализация, дашборды, поиск
```

### Компоненты подробнее

| Компонент | Роль | Описание |
|---|---|---|
| **Elasticsearch** | Хранение и поиск | Распределённый поисковый движок на основе Apache Lucene |
| **Logstash** | Обработка | Конвейер: input → filter → output |
| **Kibana** | Визуализация | Веб-интерфейс для поиска, дашбордов, алертов |
| **Beats** | Сбор данных | Filebeat (логи), Metricbeat (метрики), Packetbeat (сеть) |

### Filebeat — конфигурация

```yaml
# filebeat.yml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /var/log/nginx/access.log
    fields:
      service: nginx

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "filebeat-%{+yyyy.MM.dd}"

# Или отправка в Logstash
output.logstash:
  hosts: ["logstash:5044"]
```

### Logstash — конвейер

```ruby
# logstash.conf
input {
  beats { port => 5044 }
}

filter {
  if [fields][service] == "nginx" {
    grok {
      match => { "message" => "%{COMBINEDAPACHELOG}" }
    }
    geoip {
      source => "clientip"
    }
  }
  date {
    match => ["timestamp", "dd/MMM/yyyy:HH:mm:ss Z"]
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "logs-%{+YYYY.MM.dd}"
  }
}
```

### Elasticsearch — запросы

```json
// Поиск ошибок
GET /logs-*/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "level": "error" } },
        { "range": { "@timestamp": { "gte": "now-1h" } } }
      ]
    }
  },
  "sort": [{ "@timestamp": { "order": "desc" } }],
  "size": 50
}
```

### Loki vs Elastic Stack

| Аспект | Loki | Elastic Stack |
|---|---|---|
| Индексация | Только labels | Полнотекстовая |
| Ресурсоёмкость | Низкая | Высокая |
| Язык запросов | LogQL | KQL / Lucene |
| Интеграция | Grafana | Kibana |
| Масштабирование | Простое (S3 backend) | Сложнее (шарды, реплики) |
| Полнотекстовый поиск | Ограниченный | Мощный |
| Применение | Cloud-native, K8s | Корпоративный, аналитика |
