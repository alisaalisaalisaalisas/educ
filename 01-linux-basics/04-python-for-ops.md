# 🐍 Модуль 1.4: Python для инженера мониторинга и Ops-скриптинга

Дежурному инженеру **не нужно** учить сложные веб-фреймворки (Django, FastAPI) или глубокое ООП. 

Python нужен для **Ops-задач**, где возможностей Bash уже не хватает: сложная работа с REST API, парсинг JSON-логов, отправка алертов и выгрузка данных из систем мониторинга.

---

## 1. Когда использовать Python вместо Bash?

* **Bash идеален для:** простых однострочников, управления файлами, пайплайнов из утилит (`grep | awk | sort`), запуска процессов.
* **Python незаменим для:**
  * Работы со структурированными данными (**JSON, YAML**).
  * Сложных HTTP-запросов к API с авторизацией, ретраями и тайм-аутами.
  * Написания Telegram-ботов для дежурной смены.
  * Опроса API Prometheus, Zabbix, GitLab, Jira.

---

## 2. Базовая гигиена: Виртуальное окружение (`venv`)

Никогда не ставь пакеты через `pip install` глобально в систему:

```bash
# 1. Создать изолированное виртуальное окружение
python3 -m venv .venv

# 2. Активировать окружение
source .venv/bin/activate       # Linux / macOS
# .venv\Scripts\activate       # Windows PowerShell

# 3. Установить нужные библиотеки
pip install requests psutil

# 4. Сохранить список зависимостей
pip freeze > requirements.txt

# 5. Деактивировать окружение после работы
deactivate
```

---

## 3. Топ библиотек для Ops-инженера

| Библиотека | Для чего нужна | Пример применения |
| :--- | :--- | :--- |
| `requests` | HTTP-клиент | Проверка эндпоинтов, работа с API систем |
| `json` | Встроенный модуль JSON | Парсинг ответов API и структурированных логов |
| `psutil` | Системные метрики хоста | Снятие CPU, RAM, дисков, процессов кроссплатформенно |
| `subprocess` | Запуск команд ОС | Безопасный вызов CLI-утилит из Python |
| `os` / `pathlib` | Работа с путями и файлами | Проверка наличия файлов, чтение переменных окружения |

---

## 4. Готовые боевые скрипты для работы и резюме

### 🛠️ Скрипт 1: Healthcheck API с проверкой JSON-ответа и времени
```python
#!/usr/bin/env python3
import requests
import sys

URL = "https://api.example.com/v1/health"
TIMEOUT_SECONDS = 3.0

try:
    response = requests.get(URL, timeout=TIMEOUT_SECONDS)
    elapsed_ms = round(response.elapsed.total_seconds() * 1000, 2)
    
    # Проверяем HTTP статус-код
    if response.status_code != 200:
        print(f"🚨 АЛЕРТ: Эндпоинт {URL} вернул статус {response.status_code}")
        sys.exit(1)
        
    # Проверяем тело JSON-ответа
    data = response.json()
    if data.get("status") != "ok":
        print(f"🚨 АЛЕРТ: Сервис не в порядке. Ответ: {data}")
        sys.exit(1)
        
    print(f"✅ Сервис доступен. Время ответа: {elapsed_ms} мс")

except requests.exceptions.Timeout:
    print(f"🚨 ТАЙМ-АУТ: Сервис не ответил за {TIMEOUT_SECONDS} сек!")
    sys.exit(2)
except requests.exceptions.ConnectionError:
    print(f"🚨 ОШИБКА: Не удалось подключиться к {URL} (Хост недоступен / сброс соединения)")
    sys.exit(3)
```

---

### 🛠️ Скрипт 2: Опрос Prometheus HTTP API (Запрос метрики)
Дежурный может написать скрипт, забирающий текущее значение любой метрики из Prometheus:

```python
#!/usr/bin/env python3
import requests

PROMETHEUS_URL = "http://localhost:9090/api/v1/query"
QUERY = '100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)'

response = requests.get(PROMETHEUS_URL, params={"query": QUERY})
data = response.json()

if data.get("status") == "success":
    results = data["data"]["result"]
    for item in results:
        instance = item["metric"].get("instance", "unknown")
        cpu_usage = round(float(item["value"][1]), 2)
        print(f"Хост: {instance} | Загрузка CPU: {cpu_usage}%")
        if cpu_usage > 85:
            print(f"   ⚠️ Внимание: Высокая нагрузка CPU на {instance}!")
else:
    print("Ошибка выполнения PromQL запроса:", data)
```

---

### 🛠️ Скрипт 3: Отправка форматированного алерта в Telegram
```python
#!/usr/bin/env python3
import requests
import os

BOT_TOKEN = os.getenv("TG_BOT_TOKEN", "123456789:ABCDefGhIJKlmNoPQRsTUVwxyZ")
CHAT_ID = os.getenv("TG_CHAT_ID", "-1001234567890")

def send_alert(title: str, message: str, severity: str = "WARNING"):
    emoji = "🔥" if severity == "CRITICAL" else "⚠️"
    text = (
        f"{emoji} <b>[{severity}] {title}</b>\n\n"
        f"<b>Описание:</b> {message}\n"
        f"<b>Источник:</b> Python Health Monitor"
    )
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": CHAT_ID,
        "text": text,
        "parse_mode": "HTML"
    }
    resp = requests.post(url, json=payload, timeout=5)
    return resp.status_code == 200

if __name__ == "__main__":
    send_alert("High Error Rate", "Процент 502 ошибок на api.example.com превысил 15%", "CRITICAL")
```

---

### 🛠️ Скрипт 4: Мониторинг системных ресурсов хоста через `psutil`
```python
#!/usr/bin/env python3
import psutil

# 1. CPU
cpu_percent = psutil.cpu_percent(interval=1)

# 2. Память
mem = psutil.virtual_memory()
mem_used_percent = mem.percent

# 3. Диск
disk = psutil.disk_usage('/')
disk_used_percent = disk.percent

print(f"CPU: {cpu_percent}% | RAM: {mem_used_percent}% | Root Disk: {disk_used_percent}%")

if disk_used_percent > 90:
    print("🚨 КРИТИЧНО: Свободное место на диске меньше 10%!")
```

---

### 🛠️ Скрипт 5: Парсер логов с поиском ошибок
```python
#!/usr/bin/env python3
from collections import Counter

LOG_FILE = "/var/log/nginx/access.log"
status_counter = Counter()

with open(LOG_FILE, "r", encoding="utf-8") as f:
    for line in f:
        parts = line.split()
        if len(parts) >= 9:
            status_code = parts[8] # Позиция статус-кода в стандартном combined логе
            if status_code.startswith(("4", "5")):
                status_counter[status_code] += 1

print("📊 Статистика ошибок в логе:")
for code, count in status_counter.most_common():
    print(f"Статус HTTP {code}: {count} раз")
```

---

## 🎯 Что нужно уметь на собеседовании по Python:
1. Понимать базовые типы данных: строки (`str`), списки (`list`), словари (`dict`).
2. Уметь открыть и прочитать файл построчно (`with open(...) as f:`).
3. Уметь сделать GET/POST запрос библиотекой `requests` с обработкой исключений (`try...except`).
4. Уметь распарсить JSON строку (`json.loads()`) или JSON-ответ API (`response.json()`).
