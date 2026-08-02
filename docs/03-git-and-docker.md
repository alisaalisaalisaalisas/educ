# 3. Git, Docker и Контейнеризация

---

## Git и GitLab

### Git

**Git** — распределённая система контроля версий для отслеживания изменений в коде.

#### Основные команды

```bash
# Инициализация и клонирование
git init                          # Новый репозиторий
git clone git@gitlab.local:user/repo.git  # Клонирование

# Повседневная работа
git status                        # Состояние рабочей директории
git add .                         # Добавить все изменения в индекс
git commit -m "feat: add login"   # Зафиксировать изменения
git push origin main              # Отправить на сервер
git pull origin main              # Получить изменения

# Ветвление
git branch feature/auth           # Создать ветку
git checkout feature/auth         # Переключиться на ветку
git checkout -b feature/auth      # Создать и переключиться
git merge feature/auth            # Слияние ветки в текущую

# Просмотр истории
git log --oneline --graph -10     # Компактная история
git diff HEAD~1                   # Изменения последнего коммита
git blame file.py                 # Кто менял каждую строку
```

#### Модель ветвления (Git Flow)

```
main ──────●──────────────●──────────── (продакшн)
            \            /
develop ─────●──●──●──●──●──────────── (разработка)
              \      /
feature/auth ──●──●── ──────────────── (фича-ветка)
```

### GitLab

**GitLab** — платформа DevOps, объединяющая Git-хостинг, CI/CD, реестр контейнеров, управление проектами.

| Функция | Описание |
|---|---|
| **Repositories** | Git-репозитории с веб-интерфейсом |
| **Merge Requests** | Code review и обсуждение изменений |
| **CI/CD** | Встроенные пайплайны (`.gitlab-ci.yml`) |
| **Container Registry** | Хранилище Docker-образов |
| **Issue Tracker** | Управление задачами |
| **Wiki** | Документация проекта |
| **Runners** | Агенты, выполняющие CI/CD-задачи |

```yaml
# Пример .gitlab-ci.yml
stages:
  - build
  - test
  - deploy

build:
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

test:
  stage: test
  image: python:3.12
  script:
    - pip install -r requirements.txt
    - pytest tests/

deploy:
  stage: deploy
  script:
    - echo "Deploying version $CI_COMMIT_SHA"
  only:
    - main
```

---

## Docker

**Docker** — платформа контейнеризации, позволяющая упаковывать приложения со всеми зависимостями в изолированные контейнеры.

### Ключевые концепции

| Концепция | Описание |
|---|---|
| **Image** (Образ) | Неизменяемый шаблон с ОС, зависимостями и приложением |
| **Container** (Контейнер) | Запущенный экземпляр образа |
| **Dockerfile** | Инструкции по сборке образа |
| **Registry** | Хранилище образов (Docker Hub, GitLab Registry) |
| **Volume** | Постоянное хранилище данных |
| **Network** | Виртуальная сеть между контейнерами |
| **Docker Compose** | Оркестрация нескольких контейнеров через YAML |

### Основные команды

```bash
# Работа с образами
docker build -t myapp:1.0 .       # Сборка образа
docker pull nginx:alpine            # Скачать образ
docker images                       # Список образов
docker rmi myapp:1.0                # Удалить образ

# Работа с контейнерами
docker run -d -p 8080:80 --name web nginx:alpine   # Запуск
docker ps                           # Запущенные контейнеры
docker ps -a                        # Все контейнеры
docker logs -f web                  # Логи в реальном времени
docker exec -it web sh              # Войти внутрь контейнера
docker stop web                     # Остановить
docker rm web                       # Удалить

# Управление ресурсами
docker system prune -a              # Очистка неиспользуемого
docker volume ls                    # Список томов
docker network ls                   # Список сетей
```

### Dockerfile — пример

```dockerfile
# Многоэтапная сборка (multi-stage build)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
USER node
CMD ["node", "dist/server.js"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: "3.9"

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/app
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build: ./frontend
    ports:
      - "8080:80"

  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: app
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  pgdata:
```

### Лучшие практики

1. **Минимальные базовые образы** — используйте `alpine` варианты
2. **Multi-stage builds** — уменьшение размера финального образа
3. **Не запускайте от root** — используйте `USER node`
4. **`.dockerignore`** — исключайте `node_modules`, `.git`, логи
5. **Один процесс на контейнер** — разделяйте ответственность
6. **Фиксируйте версии** — `nginx:1.25-alpine` вместо `nginx:latest`
