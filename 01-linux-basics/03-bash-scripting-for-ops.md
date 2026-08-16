# 📜 Модуль 1.3: Bash-скриптинг и автоматизация для дежурного инженера

Дежурному инженеру не нужно писать сложные программы, но он **обязан уметь писать утилитарные скрипты** для проверок, очистки и уведомлений.

---

## 1. Базовый шаблон скрипта (`template.sh`)

Каждый скрипт должен начинаться с shebang и безопасных флагов:

```bash
#!/usr/bin/env bash
# -e : остановить выполнение при ошибке любой команды
# -u : считать ошибкой использование необъявленных переменных
# -o pipefail : учитывать ошибки внутри пайплайнов (cat file | grep text)
set -euo pipefail

echo "Скрипт запущен: $(date '+%Y-%m-%d %H:%M:%S')"
```

---

## 2. Готовые боевые скрипты (Часто просят написать на собеседовании)

### Скрипт 1: Проверка доступности сайта (HTTP Healthcheck)
Проверяет код ответа сайта и шлет алерт, если сайт отдает не 200 OK.

```bash
#!/usr/bin/env bash
TARGET_URL="https://example.com/health"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$TARGET_URL" || echo "000")

if [ "$HTTP_CODE" -ne 200 ]; then
    echo "🚨 ВНИМАНИЕ: Сервис $TARGET_URL недоступен! Код ответа: $HTTP_CODE"
    # Здесь можно вызвать функцию отправки в Telegram
    exit 1
else
    echo "✅ Сервис $TARGET_URL работает корректно (Код: $HTTP_CODE)"
    exit 0
fi
```

---

### Скрипт 2: Отправка сообщения в Telegram через Webhook

```bash
#!/usr/bin/env bash
BOT_TOKEN="123456789:ABCDefGhIJKlmNoPQRsTUVwxyZ"
CHAT_ID="-1001234567890"
MESSAGE="🔥 <b>Алерт с сервера $(hostname)</b>: Высокая нагрузка CPU!"

send_telegram() {
    local text="$1"
    curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
        -d "chat_id=${CHAT_ID}" \
        -d "text=${text}" \
        -d "parse_mode=HTML" > /dev/null
}

send_telegram "$MESSAGE"
```

---

### Скрипт 3: Контроль свободного места на диске

```bash
#!/usr/bin/env bash
THRESHOLD=90 # Порог срабатывания в процентах
CURRENT_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')

if [ "$CURRENT_USAGE" -gt "$THRESHOLD" ]; then
    echo "⚠️ Критическое заполнение диска: ${CURRENT_USAGE}% (Порог: ${THRESHOLD}%)"
else
    echo "Диск в норме: ${CURRENT_USAGE}%"
fi
```

---

### Скрипт 4: Ротация и очистка старых логов

```bash
#!/usr/bin/env bash
LOG_DIR="/var/log/my-app"
DAYS_TO_KEEP=7

echo "Очистка логов старше $DAYS_TO_KEEP дней в $LOG_DIR..."
find "$LOG_DIR" -type f -name "*.log" -mtime +"$DAYS_TO_KEEP" -exec rm -f {} \;
echo "Очистка завершена."
```

---

## 3. Планировщик задач Cron (`crontab`)

Запуск скриптов по расписанию:

```bash
# Открыть редактор cron текущего пользователя
crontab -e

# Просмотреть текущие задачи
crontab -l
```

### Синтаксис Cron:
```
* * * * * команда
| | | | |
| | | | +----- День недели (0-7, 0 и 7 = Воскресенье)
| | | +------- Месяц (1-12)
| | +--------- Число месяца (1-31)
| +----------- Час (0-23)
+------------- Минута (0-59)
```

**Примеры:**
* `*/5 * * * * /opt/scripts/healthcheck.sh >> /var/log/health.log 2>&1` — каждые 5 минут.
* `0 3 * * * /opt/scripts/clean_logs.sh` — каждый день в 03:00 ночи.
* `0 0 * * 1 /opt/scripts/weekly_backup.sh` — каждый понедельник в полночь.
