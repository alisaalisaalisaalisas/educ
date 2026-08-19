# 🐙 Модуль 6.3: Git, GitLab CI/CD и GitOps для дежурного инженера

В современном мире инфраструктура, алерты Prometheus, конфиги Nginx, манифесты Kubernetes и дашборды Grafana хранятся в репозиториях (**Infrastructure as Code / GitOps**). Любое изменение и выкатка сервисов выполняются через автоматизированные пайплайны **CI/CD** (GitLab CI, GitHub Actions) и GitOps-операторы (**ArgoCD**, **Flux v2**).

Понимание работы CI/CD, раннеров, механизмов переменных и принципов GitOps — ключевой навык дежурного инженера (On-Call / SRE / Ops), так как более 70% аварий в продакшне происходят именно в момент или сразу после деплоя новой версии.

---

## 🛠️ 1. Базовые и аварийные команды Git

Git — единый источник правды (Single Source of Truth). Дежурному инженеру необходимо уметь быстро ориентироваться в истории изменений, находить виновника аварии и вносить экстренные хотфиксы.

### 📋 Шпаргалка основных операций:
```bash
# 1. Клонировать репозиторий с конфигами мониторинга/инфраструктуры
git clone https://gitlab.company.com/devops/monitoring-configs.git
cd monitoring-configs

# 2. Создать новую ветку для хотфикса или правки алертов
git checkout -b hotfix/fix-alert-rules

# 3. Проверить статус и точечный diff изменений
git status
git diff alertmanager.yml

# 4. Зафиксировать изменения с понятным сообщением (Conventional Commits)
git add alertmanager.yml
git commit -m "fix(alerts): update telegram chat id for urgent notifications"

# 5. Забрать свежие изменения из главной ветки с подтягиванием rebase
git pull --rebase origin main

# 6. Отправить ветку на сервер для создания Merge Request (MR) / Pull Request (PR)
git push origin hotfix/fix-alert-rules
```

### 🚨 Аварийные команды при расследовании инцидентов:
```bash
# Посмотреть последние 10 коммитов с именами авторов и временем
git log -n 10 --pretty=format:"%h - %an, %ar : %s"

# Узнать, кто и когда изменил конкретную строчку в файле (Поиск автора бага)
git blame -L 40,60 deployment.yaml

# Посмотреть diff между двумя релизами / тегами (Что изменилось между v1.2.0 и v1.2.1?)
git diff v1.2.0..v1.2.1 --stat
git diff v1.2.0..v1.2.1 src/database/migrations/

# Экстренно спрятать незакоммиченные локальные правки (Stash)
git stash save "wip-alert-changes"
# Вернуть спрятанные изменения позже
git stash pop

# Создать коммит отката (Revert) сломавшего коммита без переписывания истории
git revert <commit-hash>
git push origin main
```

---

## 🔄 2. Жизненный цикл доставки (CI/CD Lifecycle & GitOps)

```
[ Developer ]
      │  git push
      ▼
┌─────────────── Continuous Integration (CI) ────────────────┐
│  1. Linting & Formatting (flake8, eslint, yamllint)        │
│  2. Unit & Integration Tests (pytest, jest, go test)       │
│  3. Security Scan (SAST, SonarQube, Trivy, Secret-leak)    │
│  4. Build & Package (Docker build & push to Registry)      │
└──────────────────────────────┬─────────────────────────────┘
                               │
┌──────────────────────────────▼─────────────────────────────┐
│             Continuous Delivery / Deployment (CD)          │
│                                                            │
│  [ Staging Environment ] ──► Automated Smoke & E2E Tests   │
│            │                                               │
│            ▼ (Manual Approval or Automated GitOps)         │
│  [ Production Cluster ] ──► Rolling / Blue-Green / Canary  │
│            │                                               │
│            ▼                                               │
│  [ Health Checks & Prometheus Metric Validation ]          │
└────────────────────────────────────────────────────────────┘
```

* **CI (Continuous Integration — Непрерывная интеграция):** Автоматическая сборка, линтинг, запуск тестов и сканирование уязвимостей при каждом пуше в ветку. Цель — выявить ошибки как можно раньше (Shift-Left Security).
* **CD (Continuous Delivery — Непрерывная доставка):** Автоматизированная подготовка артефактов и деплой на тестовые окружения (Dev/Staging), где деплой в Production требует ручного подтверждения (`when: manual`).
* **CD (Continuous Deployment — Непрерывное развертывание):** Полностью автоматический деплой изменений в Production без участия человека, если все тесты и проверки пройдены.
* **GitOps (Pull-модель):** Подход, при котором агент внутри K8s-кластера (ArgoCD, Flux) постоянно синхронизирует состояние кластера с Git-репозиторием.

### 🆚 Push-модель (CI Runners) vs Pull-модель (GitOps / ArgoCD):
| Параметр | Push-модель (CI Runners) | Pull-модель (GitOps / ArgoCD) |
| :--- | :--- | :--- |
| **Принцип работы** | CI Runner подключается к кластеру по API и применяет манифесты (`kubectl apply`). | Внутри кластера работает оператор, который сам опрашивает Git и втягивает изменения. |
| **Безопасность (Security)** | Требуется отдавать кластерные токены/kubeconfig наружу в CI Runner. | Кластер полностью закрыт от внешнего мира, токены наружу не передаются. |
| **Дрифт конфигурации (Drift)** | Если кто-то изменит под руками через `kubectl edit`, CI об этом не узнает. | ArgoCD автоматически обнаруживает дрифт (OutOfSync) и возвращает состояние из Git (**Self-healing**). |
| **Простота отката** | Повторный запуск старой джобы или коммит в Git. | `git revert` в Git-репозитории манифестов или кнопка Rollback в интерфейсе ArgoCD. |

---

## 🧠 3. Фундаментальные принципы и механизмы GitLab CI (Deep Dive)

GitLab CI — один из самых мощных и гибких инструментов оркестрации пайплайнов. Дежурному инженеру критически важно понимать, как вычисляются переменные, как работают условия запуска, наследование и параллелизм.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    GITLAB CI / CD EXECUTION ENGINE                          │
│                                                                             │
│  ┌───────────────────────┐   ┌───────────────────────┐   ┌────────────────┐ │
│  │   Variables & Secrets │   │   Rules & Triggers    │   │  DAG (needs:)  │ │
│  │ (Precedence Hierarchy)│   │ (MR, Tags, Changes)   │   │(Async execution│ │
│  └───────────┬───────────┘   └───────────┬───────────┘   └────────┬───────┘ │
│              │                           │                        │         │
│              ▼                           ▼                        ▼         │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                 .gitlab-ci.yml Modular Pipeline Engine                 │ │
│  │  (include: / extends: / !reference / hidden jobs .base / environments) │ │
│  └───────────────────────────────────┬────────────────────────────────────┘ │
│                                      │                                      │
│  ┌───────────────────────────────────▼────────────────────────────────────┐ │
│  │        GitLab Runners Fleet (Docker / Kubernetes / Shell)              │ │
│  │  ┌─────────────────────────┐             ┌──────────────────────────┐  │ │
│  │  │ Job Container (App Code)│ ◄─(Network)─┤ Sidecar Services (DB/etc)│  │ │
│  │  └─────────────────────────┘             └──────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 3.1. Иерархия и приоритеты переменных (Variables Precedence)

Переменные могут объявляться на множестве уровней. Если переменная с одинаковым именем задана в нескольких местах, GitLab применяет строгий **порядок приоритета (от высшего к низшему)**:

```
[1. Trigger / Web UI / Scheduled Variables]   (ВЫСШИЙ ПРИОРИТЕТ - перебивает всё)
                    │
                    ▼
[2. Project CI/CD Variables]                  (Settings ➔ CI/CD ➔ Variables в проекте)
                    │
                    ▼
[3. Group CI/CD Variables]                    (Settings ➔ CI/CD ➔ Variables в родительской группе)
                    │
                    ▼
[4. Instance CI/CD Variables]                 (Глобальные переменные всего инстанса GitLab)
                    │
                    ▼
[5. Job-level variables]                      (Секция variables: внутри конкретной джобы)
                    │
                    ▼
[6. Root / Global variables]                  (Секция variables: на верхнем уровне .gitlab-ci.yml)
                    │
                    ▼
[7. Deployment Environment Variables]         (Переменные, привязанные к конкретному environment)
                    │
                    ▼
[8. Predefined / Built-in Variables]          (НИЗШИЙ ПРИОРИТЕТ - CI_COMMIT_SHA, CI_JOB_ID и т.д.)
```

> ⚠️ **Дежурный инцидент:** Если разработчик пытается переопределить `IMAGE_TAG` в `.gitlab-ci.yml`, но в настройках группы GitLab висит Group Variable `IMAGE_TAG=v1.0`, переменная из `.gitlab-ci.yml` **будет проигнорирована**, и выкатится старая версия!

---

### 3.2. Типы переменных и флаги безопасности

При создании переменных в Web UI (Settings ➔ CI/CD ➔ Variables) задаются критически важные параметры:

#### 1. Тип переменной:
* **`Variable` (Строка):** Обычная текстовая строка. Экспортируется в окружение шелла: `echo "$DATABASE_URL"`.
* **`File` (Временный файл):** GitLab сохраняет значение секрета во временный файл на диске раннера, а в переменную `$KUBECONFIG` или `$SSH_PRIVATE_KEY` помещает **абсолютный путь к этому файлу** (например, `/tmp/builds/group/project.tmp/KUBECONFIG`).
  * *Применение:* Идеально для конфигураций K8s, приватных RSA/ED25519 ключей, сертификатов TLS.

#### 2. Флаги безопасности:
* **`Protected` (Защищенная):** Переменная передается раннеру **только** в пайплайнах, запущенных на защищенных ветках (`Protected Branches`, например `main`, `release/*`) или защищенных тегах (`Protected Tags`).
  > 💡 **Почему джоба падает в фича-ветке?** Если в MR из ветки `feature/new-button` упал деплой с ошибкой `AWS_SECRET_ACCESS_KEY: unbound variable`, значит переменная помечена как `Protected`, и раннер не имеет к ней доступа в незащищенной ветке.
* **`Masked` (Маскированная):** Значение скрывается в логах консоли и заменяется на `[MASKED]`.
  * *Требования GitLab к Masked-переменным:* Значение должно быть от 8 символов, состоять из Base64-символов (`@a-zA-Z0-9_+=.-`) и **не содержать пробелов и переводов строк**.
* **`Expanded` (Раскрытие переменных):** По умолчанию включено. Если переменная содержит `$OTHER_VAR`, GitLab раскроет ее значение. Если выключить флаг `Expand variable reference` (**Raw variable**), строка `$p@ssword$1` останется в исходном виде.

---

### 3.3. Шпаргалка ключевых встроенных переменных (`CI_*` Predefined Variables)

| Переменная | Пример значения | Назначение |
| :--- | :--- | :--- |
| **`CI_COMMIT_SHA`** | `7b9e1c2d3f...` | Полный 40-значный хэш текущего коммита. |
| **`CI_COMMIT_SHORT_SHA`** | `7b9e1c2d` | Первые 8 символов хэша (идеально для тегов Docker). |
| **`CI_COMMIT_REF_NAME`** | `main`, `feature/auth`, `v1.2.0` | Имя текущей ветки или тега. |
| **`CI_COMMIT_BRANCH`** | `main`, `hotfix/alert` | Имя ветки (не задана, если пайплайн запущен по тегу). |
| **`CI_COMMIT_TAG`** | `v1.2.0` | Имя тега (не задана, если запуск по ветке). |
| **`CI_DEFAULT_BRANCH`** | `main` | Главная ветка проекта (позволяет писать универсальные шаблоны). |
| **`CI_PIPELINE_SOURCE`** | `push`, `merge_request_event`, `schedule`, `trigger`, `web` | Источник триггера пайплайна. |
| **`CI_MERGE_REQUEST_IID`** | `42` | Порядковый номер Merge Request. |
| **`CI_PROJECT_PATH`** | `backend/auth-service` | Полный путь к проекту с группами. |
| **`CI_PROJECT_DIR`** | `/builds/backend/auth-service` | Локальный рабочий каталог на диске раннера. |
| **`CI_REGISTRY_IMAGE`** | `registry.company.com/backend/auth-service` | URL внутреннего Docker Registry для данного проекта. |
| **`CI_REGISTRY_USER`** | `gitlab-ci-token` | Специальный системный пользователь для Registry. |
| **`CI_JOB_TOKEN`** | `glcbt-64_...` | Короткоживущий токен текущей джобы (для `docker login`, Git clone, GitLab API). |
| **`CI_ENVIRONMENT_NAME`** | `production`, `staging`, `review/mr-42` | Имя текущего окружения джобы. |
| **`GITLAB_USER_LOGIN`** | `alex_dev` | Логин пользователя, запустившего пайплайн. |

---

### 3.4. Принципы DRY, модульности и переиспользования в `.gitlab-ci.yml`

Чтобы не копировать десятки одинаковых джоб по всему репозиторию, в GitLab CI используются 4 механизма повторного использования:

```yaml
# 1. Hidden Jobs (Скрытые шаблоны): имя начинается с точки
.base_docker_build:
  image: docker:24.0.5
  before_script:
    - docker login -u "$CI_REGISTRY_USER" -p "$CI_JOB_TOKEN" "$CI_REGISTRY"
  after_script:
    - docker logout "$CI_REGISTRY"

# 2. Наследование через extends: (рекомендуемый нативный подход)
build_backend:
  extends: .base_docker_build
  stage: build
  script:
    - docker build -t "$CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHORT_SHA" -f backend/Dockerfile .
    - docker push "$CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHORT_SHA"

# 3. Вставка конкретного блока через !reference
test_backend:
  stage: test
  image: python:3.11
  before_script:
    - !reference [.base_docker_build, before_script] # Берет ровно массив before_script из шаблона
  script:
    - pytest tests/

# 4. Подключение внешних шаблонов через include:
include:
  - local: '/ci/templates/security-scans.yml'                           # Из этого же репо
  - project: 'devops/ci-common'                                        # Из центрального репо DevOps
    ref: 'v3.2.0'
    file: '/templates/k8s-deploy.gitlab-ci.yml'
  - template: 'Security/Secret-Detection.gitlab-ci.yml'                # Официальный шаблон GitLab
```

#### 🆚 `extends:` vs YAML Anchors (`&anchor` / `*anchor`):
* **YAML Anchors:** Обрабатываются базовым парсером YAML. **Не работают** между разными файлами, подключенными через `include:`.
* **`extends:`:** Обрабатывается самим GitLab. Корректно объединяет массивы и словари, поддерживает многоуровневое наследование (`extends: [.base_auth, .base_deploy]`) и **работает сквозь любые `include:`**.

---

### 3.5. Условия запуска: правила `rules:` vs устаревший `only/except`

> ⚠️ Конструкция `only / except` официально признана **устаревшей (deprecated)**. В новых проектах используется только блок `rules:`.

`rules:` проверяются сверху вниз до **первого совпадения**:

```yaml
deploy_production:
  stage: deploy
  script:
    - ./deploy.sh
  rules:
    # 1. Запускать ручной деплой только при пуше в main
    - if: '$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH'
      when: manual
      allow_failure: false

    # 2. Запускать автоматически при создании тега версии v1.0.0
    - if: '$CI_COMMIT_TAG =~ /^v\d+\.\d+\.\d+$/'
      when: on_success

    # 3. Запускать джобу, только если изменились файлы в папке backend/
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
      changes:
        paths:
          - backend/**/*
          - Dockerfile
        compare_to: 'refs/heads/main'

    # 4. Во всех остальных случаях — НЕ запускать джобу
    - when: never
```

#### 🚫 Как избежать дублирования пайплайнов (Duplicate Pipelines):
Если настроены правила для веток и для Merge Request одновременно, GitLab по умолчанию может запускать два параллельных пайплайна на один коммит (`Branch Pipeline` и `Merge Request Pipeline`). Для предотвращения этого в начало файла добавляется блок `workflow: rules`:

```yaml
workflow:
  rules:
    # Запускать пайплайн для Merge Request
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
    # Не запускать пайплайн ветки, если для нее уже открыт MR
    - if: '$CI_COMMIT_BRANCH && $CI_OPEN_MERGE_REQUESTS'
      when: never
    # Запускать пайплайн при прямом пуше в main или теге
    - if: '$CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH'
    - if: '$CI_COMMIT_TAG'
```

---

### 3.6. Ускорение через DAG (`needs:` вместо классических `stages`)

По умолчанию GitLab выполняет пайплайн **строго по стадиям**: джоба стадии `deploy` не начнется, пока **все** джобы стадии `test` не завершатся (даже если frontend-тесты идут 15 минут, а backend готов за 1 минуту).

С помощью `needs:` вы строите направленный ациклический граф (**Directed Acyclic Graph - DAG**):

```yaml
stages:
  - build
  - test
  - deploy

build_backend:
  stage: build
  script: ["make build-backend"]

build_frontend:
  stage: build
  script: ["make build-frontend"]

test_backend:
  stage: test
  needs: ["build_backend"] # Начинается СРАЗУ, как готов build_backend!
  script: ["make test-backend"]

test_frontend:
  stage: test
  needs: ["build_frontend"] # Не ждет бэкенд!
  script: ["make test-frontend-heavy"] # Идет 20 минут

deploy_backend:
  stage: deploy
  needs: ["test_backend"] # Задеплоит бэкенд через 2 минуты, не дожидаясь фронтенда!
  script: ["./deploy-backend.sh"]
```

---

### 3.7. Сетевые сервисы и сайдкары (`services:`)

Блок `services:` поднимает рядом с контейнером джобы вспомогательные сервисы (PostgreSQL, Redis, MinIO) в общей Docker-сети. Это позволяет проводить честные интеграционные тесты без внешних тестовых стендов:

```yaml
integration_tests:
  stage: test
  image: python:3.11
  services:
    - name: postgres:16-alpine
      alias: db-postgres # DNS имя внутри сети джобы
    - name: redis:7-alpine
      alias: cache-redis
  variables:
    # Настройка PostgreSQL контейнера
    POSTGRES_DB: "test_db"
    POSTGRES_USER: "test_user"
    POSTGRES_PASSWORD: "secretpassword"
    POSTGRES_HOST_AUTH_METHOD: "trust"
    # Переменные подключения для приложения
    DATABASE_URL: "postgresql://test_user:secretpassword@db-postgres:5432/test_db"
    REDIS_URL: "redis://cache-redis:6379/0"
  script:
    - pip install -r requirements.txt
    - python manage.py migrate
    - pytest tests/integration/
```

---

### 3.8. Динамические окружения и Review Apps (`environments`)

GitLab CI позволяет разворачивать изолированные временные копии приложения на каждый Merge Request (**Review Apps**) и автоматически уничтожать их при закрытии MR:

```yaml
deploy_review_app:
  stage: deploy
  image: dtzar/helm-kubectl:latest
  script:
    - helm upgrade --install "review-$CI_ENVIRONMENT_SLUG" ./chart --set ingress.host="mr-$CI_MERGE_REQUEST_IID.review.company.com"
  environment:
    name: review/$CI_COMMIT_REF_SLUG
    url: https://mr-$CI_MERGE_REQUEST_IID.review.company.com
    on_stop: stop_review_app       # Какая джоба очистит ресурсы
    auto_stop_in: 3 days           # Автоудаление через 3 дня неактивности
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'

stop_review_app:
  stage: deploy
  image: dtzar/helm-kubectl:latest
  script:
    - helm uninstall "review-$CI_ENVIRONMENT_SLUG"
  environment:
    name: review/$CI_COMMIT_REF_SLUG
    action: stop
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
      when: manual
      allow_failure: true
```

---

### 3.9. Продвинутые типы пайплайнов

1. **Multi-Project Pipelines (`trigger: project:`):** Пайплайн фронтенда может пнуть пайплайн общего монорепозитория или инфра-деплоя:
   ```yaml
   trigger_deploy:
     stage: deploy
     trigger:
       project: devops/infrastructure-k8s
       branch: main
       strategy: depend # Ждать успешного завершения downstream-пайплайна
   ```
2. **Child / Parent Pipelines (`trigger: include:`):** Позволяет динамически сгенерировать `.gitlab-ci.yml` скриптом и запустить его как дочерний пайплайн (удобно для микросервисных монорепозиториев).
3. **Pipeline Schedules (Cron):** Запуск ночных регрессионных тестов, еженедельного сканирования устаревших зависимостей или ротации логов по расписанию через UI `CI/CD ➔ Schedules`.

---

## 🐙 4. GitOps: Архитектура, Принципы, ArgoCD, Flux и Управление Секретами (Deep Dive)

**GitOps** — это методология управления инфраструктурой и приложениями, где **Git является единственным источником правды** (Single Source of Truth), а доставка в кластер выполняется специализированными агентами (Pull-модель).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            GITOPS ARCHITECTURE                              │
│                                                                             │
│  ┌───────────────────────┐                    ┌──────────────────────────┐  │
│  │   Git Config Repo     │                    │    Kubernetes Cluster    │  │
│  │ (Manifests/Helm/Kust) │                    │                          │  │
│  └───────────┬───────────┘                    │  ┌────────────────────┐  │  │
│              │                                │  │   ArgoCD / Flux    │  │  │
│              │ Git Webhook / Polling          │  │ (Operator / Engine)│  │  │
│              ▼                                │  └─────────┬──────────┘  │  │
│    [ Target State (Git) ]                     │            │             │  │
│              │                                │            ▼             │  │
│              └──────────── Reconciliation ────┼──► [ Live State (etcd) ] │  │
│                                Loop           │            │             │  │
│                                               │            ▼             │  │
│                                               │  [ Pods / Services / HPA]│  │
│                                               └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 4.1. 4 фундаментальных принципа OpenGitOps

1. **Декларативность (Declarative):** Вся целевая система описана декларативно (манифесты YAML, Helm, Kustomize), а не набором процедурных bash-скриптов.
2. **Версионируемость и неизменяемость (Versioned and Immutable):** Все изменения хранятся в Git. Каждый коммит дает полный аудит: *Кто? Что? Когда? Зачем?*
3. **Автоматическое вытягивание (Pulled Automatically):** Агенты внутри кластера сами опрашивают Git и применяют конфигурацию. Человеку закрывают прямой доступ `kubectl apply` на продакшн.
4. **Непрерывное согласование и самовосстановление (Continuously Reconciled & Self-Healing):** Оператор непрерывно сравнивает **Desired State** (Git) с **Live State** (кластер). Если кто-то вручную удалит под или изменит ReplicaCount через `kubectl edit`, оператор моментально вернет эталонное состояние из Git (**устранение Drift**).

---

### 4.2. Сравнение GitOps-движков: ArgoCD vs Flux v2

| Критерий | ArgoCD | Flux v2 (GitOps Toolkit) |
| :--- | :--- | :--- |
| **Интерфейс (UI)** | **Великолепный Web UI** с интерактивным деревом ресурсов, логами и кнопками синхронизации/отката. | UI из коробки отсутствует (используется CLI `flux` или сторонний Weave GitOps UI). |
| **Архитектура** | Монолитный контроллер + API-сервер + Repo-сервер + Dex (SSO). | Набор независимых микроконтроллеров (`source-controller`, `kustomize-controller`, `helm-controller`). |
| **Работа с мультикластерами** | Управляет сотнями внешних кластеров из одной центральной инсталляции (Control Plane). | Устанавливается агентом непосредственно в каждый кластер. |
| **Автоматизация образов** | Через отдельный аддон `argocd-image-updater`. | Встроенные контроллеры `image-reflector-controller` и `image-automation-controller` (сам делает коммит с новым тегом в Git!). |
| **Для кого идеален** | Большие команды, дежурные инженеры, которым нужен наглядный UI для траблшутинга и контроля релизов. | Минималистичные платформенные команды, любящие чистый Kubernetes-native подход и CRD. |

#### 🏛️ Внутреннее устройство компонентов ArgoCD:
* **`argocd-server`:** Точка входа REST/gRPC API и Web UI. Отвечает за аутентификацию (SSO/RBAC) и отображение состояния ресурсов.
* **`argocd-repo-server`:** Клонирует Git-репозитории во временный кэш, генерирует финальный чистый YAML из Helm-чартов, Kustomize-оверлеев или плагинов (CMP — Config Management Plugins).
* **`argocd-application-controller`:** Основной рабочий цикл (Reconciliation loop). Опрашивает `kube-apiserver`, сравнивает сгенерированный YAML из `repo-server` с реальными объектами в etcd, и переводит ресурсы в состояние `Synced` или `OutOfSync`.
* **`argocd-redis`:** Хранилище кэша сгенерированных манифетсов и статусов для защиты Git-сервера и K8s API от перегрузки.

---

### 4.3. Стратегия разделения репозиториев (App Repo vs Config Repo)

> ⚠️ **Главное правило GitOps:** Код приложения и инфраструктурные манифесты деплоя **должны жить в РАЗНЫХ Git-репозиториях!**

```
┌────────────────────────────────┐         ┌────────────────────────────────┐
│   App Repository (Code)        │         │   Config Repository (GitOps)   │
│ ├── src/                       │         │ ├── apps/                      │
│ ├── tests/                     │         │ │   └── auth-service/          │
│ ├── Dockerfile                 │         │ │       ├── base/              │
│ └── .gitlab-ci.yml             │         │ │       └── overlays/          │
│                                │         │ │           ├── staging/       │
│  [CI]: Сборка и Пуш Docker     │         │ │           └── production/    │
│        v1.4.2 в Registry       │──(MR)──►│                                │
└────────────────────────────────┘         │  [ArgoCD]: Синхронизирует      │
                                           │            манифесты в кластер │
                                           └────────────────────────────────┘
```

#### Почему репозитории разделяют?
1. **Предотвращение бесконечных циклов CI:** Если манифест лежит в репо с кодом, то коммит нового тега триггерит новый пайплайн сборки, который снова коммитит тег.
2. **Разделение прав доступа (RBAC):** Разработчики имеют права коммитить в код, но изменения в `production` оверлей GitOps-репозитория требуют обязательного Approval от Lead/DevOps инженеров.
3. **Чистая история релизов:** В GitOps-репозитории каждый коммит — это факт изменения конфигурации кластера, что делает откат через `git revert` тривиальным.

#### 🗂️ Организация Kustomize в Config-репозитории:
```
gitops-manifests/
├── apps/
│   └── auth-service/
│       ├── base/
│       │   ├── deployment.yaml
│       │   ├── service.yaml
│       │   └── kustomization.yaml
│       └── overlays/
│           ├── staging/
│           │   ├── kustomization.yaml     # replicaCount: 1, ingress: auth-staging.com
│           │   └── patches/
│           └── production/
│               ├── kustomization.yaml     # replicaCount: 5, HPA, limits
│               └── patches/
└── bootstrap/
    ├── root-app.yaml                      # Мастер App of Apps
    └── clusters.yaml
```

---

### 4.4. Паттерны масштабирования: App of Apps и ApplicationSet

Когда в компании работает 100+ микросервисов на 10 кластерах, создавать манифесты вручную невозможно. Используются два ключевых паттерна:

#### 1. Паттерн "App of Apps":
Создается один мастер-манифест `Application`, который указывает на папку со всеми остальными манифестами `Application` (Ingress, Cert-Manager, Monitoring, Микросервисы). Развертывание одного корневого приложения автоматически разворачивает всю экосистему компании.

#### 2. ArgoCD `ApplicationSet` (Автоматическая генерация приложений):
`ApplicationSet` — это CRD-контроллер, который генерирует множество `Application` по шаблону с использованием генераторов:
* **Git Generator:** Сканирует каталоги в Git (`apps/*`) и автоматически создает `Application` для каждой найденной папки.
* **Cluster Generator:** Автоматически выкатывает сервисы на все кластеры, зарегистрированные в ArgoCD с лейблом `env: production`.
* **Matrix Generator:** Комбинирует генераторы (например: все сервисы из Git $\times$ все кластеры региона EU).

---

### 4.5. Production-Ready манифесты ArgoCD

#### 1. Эталонный манифест `Application` (`auth-service-prod.yaml`):
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: auth-service-prod
  namespace: argocd
  labels:
    env: production
    app.kubernetes.io/part-of: backend
  finalizers:
    # Защита: удалит все K8s ресурсы в кластере при удалении этого Application из Git
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: 'https://gitlab.company.com/devops/gitops-manifests.git'
    targetRevision: main # Ветка или тег репозитория
    path: apps/auth-service/overlays/production
  destination:
    server: 'https://kubernetes.default.svc' # Локальный кластер
    namespace: production

  # Настройки автоматической синхронизации
  syncPolicy:
    automated:
      prune: true       # Автоматически удалять из кластера объекты, удаленные из Git!
      selfHeal: true    # Устранять дрифт, если кто-то руками поменял ресурс в кластере!
      allowEmpty: false
    syncOptions:
      - CreateNamespace=true        # Создать namespace production, если его нет
      - ApplyOutOfSyncOnly=true     # Применять только измененные ресурсы (ускоряет синк)
      - PruneLast=true              # Удалять старые ресурсы только после успешного старта новых
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m

  # Игнорирование дрифта полей, управляемых K8s контроллерами
  ignoreDifferences:
    - group: apps
      kind: Deployment
      jsonPointers:
        - /spec/replicas # Игнорировать число реплик, так как ими управляет HPA!
```

#### 2. Эталонный манифест `ApplicationSet` (Git Directory Generator):
```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: backend-services
  namespace: argocd
spec:
  generators:
    - git:
        repoURL: 'https://gitlab.company.com/devops/gitops-manifests.git'
        revision: main
        directories:
          - path: apps/*
  template:
    metadata:
      name: '{{path.basename}}'
    spec:
      project: default
      source:
        repoURL: 'https://gitlab.company.com/devops/gitops-manifests.git'
        targetRevision: main
        path: '{{path}}/overlays/production'
      destination:
        server: 'https://kubernetes.default.svc'
        namespace: production
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
```

---

### 4.6. Управление секретами в GitOps

> 🔒 **Фундаментальная проблема GitOps:** Всё должно храниться в Git, но **пароли, TLS-сертификаты и токены БД категорически запрещено коммитить в открытом виде** (даже в приватные репозитории)!

В индустрии используются 3 проверенных решения:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       GITOPS SECRETS MANAGEMENT                             │
│                                                                             │
│  1. Sealed Secrets:                                                         │
│     [ Plain Secret ] ──(kubeseal)──► [ SealedSecret in Git ]                │
│                                              │                              │
│                                              ▼ (In-cluster controller)      │
│                                      [ Decrypted Native K8s Secret ]        │
│                                                                             │
│  2. External Secrets Operator (ESO):                                        │
│     [ HashiCorp Vault / AWS SM ] ◄── (Pulls) ── [ ExternalSecrets Operator]│
│                                                          │                  │
│     [ ExternalSecret in Git ] ───────────────────────────▼                  │
│                                                 [ Native K8s Secret ]       │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 1. Bitnami Sealed Secrets (Асимметричное шифрование):
* **Как работает:** В кластере работает контроллер со связкой приватного и публичного ключей.
* **Процесс:** Инженер шифрует секрет публичным ключом локально:
  ```bash
  kubeseal --controller-namespace=kube-system --format=yaml < secret.yaml > sealed-secret.yaml
  ```
* Полученный `SealedSecret` **безопасно коммитится в Git**. Внутри кластера контроллер расшифровывает его в нативный `v1.Secret`.

#### 2. External Secrets Operator (ESO) + HashiCorp Vault (Корпоративный стандарт):
* **Как работает:** Секреты хранятся в защищенном централизованном Vault.
* **В Git коммитится манифест `ExternalSecret`:**
  ```yaml
  apiVersion: external-secrets.io/v1beta1
  kind: ExternalSecret
  metadata:
    name: db-credentials
    namespace: production
  spec:
    refreshInterval: "1h" # Ротация секрета каждый час
    secretStoreRef:
      name: vault-backend
      kind: ClusterSecretStore
    target:
      name: db-credentials # Имя нативного K8s Secret, который будет создан
    data:
      - secretKey: password
        remoteRef:
          key: production/database
          property: password
  ```

#### 3. Mozilla SOPS + age / AWS KMS:
* Шифрует значения полей в самом YAML-файле (`password: ENC[AES256_GCM,data:...]`).
* ArgoCD или Flux расшифровывают манифест на лету перед применением в кластер.

---

### 4.7. Дежурный траблшутинг GitOps и шпаргалка `argocd` CLI

#### 🚦 Статусы ArgoCD и их расшифровка:

| Статус Sync | Статус Health | Что это значит | Действие дежурного |
| :--- | :--- | :--- | :--- |
| `Synced` | `Healthy` | Идеальное состояние. Git полностью совпадает с K8s, все поды работают. | Никаких действий не требуется. |
| `OutOfSync` | `Healthy` | В Git залит новый коммит, но он еще не применился, либо кто-то внес ручные правки в кластер (Drift). | Нажать `App Diff`, проверить изменения и нажать `Sync`. |
| `Synced` | `Progressing` | Идет процесс RollingUpdate деплоя или поды стартуют. | Подождать 1-2 минуты завершения деплоя. |
| `Synced` / `OutOfSync` | `Degraded` | Приложение упало! Поды в `CrashLoopBackOff`, не прошли ReadinessProbe или упал PVC. | `argocd app get <app>`, проверить события и логи подов через `kubectl logs`. |
| `OutOfSync` | `Missing` | Манифесты удалены из Git, либо ресурс еще не создан в кластере. | Проверить `syncPolicy.automated.prune`. |

#### 📋 Шпаргалка команд `argocd` CLI для инженера:
```bash
# 1. Авторизоваться в сервере ArgoCD
argocd login argocd.company.com --sso

# 2. Посмотреть список всех приложений и их здоровье
argocd app list

# 3. Детальная информация и дерево ресурсов приложения
argocd app get auth-service-prod

# 4. Показать точечный DIFF между Git и кластером (В чем дрифт?)
argocd app diff auth-service-prod

# 5. Принудительно запустить синхронизацию с удалением устаревших ресурсов
argocd app sync auth-service-prod --prune --force

# 6. Посмотреть историю ревизий приложения
argocd app history auth-service-prod

# 7. Экстренный откат на предыдущую успешную ревизию (Rollback)
# ВНИМАНИЕ: Если включен automated selfHeal, сначала отключите автосинк!
argocd app set auth-service-prod --sync-policy none
argocd app rollback auth-service-prod 42
```

---

## ⚙️ 5. Архитектура раннеров (Runners) и тюнинг `config.toml`

GitLab Runner — это легковесный агент на Golang, опрашивающий сервер GitLab по HTTP/HTTPS (Long Polling) на наличие новых задач.

```
┌─────────────────────────────────────────────────────────────┐
│                    GITLAB SERVER (Web/API)                  │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS (Long Polling)
┌──────────────────────────────▼──────────────────────────────┐
│                  HOST C GITLAB-RUNNER                       │
│                                                             │
│  Global Config (/etc/gitlab-runner/config.toml)             │
│  ├── concurrent = 10 (Максимум 10 параллельных джоб)        │
│  └── check_interval = 3 (Опрос каждые 3 секунды)            │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Executor: Docker                                      │  │
│  │ ├── Container 1: [Lint Job]                           │  │
│  │ ├── Container 2: [Build Image (Kaniko)]               │  │
│  │ └── Volume: /var/run/docker.sock or /cache            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 📄 Эталонная конфигурация `/etc/gitlab-runner/config.toml`:
```toml
concurrent = 8                # Максимум одновременных сборок на этом сервере
check_interval = 2            # Частота опроса мастера (в секундах)

[[runners]]
  name = "k8s-docker-runner-01"
  url = "https://gitlab.company.com"
  id = 142
  token = "glrt-t1_xxxxxxxxxxxx"
  token_obtained_at = 2026-01-15T10:00:00Z
  token_expires_at = 0001-01-01T00:00:00Z
  executor = "docker"

  [runners.custom_build_dir]
  [runners.cache]
    MaxUploadedArchiveSize = 524288000 # 500 MB
    Type = "s3"
    [runners.cache.s3]
      ServerAddress = "s3.company.com"
      AccessKey = "minio_access_key"
      SecretKey = "minio_secret_key"
      BucketName = "runner-cache"
      Insecure = false

  [runners.docker]
    tls_verify = false
    image = "alpine:latest"
    privileged = false                # true нужен ТОЛЬКО если используется Docker-in-Docker
    disable_entrypoint_overwrite = false
    oom_kill_disable = false
    disable_cache = false
    volumes = ["/cache", "/var/run/docker.sock:/var/run/docker.sock:rw"]
    shm_size = 2147483648             # 2GB RAM для shared memory (/dev/shm) — защита от падения Chrome/E2E тестов
    pull_policy = ["if-not-present", "always"] # Не качать заново тяжелые базовые образы
```

### 💾 Cache vs Artifacts:
| Характеристика | Кэш (Cache) | Артефакты (Artifacts) |
| :--- | :--- | :--- |
| **Назначение** | Ускорение сборки между последовательными запусками (`node_modules/`, `.pip-cache`, Maven repo). | Передача файлов между разными стадиями **одного** пайплайна (скомпилированный бинарник, отчет о тестах, coverage). |
| **Гарантия наличия** | **Не гарантирован.** Если кэш сброшен или отсутствует, джоба обязана уметь собраться с нуля. | **Гарантирован.** Если джоба ожидает артефакт от предыдущей стадии, система передаст его. |
| **Политика (Policy)** | `pull-push` (по умолчанию), `pull` (только читать, для тестов), `push` (только писать, для сборки кэша). | `expire_in: 1 week` (автоматическая очистка диска). |

---

## 📜 6. Production-Ready примеры пайплайнов

### 🦊 1. Эталонный `.gitlab-ci.yml` (Микросервис на K8s со сканерами безопасности)

```yaml
stages:
  - lint
  - test
  - security
  - build
  - deploy_staging
  - deploy_production
  - rollback

# Глобальные переменные
variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: ""
  APP_NAME: "auth-service"
  REGISTRY_URL: "registry.company.com/backend"
  IMAGE_TAG: "$REGISTRY_URL/$APP_NAME:$CI_COMMIT_SHORT_SHA"

# Шаблон для кэширования зависимостей
.node_cache: &node_cache
  cache:
    key:
      files:
        - package-lock.json
    paths:
      - .npm/
    policy: pull-push

# -------------------------------------------------------------
# 1. Стадия Линтинга и Статического Анализа
# -------------------------------------------------------------
lint_code:
  stage: lint
  image: node:20-alpine
  <<: *node_cache
  script:
    - npm ci --cache .npm --prefer-offline
    - npm run lint
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
    - if: '$CI_COMMIT_BRANCH == "main"'

# -------------------------------------------------------------
# 2. Стадия Тестирования (Юнит-тесты с отчетами)
# -------------------------------------------------------------
unit_tests:
  stage: test
  image: node:20-alpine
  <<: *node_cache
  script:
    - npm ci --cache .npm --prefer-offline
    - npm run test:unit -- --coverage
  artifacts:
    name: "test-report-$CI_COMMIT_SHORT_SHA"
    expire_in: 3 days
    reports:
      junit: junit.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

# -------------------------------------------------------------
# 3. Сканирование безопасности (Trivy SAST / Dependency Check)
# -------------------------------------------------------------
trivy_security_scan:
  stage: security
  image: 
    name: aquasec/trivy:latest
    entrypoint: [""]
  script:
    - trivy fs --exit-code 1 --severity CRITICAL --no-progress .
  allow_failure: false # Пайплайн упадет, если найдены CRITICAL уязвимости

# -------------------------------------------------------------
# 4. Сборка и Пуш Docker-образа (Kaniko без прав root)
# -------------------------------------------------------------
build_image:
  stage: build
  image:
    name: gcr.io/kaniko-project/executor:v1.14.0-debug
    entrypoint: [""]
  script:
    - /kaniko/executor
      --context "${CI_PROJECT_DIR}"
      --dockerfile "${CI_PROJECT_DIR}/Dockerfile"
      --destination "${IMAGE_TAG}"
      --destination "${REGISTRY_URL}/${APP_NAME}:latest"
      --cache=true
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'

# -------------------------------------------------------------
# 5. Автоматический деплой на Staging
# -------------------------------------------------------------
deploy_staging:
  stage: deploy_staging
  image: dtzar/helm-kubectl:latest
  environment:
    name: staging
    url: https://auth-staging.company.com
  script:
    - kubectl set image deployment/$APP_NAME $APP_NAME=$IMAGE_TAG -n staging
    - kubectl rollout status deployment/$APP_NAME -n staging --timeout=120s
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'

# -------------------------------------------------------------
# 6. Ручной безопасный деплой в Production
# -------------------------------------------------------------
deploy_production:
  stage: deploy_production
  image: dtzar/helm-kubectl:latest
  environment:
    name: production
    url: https://auth.company.com
  script:
    - echo "Деплой версии $IMAGE_TAG на Production..."
    - kubectl set image deployment/$APP_NAME $APP_NAME=$IMAGE_TAG -n production
    - kubectl rollout status deployment/$APP_NAME -n production --timeout=180s
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'
  when: manual # Деплой на прод только по нажатию кнопки инженером!

# -------------------------------------------------------------
# 7. Аварийный откат (Emergency Rollback)
# -------------------------------------------------------------
rollback_production:
  stage: rollback
  image: dtzar/helm-kubectl:latest
  environment:
    name: production
  script:
    - echo "🚨 Запущен экстренный откат предыдущей версии в Production!"
    - kubectl rollout undo deployment/$APP_NAME -n production
    - kubectl rollout status deployment/$APP_NAME -n production
  when: manual
```

---

### 🐙 2. Эталонный GitHub Actions Workflow (`.github/workflows/deploy.yml`)

```yaml
name: CI/CD Production Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

# Защита от одновременных конфликтующих деплоев
concurrency:
  group: production-deployment
  cancel-in-progress: false

jobs:
  test_and_lint:
    name: Test & Lint
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install flake8 pytest

      - name: Run Linter
        run: flake8 src/

      - name: Run Tests
        run: pytest tests/

  build_and_push:
    name: Build & Push Container
    needs: test_and_lint
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and Push Docker Image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ghcr.io/${{ github.repository }}:${{ github.sha }}
            ghcr.io/${{ github.repository }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy_prod:
    name: Deploy to Production
    needs: build_and_push
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://api.company.com
    steps:
      - name: Authenticate to K8s Cluster
        uses: azure/k8s-set-context@v3
        with:
          method: kubeconfig
          kubeconfig: ${{ secrets.KUBECONFIG_PROD }}

      - name: Deploy new version
        run: |
          kubectl set image deployment/api api=ghcr.io/${{ github.repository }}:${{ github.sha }} -n production
          kubectl rollout status deployment/api -n production --timeout=3m
```

---

## 🚀 7. Стратегии деплоя приложений (Deployment Strategies & DB Migrations)

Выбор стратегии развертывания определяет, увидят ли пользователи простой (Downtime) и как быстро можно нейтрализовать аварию при сбое.

```
1. Recreate:
   [ V1 V1 ] ➔ (Выключение) ➔ [ ... ] ➔ (Запуск) ➔ [ V2 V2 ]  (Downtime!)

2. Rolling Update:
   [ V1 V1 V1 ] ➔ [ V1 V1 V2 ] ➔ [ V1 V2 V2 ] ➔ [ V2 V2 V2 ]  (Zero Downtime)

3. Blue-Green:
   [ Active: Blue V1 ]  (100% трафика)
   [ Idle:   Green V2 ] (0% трафика) ➔ Переключение Router ➔ [ Active: Green V2 ]

4. Canary:
   [ 90% трафика ➔ V1 (Stable) ]
   [ 10% трафика ➔ V2 (Canary) ] ──(Метрики OK?)──► 100% трафика на V2
```

### 📊 Сравнительный анализ стратегий:
| Стратегия | Downtime | Нагрузка на ресурсы | Сложность отката | Риск инцидента |
| :--- | :--- | :--- | :--- | :--- |
| **Recreate** | **Есть** (секунды/минуты) | Минимальная (1x) | Средняя (перезапуск старого) | Высокий (простой для клиентов) |
| **Rolling Update** | **Zero Downtime** | Средняя (+25–50% на время деплоя) | Быстрая (`kubectl rollout undo`) | Средний (обе версии работают одновременно) |
| **Blue-Green** | **Zero Downtime** | Высокая (требует **2x** ресурсов) | **Мгновенная** (свитч балансировщика) | Низкий (старая среда готова в резерве) |
| **Canary** | **Zero Downtime** | Умеренная (+10–20%) | **Мгновенная** (возврат 100% на stable) | **Минимальный** (страдает лишь малая часть трафика) |

### 🗄️ Базы данных и деплой: Паттерн "Expand and Contract"
> ⚠️ **Главная ловушка деплоя:** Код можно откатить за секунду, но **схему базы данных откатить сложно или невозможно**, если новая версия уже успела записать туда данные!

При параллельной работе версий (Rolling / Blue-Green / Canary) база данных **обязана быть совместима и со старой (V1), и с новой версией (V2)**:
1. **Фаза 1 (Expand):** Добавляем новую колонку `phone_number_v2` в БД, не удаляя старую `phone`. Код V1 пишет в `phone`, новый код V2 пишет в обе или читает с fallback.
2. **Фаза 2 (Deploy):** Выкатываем новую версию приложения V2 на 100% серверов.
3. **Фаза 3 (Contract):** Только через несколько дней отдельным скриптом удаляем устаревшую колонку `phone`.

---

## 🚨 8. Дежурный траблшутинг: Диагностика упавших пайплайнов, раннеров и ArgoCD

Когда деплой блокирует релиз или релиз ломает продакшн, дежурный инженер выполняет диагностику по шагам:

### 1. Пайплайн завис в статусе `Pending` / `Stuck`:
* **Причина 1: Нет свободных раннеров с нужными тегами.**
  * *Проверка:* Открыть джобу, посмотреть блок `Tags`. Проверить в админке GitLab/GitHub: `Settings ➔ CI/CD ➔ Runners`. Доступен ли раннер с тегом `docker-prod` или `k8s-runner`?
* **Причина 2: Раннер перешел в статус `Offline` / `Paused`.**
  * *Решение:* Зайти на сервер раннера по SSH, проверить статус службы:
    ```bash
    systemctl status gitlab-runner
    journalctl -u gitlab-runner -n 50 --no-pager
    ```

### 2. Ошибка `No space left on device` во время билда:
* **Причина:** Раннер забит старыми Docker-слоями, образами и томами сборщика.
* **Решение на хосте раннера:**
  ```bash
  # Проверить свободное место на диске
  df -h /var/lib/docker

  # Очистить неиспользуемые контейнеры, кэш сборки и неиспользуемые образы
  docker system prune -af --volumes

  # Для K8s-раннеров проверить диск воркер-ноды
  kubectl describe node <runner-node> | grep DiskPressure
  ```

### 3. Ошибка `401 Unauthorized` / `ImagePullBackOff` из реестра:
* **Причина:** Истек токен авторизации раннера (`CI_JOB_TOKEN`), изменился пароль сервис-аккаунта реестра или сработал лимит Docker Hub (Rate Limit 429).
* **Решение:** Проверить секрет реестра в K8s:
  ```bash
  kubectl get secret regcred -n production -o yaml
  ```

### 4. Джоба деплоя зависает по таймауту (Deployment Timeout):
* **Причина:** Новый под не проходит `ReadinessProbe` или падает в `CrashLoopBackOff` / `OOMKilled`.
* **Решение:** Не ждать завершения 60-минутного таймаута пайплайна, а сразу смотреть события в кластере:
  ```bash
  kubectl get pods -n production --sort-by='.metadata.creationTimestamp'
  kubectl describe pod <failing-pod> -n production
  kubectl logs <failing-pod> -n production --previous
  ```

### 5. ArgoCD завис в `Syncing` или упал в `Degraded`:
* **Причина 1:** Зависший PreSync/PostSync хук (например, миграция БД ждет lock).
  * *Решение:* `kubectl get jobs -n production` и проверить логи миграционного пода.
* **Причина 2:** Невалидный манифест в Git (ошибка синтаксиса YAML или отсутствует CRD в кластере).
  * *Решение:* `argocd app get <app-name>` покажет конкретную строчку ошибки валидации Kubernetes API.

---

## ⏪ 9. Протокол аварийного отката (Rollback Runbook)

> 💡 **Сценарий:** В 15:00 успешно завершился деплой `auth-service:v2.4.0`. В 15:05 сработал алерт `HTTP 5xx Spike > 15%`.

```
[ Алерт: 5xx Spike ]
         │
         ▼
[ Проверить историю релизов: GitLab CI / ArgoCD ]
         │ (Деплой был 5 минут назад?)
         ├───► НЕТ ──► Искать причину в сети / внешних API / базе данных
         │
         ▼ ДА
[ 1. МГНОВЕННЫЙ ОТКАТ (Mitigation) ]
         ├── Вариант А: Нажать кнопку "Rollback" в GitLab CI / GitHub Actions
         ├── Вариант Б: kubectl rollout undo deployment/auth-service -n production
         └── Вариант В: В ArgoCD нажать "Rollback" на ревизию V2.3.9 (отключив Auto-Sync)
         │
         ▼
[ 2. Проверить стабилизацию метрик в Grafana ]
         │
         ▼
[ 3. Коммуникация и фиксация ]
         ├── Написать в аварийный чат: "Выполнен откат auth-service на v2.3.9. Метрики в норме."
         └── Создать ветку git revert в GitOps репозитории и завести тикет на разбор Post-Mortem
```

### 🆚 Rollback vs Roll-Forward:
* **Rollback (Откат):** Возврат предыдущего рабочего бинарника/образа. **Применяется в 90% случаев** для немедленного снятия аварии с пользователей.
* **Roll-Forward (Хотфикс вперед):** Накатывание нового фикс-коммита поверх сломанного. Применяется **только** если:
  1. Уже применились необратимые миграции базы данных, и откат старого кода сломает БД окончательно.
  2. Фикс тривиален (опечатка в переменной окружения) и собирается за 1 минуту.

---

## 🧩 10. Сводная матрица типовых ошибок CI/CD и GitOps

| Симптом ошибки | Вероятная причина | Быстрое решение дежурного |
| :--- | :--- | :--- |
| `Job failed: exit code 137` | **OOMKilled** (раннеру не хватило RAM на сборку/тесты). | Увеличить лимит памяти в настройках Runner или оптимизировать Docker build. |
| `fatal: unable to access ... SSL certificate problem` | Истекли корпоративные сертификаты на раннере. | Обновить пакет `ca-certificates` на хосте раннера. |
| `Pipeline blocked: Waiting for manual action` | Деплой на Prod ожидает ручного подтверждения. | Проверить окружение и нажать кнопку ▶️ `Play` в интерфейсе. |
| `Resource deadlock detected` на стадии миграций | Миграция заблокировала таблицу (Exclusive Lock). | Идентифицировать зависшую транзакцию в PostgreSQL (`pg_stat_activity`) и отменить ее. |
| `ArgoCD: OutOfSync / Degraded` | Разница между Git и реальным состоянием кластера или сбой пода. | В интерфейсе ArgoCD нажать `Diff`, затем `Sync` с флагом `Prune` (если согласовано). |
| `ArgoCD: ComparisonError (Failed to load target state)` | Ошибка в синтаксисе YAML/Kustomize в Git или недоступен Git-репозиторий. | Проверить логи `argocd-repo-server` и валидность `kustomization.yaml`. |
| `ExternalSecret: SecretSyncedError` | ESO не может авторизоваться в HashiCorp Vault (истек токен/роль). | Проверить статус `ClusterSecretStore` и Vault token. |

---

## 🚫 11. Таблица антипаттернов в CI/CD и GitOps

| ❌ Антипаттерн | Почему это опасно | ✅ Как делать правильно |
| :--- | :--- | :--- |
| Хранение манифестов деплоя в одном репо с кодом | Зацикливание CI/CD пайплайнов, путаница прав доступа. | Использовать выделенный GitOps Config Repository. |
| Использование тега `:latest` в деплое | Невозможно понять, какая версия кода сейчас работает, и невозможно надежно откатиться. | Использовать уникальные теги: `v1.2.3` или `$CI_COMMIT_SHORT_SHA`. |
| Хранение паролей и токенов в открытом виде в Git | Утечка доступов в Git-историю (доступна всем разработчикам и сканерам). | Использовать Sealed Secrets, External Secrets Operator (Vault) или SOPS. |
| Прямой `kubectl edit` / `kubectl apply` на боевой кластер | **Конфигурационный дрифт (Drift):** изменения будут стерты GitOps-оператором при следующем синке. | Любое изменение делать исключительно через Git Commit / PR. |
| Запуск сборки под `root` на Shell раннере | Скрипт из коммита может случайно или намеренно удалить системные файлы сервера (`rm -rf /`). | Использовать Docker/K8s executor с непривилегированными пользователями. |
| Отсутствие `ignoreDifferences` для HPA реплик | ArgoCD будет постоянно видеть `OutOfSync`, пытаясь вернуть число реплик из Git вместо масштабирования HPA. | Настраивать `ignoreDifferences: [/spec/replicas]`. |


