# 📦 Модуль 5.2: Docker Compose: запуск сервисов одной командой

`docker-compose` позволяет описывать многоконтейнерные приложения (веб-сервер + бэкенд + БД + мониторинг) в одном YAML-файле.

---

## 1. Базовый синтаксис `docker-compose.yml`

```yaml
version: '3.8'

services:
  web:
    image: nginx:alpine
    container_name: web_server
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    restart: always

  redis:
    image: redis:7-alpine
    container_name: redis_cache
    restart: unless-stopped
    ports:
      - "6379:6379"
```

---

## 2. Основные команды `docker compose`

```bash
# 1. Запустить все сервисы в фоновом режиме (detached)
docker compose up -d

# 2. Посмотреть статус сервисов
docker compose ps

# 3. Посмотреть объединенные логи всех сервисов
docker compose logs -f
docker compose logs -f web # Логи конкретного сервиса

# 4. Перезапустить один сервис после изменения конфига
docker compose restart web

# 5. Остановить и удалить контейнеры, сети
docker compose down

# 6. Остановить и удалить вместе с volumes (дисками данных)
docker compose down -v
```

---

## 3. Сети и тома (Networks & Volumes)

* **Volumes (Тома):** Сохраняют данные базы данных при перезапуске или удалении контейнера.
* **Networks:** Все сервисы в одном `docker-compose.yml` по умолчанию находятся в одной внутренней сети и могут обращаться друг к другу **по имени сервиса** (например, приложение обращается к базе по хосту `postgres:5432`).
