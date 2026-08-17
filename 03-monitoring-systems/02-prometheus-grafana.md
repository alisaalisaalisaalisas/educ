# 📊 Модуль 3.2: Prometheus & Grafana (PromQL, Экспортеры, Дашборды)

Prometheus + Grafana — де-факто мировой стандарт мониторинга в Cloud Native и DevOps стеке.

---

## 1. Архитектура Prometheus

* **TSDB (Time Series Database):** База данных временных рядов, оптимизированная для хранения пар `(timestamp, value)`.
* **Scrape Engine:** Модуль, который по расписанию делает HTTP GET запросы к таргетам.
* **Exporters (Экспортеры):** Утилиты, снимающие метрики с системы/БД и отдающие их в формате Prometheus:
  * `node_exporter` — метрики Linux-хоста (CPU, RAM, Disks, Network).
  * `blackbox_exporter` — синтетические проверки (пинг, HTTP эндпоинты, проверка SSL).
  * `mysqld_exporter` / `postgres_exporter` — метрики баз данных.
  * `cAdvisor` — метрики Docker-контейнеров.

---

## 2. Типы метрик в Prometheus

1. **Counter (Счетчик):** Число, которое только растет (или сбрасывается в 0 при перезапуске).
   * *Пример:* Общее число HTTP запросов `http_requests_total`.
   * Для них используют функции `rate()` или `increase()`.
2. **Gauge (Датчик):** Число, которое может расти и падать в любой момент.
   * *Пример:* Температура CPU, использование памяти `node_memory_MemAvailable_bytes`, количество активных соединений.
3. **Histogram (Гистограмма):** Распределение данных по бакетам (корзинам).
   * *Пример:* Время ответа HTTP запросов (сколько запросов уложились в <0.1с, <0.5с, <1с).
4. **Summary:** Похоже на гистограмму, но вычисляет квантили на стороне клиента.

---

## 3. Шпаргалка по PromQL (Язык запросов Prometheus)

```promql
# 1. Загрузка CPU в процентах (по всем ядрам)
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# 2. Использование оперативной памяти в %
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# 3. Свободное место на диске в %
(node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100

# 4. Скорость входящего сетевого трафика (в Мбит/с)
rate(node_network_receive_bytes_total{device="eth0"}[5m]) * 8 / 1024 / 1024

# 5. Количество HTTP запросов в секунду (RPS) с группировкой по статус-коду
sum by (status) (rate(http_requests_total[2m]))

# 6. Процент 5xx ошибок от общего объема запросов
(sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))) * 100
```

---

## 4. Grafana: Визуализация данных

* **Data Sources:** Подключение источников (Prometheus, VictoriaMetrics, Loki, PostgreSQL, Zabbix).
* **Dashboards & Panels:** Панели типов Time Series, Gauge, Stat, Table, Heatmap.
* **Variables (Переменные):** Выпадающие списки для переключения серверов (`$instance`, `$environment`, `$cluster`).
* **Import Dashboards:** Готовые официальные дашборды (например, ID `1860` для Node Exporter Full).
