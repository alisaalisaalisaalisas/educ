# 🚨 Модуль 3.3: Alertmanager: Культура правил алертов, Роутинг, Ингибирование и Шаблоны

**Alertmanager** — централизованный шлюз обработки событий тревог от Prometheus. Он отвечает за **дедупликацию**, **группировку пачек алертов**, **подавление шума (ингибирование)**, **заглушки (silences)** и **маршрутизацию уведомлений** в каналы связи (Telegram, Slack, PagerDuty, Webhooks).

---

## 🏗️ 1. Жизненный цикл алерта

```text
  [ Prometheus: evaluation_interval ]
                 │
                 ▼
       (Expr == true) ➔ Состояние PENDING (таймер 'for: 5m')
                 │
           (Таймер истек)
                 │
                 ▼
      Состояние FIRING ────(Отправка JSON по HTTP)────► Alertmanager
                                                             │
                                   ┌─────────────────────────┴─────────────────────────┐
                                   ▼                                                   ▼
                       1. Проверка Silences (Заглушки)                      2. Inhibit Rules (Подавление)
                                   │                                                   │
                                   └─────────────────────────┬─────────────────────────┘
                                                             ▼
                                                3. Группировка (group_wait)
                                                             │
                                                             ▼
                                                4. Роутинг в Telegram / Slack
```

---

## 📜 2. Культура написания правил алертов (`rules.yml`)

Каждое правило алерта в команде должно отвечать жестким стандартам качества:

* **Обязательные labels:** `severity` (`critical`, `warning`, `info`), `team` (кто владелец), `tier` (`frontend`, `backend`, `database`).
* **Обязательные annotations:** `summary` (суть проблемы в 1 строке), `description` (детали со значениями метрик), `runbook_url` (ссылка на пошаговую инструкцию по устранению), `dashboard_url` (ссылка на график в Grafana).
* **Обязательный интервал `for:`** (защита от кратковременного шума и дребезга).

---

## 🚀 3. Золотой банк Production-алертов (`alerts.yml`)

```yaml
groups:
  - name: production_infrastructure_alerts
    rules:
      # ---------------------------------------------------------
      # 1. Сервер или сервис полностью недоступен (CRITICAL)
      # ---------------------------------------------------------
      - alert: InstanceDown
        expr: up == 0
        for: 2m
        labels:
          severity: critical
          tier: infrastructure
          team: ops
        annotations:
          summary: "🚨 Хост {{ $labels.instance }} недоступен!"
          description: "Экспортер на {{ $labels.instance }} (job {{ $labels.job }}) не отвечает более 2 минут."
          runbook_url: "https://wiki.example.com/runbooks/host-down"
          dashboard_url: "https://grafana.example.com/d/nodes?var-instance={{ $labels.instance }}"

      # ---------------------------------------------------------
      # 2. Высокая утилизация CPU (WARNING)
      # ---------------------------------------------------------
      - alert: HostHighCpuLoad
        expr: (100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)) > 85
        for: 10m
        labels:
          severity: warning
          tier: infrastructure
          team: ops
        annotations:
          summary: "⚠️ Высокая нагрузка CPU на {{ $labels.instance }}"
          description: "Нагрузка CPU превышает 85% в течение 10 минут. Текущая загрузка: {{ $value | printf \"%.2f\" }}%."
          runbook_url: "https://wiki.example.com/runbooks/high-cpu"

      # ---------------------------------------------------------
      # 3. Угроза OOM (Нехватка оперативной памяти) (CRITICAL)
      # ---------------------------------------------------------
      - alert: HostOutOfMemoryDanger
        expr: (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes * 100) < 10
        for: 3m
        labels:
          severity: critical
          tier: infrastructure
          team: ops
        annotations:
          summary: "🔥 Критически мало RAM на {{ $labels.instance }}"
          description: "Свободной оперативной памяти осталось менее 10%! Текущий остаток: {{ $value | printf \"%.2f\" }}%."
          runbook_url: "https://wiki.example.com/runbooks/oom-troubleshooting"

      # ---------------------------------------------------------
      # 4. Прогнозирование переполнения диска менее чем за 4 часа (CRITICAL)
      # ---------------------------------------------------------
      - alert: DiskFillIn4Hours
        expr: (predict_linear(node_filesystem_free_bytes{mountpoint="/"}[2h], 4 * 3600) < 0)
          and ((node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"} * 100) < 20)
        for: 5m
        labels:
          severity: critical
          tier: infrastructure
          team: ops
        annotations:
          summary: "💾 Диск {{ $labels.mountpoint }} на {{ $labels.instance }} заполнится через 4 часа!"
          description: "Скорость записи критическая. При сохранении текущего темпа свободное место закончится менее чем за 4 часа."
          runbook_url: "https://wiki.example.com/runbooks/disk-cleanup"

      # ---------------------------------------------------------
      # 5. Истечение срока действия SSL-сертификата (< 14 дней) (WARNING)
      # ---------------------------------------------------------
      - alert: SSLCertificateExpiringSoon
        expr: (probe_ssl_earliest_cert_expiry - time()) / 86400 < 14
        for: 1h
        labels:
          severity: warning
          tier: security
          team: devops
        annotations:
          summary: "🔒 Истекает SSL-сертификат для {{ $labels.instance }}"
          description: "Срок действия SSL-сертификата истекает через {{ $value | printf \"%.0f\" }} дней."
          runbook_url: "https://wiki.example.com/runbooks/ssl-renewal"

      # ---------------------------------------------------------
      # 6. Всплеск 5xx ошибок в HTTP API (CRITICAL)
      # ---------------------------------------------------------
      - alert: HttpApi5xxRateHigh
        expr: ((sum by(service) (rate(http_requests_total{status=~"5.."}[5m]))
          / sum by(service) (rate(http_requests_total[5m]))) * 100) > 2
        for: 3m
        labels:
          severity: critical
          tier: backend
          team: backend-devs
        annotations:
          summary: "💥 Всплеск 5xx ошибок в сервисе {{ $labels.service }}"
          description: "Доля пятисотых ошибок превышает 2% от общего трафика! Текущий уровень: {{ $value | printf \"%.2f\" }}%."
          runbook_url: "https://wiki.example.com/runbooks/5xx-investigation"
```

---

## 🛠️ 4. Эталонный конфиг Alertmanager (`alertmanager.yml`)

```yaml
global:
  resolve_timeout: 5m

# Шаблоны оформления сообщений
templates:
  - '/etc/alertmanager/templates/*.tmpl'

# Корневое дерево маршрутизации
route:
  group_by: ['alertname', 'cluster', 'service', 'tier']
  group_wait: 30s        # Ожидание 30с для сбора пачки связанных алертов
  group_interval: 5m     # Интервал отправки обновлений по сгруппированным алертам
  repeat_interval: 4h    # Повторить алерт через 4 часа, если проблема НЕ решена
  receiver: 'telegram-default-ops'

  # Дочерние специфичные маршруты
  routes:
    # 1. Критические алерты отправляются дежурным немедленно
    - match:
        severity: critical
      receiver: 'telegram-urgent-critical'
      continue: true # continue: true позволяет провалиться дальше в другие ветки

    # 2. Алерты бэкенд-сервисов роутятся в чат разработчиков
    - match:
        tier: backend
      receiver: 'slack-backend-team'

# =============================================================
# Ингибирование (Подавление каскадного шума)
# =============================================================
inhibit_rules:
  # Если лежит весь хост (InstanceDown), глушить все остальные алерты по этому хосту
  - source_match:
      alertname: 'InstanceDown'
    target_match_re:
      alertname: '(HostHighCpuLoad|HostOutOfMemoryDanger|DiskFillIn4Hours)'
    equal: ['instance']

# =============================================================
# Получатели (Receivers)
# =============================================================
receivers:
  # Канал дежурных (Telegram с форматированием HTML)
  - name: 'telegram-urgent-critical'
    telegram_configs:
      - bot_token: '123456789:AAExampleBotTokenString'
        chat_id: -1001234567890
        send_resolved: true # Оповещение об успешном решении проблемы (RESOLVED)
        parse_mode: 'HTML'
        message: |
          {{ if eq .Status "firing" }}🔥 <b>КРИТИЧЕСКАЯ АВАРИЯ [FIRING:{{ .Alerts.Firing | len }}]</b>{{ else }}✅ <b>АВАРИЯ УСТРАНЕНА [RESOLVED]</b>{{ end }}

          {{ range .Alerts }}
          <b>Алерт:</b> {{ .Labels.alertname }}
          <b>Сервис / Хост:</b> <code>{{ .Labels.instance }}{{ .Labels.service }}</code>
          <b>Важность:</b> {{ .Labels.severity | toUpper }}
          <b>Суть:</b> {{ .Annotations.summary }}
          <b>Детали:</b> {{ .Annotations.description }}
          {{ if .Annotations.runbook_url }}📖 <a href="{{ .Annotations.runbook_url }}">Инструкция (Runbook)</a>{{ end }}
          {{ if .Annotations.dashboard_url }}📊 <a href="{{ .Annotations.dashboard_url }}">График в Grafana</a>{{ end }}
          ──────────────────
          {{ end }}

  - name: 'telegram-default-ops'
    telegram_configs:
      - bot_token: '123456789:AAExampleBotTokenString'
        chat_id: -1009876543210
        send_resolved: true
        parse_mode: 'HTML'
        message: "ℹ️ <b>{{ .Status | toUpper }}</b>: {{ .CommonAnnotations.summary }}"

  - name: 'slack-backend-team'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/T00/B00/XXXX'
        channel: '#backend-alerts'
        send_resolved: true
```

---

## 🔇 5. Управление заглушками (Silences) и утилита `amtool`

### Зачем нужны Silences

Когда на продакшене проводятся плановые регламентные работы (Rolling Upgrade нод, перезагрузка БД, миграции), мониторинг глушат на 1–2 часа, чтобы чаты не разрывало от ложных уведомлений.

```bash
# -------------------------------------------------------------
# Использование консольной утилиты amtool
# -------------------------------------------------------------
# 1. Просмотр списка активных алертов
amtool alert --alertmanager.url=http://localhost:9093

# 2. Создание заглушки на 2 часа для хоста web-01
amtool silence add instance="web-01.prod.lan" \
  --duration=2h \
  --author="Ivan DevOps" \
  --comment="Плановое обновление ядра Linux (TASK-4021)" \
  --alertmanager.url=http://localhost:9093

# 3. Просмотр активных заглушек
amtool silence query --alertmanager.url=http://localhost:9093

# 4. Досрочное снятие заглушки по ID
amtool silence expire <silence_id> --alertmanager.url=http://localhost:9093

# 5. Проверка синтаксиса конфига Alertmanager
amtool check-config /etc/alertmanager/alertmanager.yml
```

---

## 🚫 6. Таблица антипаттернов в алертинге

| ❌ Антипаттерн | Почему это опасно | ✅ Как делать правильно |
| :--- | :--- | :--- |
| Алерт без ссылки на `runbook_url` | Дежурный ночью тратит 30 минут на поиск документации вместо быстрого фикса. | К каждому алерту прикреплять ссылку на страницу вики с шагами диагностики. |
| Отсутствие флага `send_resolved: true` | Дежурные не знают, решилась ли проблема, и продолжают паниковать. | Всегда отправлять зеленый статус `RESOLVED`. |
| Слишком короткий `repeat_interval: 5m` | Каждые 5 минут чат бомбардируется сотнями сообщений, пока идет починка. | Ставить `repeat_interval: 2h` или `4h`. |
| Отсутствие правил `inhibit_rules` | При падении коммутатора или гипервизора дежурные получают 300 алертов по каждому контейнеру. | Настраивать ингибирование зависимых алертов от `InstanceDown`. |
| Отправка всех алертов в один общий чат | Шум и хаос; разработчики отключают звук в канале («мьютят» чат). | Маршрутизировать алерты по `tier` и `team` в целевые каналы. |
