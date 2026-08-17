# 📦 Модуль 5.2: Docker Compose: Манифесты, Healthchecks и Best Practices

**Docker Compose** — это инструмент для декларативного описания и оркестрации многоконтейнерных приложений (Web + API + DB + Cache + Monitoring) в едином файле `compose.yaml`.

---

## 📐 1. Современный стандарт Compose Specification

> 💡 **Правило культуры (2024–2026):** Директива `version: '3.8'` в начале файла официально **устарела (deprecated)**. Современный Docker Compose (v2.x+) использует стандарт **Compose Specification** и файл по умолчанию называется `compose.yaml` (или `docker-compose.yml` для обратной совместимости). Указание `version` больше не требуется.

### Структура верхнего уровня `compose.yaml`:
```yaml
services:  # Контейнеры и микросервисы приложения
networks:  # Изолированные виртуальные сети
volumes:   # Постоянные хранилища данных (Persistent Storage)
secrets:   # Защищенные файлы с паролями/сертификатами
configs:   # Статические конфигурационные файлы (nginx.conf, prometheus.yml)
```

---

## 🚀 2. Эталонный Production-Ready манифест `compose.yaml`

Ниже представлен образец высококультурного манифеста трехуровневого приложения с проверками здоровья (`healthcheck`), умными зависимостями (`service_healthy`), лимитами ресурсов и сетевой изоляцией:

```yaml
# Extension-поле для переиспользования общих настроек логирования (DRY)
x-logging: &default-logging
  driver: "json-file"
  options:
    max-size: "20m"
    max-file: "5"

services:
  # -------------------------------------------------------------
  # 1. Reverse Proxy / Frontend Gateway
  # -------------------------------------------------------------
  gateway:
    image: nginx:1.25-alpine
    container_name: app_gateway
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/certs:/etc/nginx/certs:ro
    depends_on:
      api:
        condition: service_healthy
    networks:
      - frontend_net
    logging: *default-logging
    deploy:
      resources:
        limits:
          cpus: '0.50'
          memory: 256M

  # -------------------------------------------------------------
  # 2. Backend API Service
  # -------------------------------------------------------------
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: runner
    image: my-company/backend-api:1.4.2
    container_name: backend_api
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 4000
      DATABASE_URL: postgres://app_user:${DB_PASSWORD}@postgres:5432/app_production
      REDIS_URL: redis://redis:6379/0
    env_file:
      - .env
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:4000/healthz"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 20s
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - frontend_net
      - backend_net
    logging: *default-logging
    deploy:
      resources:
        limits:
          cpus: '1.50'
          memory: 1024M
        reservations:
          cpus: '0.25'
          memory: 256M

  # -------------------------------------------------------------
  # 3. База данных PostgreSQL
  # -------------------------------------------------------------
  postgres:
    image: postgres:16.2-alpine3.19
    container_name: postgres_db
    restart: always
    environment:
      POSTGRES_DB: app_production
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app_user -d app_production"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    networks:
      - backend_net
    logging: *default-logging
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2048M

  # -------------------------------------------------------------
  # 4. In-Memory Кэш Redis
  # -------------------------------------------------------------
  redis:
    image: redis:7.2-alpine
    container_name: redis_cache
    restart: unless-stopped
    command: ["redis-server", "--appendonly", "yes", "--requirepass", "${REDIS_PASSWORD}"]
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3
    networks:
      - backend_net
    logging: *default-logging

# =============================================================
# Сетевая топология: изоляция периметров (Zero Trust)
# =============================================================
networks:
  frontend_net:
    driver: bridge
  backend_net:
    internal: true # internal: true запрещает прямой доступ наружу в Интернет из БД

# =============================================================
# Постоянные дисковые тома (Named Volumes)
# =============================================================
volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

# =============================================================
# Секреты
# =============================================================
secrets:
  db_password:
    file: ./secrets/db_password.txt
```

---

## 🧠 3. Ключевые концепции и культура настройки

### 1. Умные зависимости: `depends_on` + `condition: service_healthy`
* **Проблема новичков:** Классический `depends_on: [postgres]` лишь ждет создания контейнера БД. Но процесс PostgreSQL внутри еще 5–10 секунд инициализирует таблицы и отклоняет соединения! Приложение запускается, получает `Connection refused` и падает в `CrashLoop`.
* **Правильное решение:**
  1. Описать проверку работоспособности `healthcheck` в сервисе БД.
  2. В зависимом сервисе указать `condition: service_healthy`.

### 2. Параметры `healthcheck`:
* `interval`: с какой частотой выполнять проверку (например, раз в 15 секунд).
* `timeout`: максимальное время ожидания ответа от скрипта/эндпоинта.
* `retries`: количество неудачных попыток подряд, после которых контейнер получает статус `unhealthy`.
* `start_period`: время на холодный старт (приложение разогревается, JVM стартует), в течение которого ошибки проверки не переводят контейнер в `unhealthy`.

### 3. Сетевая изоляция (`internal: true`)
* База данных `postgres` и кэш `redis` **НЕ должны быть доступны из публичной сети**.
* Наружу выставляются только порты `gateway` (Nginx).
* Флаг `internal: true` на уровне сети `backend_net` блокирует любой внешний трафик, предотвращая случайную публикацию порта СУБД наружу.

### 4. Политики перезапуска (`restart`)
* `no` — никогда не перезапускать (подходит для временных задач и миграций).
* `always` — перезапускать всегда (даже если Docker демон перезапустился после ребута сервера).
* `unless-stopped` — перезапускать всегда, кроме случаев, когда администратор явно выполнил `docker stop`. **(Рекомендованный дефолт)**.
* `on-failure` — перезапускать только при ненулевом коде завершения.

---

## 🛠️ 4. Командная строка Docker Compose

```bash
# 1. Валидация синтаксиса и проверка подстановки переменных
docker compose config

# 2. Сборка образов и фоновый запуск
docker compose up -d --build

# 3. Просмотр статуса с отображением healthcheck
docker compose ps

# 4. Просмотр логов конкретного сервиса с отслеживанием
docker compose logs -f --tail=100 api

# 5. Перезапуск сервиса с применением изменений в конфиге
docker compose restart gateway

# 6. Выполнение разовой команды внутри сервиса (например, миграция БД)
docker compose exec api npm run db:migrate

# 7. Запуск одноразового вспомогательного контейнера (Run)
docker compose run --rm api npm test

# 8. Корректная остановка без удаления данных
docker compose down

# 9. Полное удаление проекта ВМЕСТЕ с дисковыми томами (ВНИМАНИЕ: удалит базу данных!)
docker compose down -v --remove-orphans
```

---

## 🚫 5. Таблица антипаттернов в Docker Compose

| ❌ Антипаттерн | Почему это опасно | ✅ Как делать правильно |
| :--- | :--- | :--- |
| `ports: ["5432:5432"]` для базы данных в прод-манифесте | Порт СУБД торчит наружу на весь Интернет, создавая угрозу брутфорса. | Использовать внутренние сети Compose `expose:` или прятать в `backend_net`. |
| Хранение паролей в `environment:` открытым текстом в Git | Утечка учетных данных в репозиторий. | Использовать переменные окружения из `.env` (в `.gitignore`) или `secrets:`. |
| Использование bind mounts `./data:/var/lib/postgresql/data` на хосте | Проблемы с правами доступа (`permission denied`), низкая скорость I/O на macOS/Windows. | Использовать Named Volumes (`postgres_data:`). |
| Отсутствие лимитов памяти (`deploy.resources.limits`) | Один упавший сервис с утечкой памяти вызовет падение всего сервера через OOM Killer. | Всегда задавать `limits.memory` и `limits.cpus`. |
| Логи без ротации | Логи контейнеров забивают 100% корневого раздела сервера (`/var/lib/docker`). | Настраивать драйвер логирования с `max-size: "20m"` и `max-file: "5"`. |
