# 🚨 Модуль 3.3: Alertmanager: Настройка алертов и роутинг в Telegram

Alertmanager принимает алерты от Prometheus, группирует их, подавляет дубликаты и доставляет в Telegram, Slack, PagerDuty, Email или Webhook.

---

## 1. Как работают правила алертов в Prometheus

В Prometheus создаются файлы правил (`alerts.yml`):

```yaml
groups:
  - name: node_alerts
    rules:
      - alert: HostHighCpuLoad
        expr: (100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)) > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Высокая нагрузка CPU на {{ $labels.instance }}"
          description: "Нагрузка CPU превышает 85% в течение 5 минут. Текущее значение: {{ $value | printf \"%.2f\" }}%"

      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"} * 100) < 10
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Заканчивается место на диске на {{ $labels.instance }}"
          description: "Свободного места на корневом разделе меньше 10%!"
```

* `expr` — выражение PromQL.
* `for: 5m` — алерт должен висеть в состоянии **PENDING** 5 минут, прежде чем перейти в **FIRING** и уйти в Alertmanager (защита от кратковременных всплесков).

---

## 2. Конфигурация Alertmanager (`alertmanager.yml`)

```yaml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 30s        # Ждать 30с перед отправкой первого алерта (собрать пачку)
  group_interval: 5m     # Интервал повтора группы
  repeat_interval: 4h    # Повторить алерт через 4ч, если он все еще горит
  receiver: 'telegram-ops'
  routes:
    - match:
        severity: critical
      receiver: 'telegram-urgent'

receivers:
  - name: 'telegram-ops'
    telegram_configs:
      - bot_token: '123456789:ABCDefGhIJKlmNoPQRsTUVwxyZ'
        chat_id: -1001234567890
        send_resolved: true # Отправлять уведомление, когда проблема решена!
        parse_mode: 'HTML'
        message: |
          🔥 <b>{{ .Status | toUpper }}</b>: {{ .CommonAnnotations.summary }}
          <b>Описание:</b> {{ .CommonAnnotations.description }}
          <b>Важность:</b> {{ .CommonLabels.severity }}
          <b>Хост:</b> {{ .CommonLabels.instance }}

  - name: 'telegram-urgent'
    telegram_configs:
      - bot_token: '123456789:ABCDefGhIJKlmNoPQRsTUVwxyZ'
        chat_id: -1009876543210
        send_resolved: true
```

---

## 3. Silence (Заглушки) и Ингибирование (Inhibition)

* **Silence (Подавление / Мут):** Создается через Web UI Alertmanager, когда на сервере проводятся плановые техработы (Maintenance). Позволяет временно отключить уведомления на 1–2 часа, чтобы чат не спамило.
* **Inhibition Rules:** Если упал весь хост (`InstanceDown`), Alertmanager автоматически глушит алерты о падении всех отдельных сервисов на этом хосте (чтобы не получать 50 одинаковых сообщений).
