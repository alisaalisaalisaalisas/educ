# 5. CI/CD и GitOps

---

## GitLab CI/CD

**GitLab CI/CD** — встроенная система непрерывной интеграции и доставки в GitLab. Пайплайны описываются в файле `.gitlab-ci.yml` в корне репозитория.

### Ключевые концепции

| Концепция | Описание |
|---|---|
| **Pipeline** | Полный цикл CI/CD, состоящий из стадий |
| **Stage** | Этап пайплайна (build, test, deploy). Задачи внутри стадии выполняются параллельно |
| **Job** | Конкретная задача (сборка образа, запуск тестов) |
| **Runner** | Агент, выполняющий задачи (shared, specific, group) |
| **Artifact** | Файлы, сохраняемые между стадиями (бинарники, отчёты) |
| **Cache** | Кеш зависимостей между запусками пайплайна |
| **Variables** | Переменные окружения (CI_COMMIT_SHA, свои секреты) |
| **Rules/Only/Except** | Условия запуска задач |
| **Environment** | Целевое окружение деплоя (staging, production) |

### Структура пайплайна

```
Pipeline
├── Stage: build
│   ├── Job: build-frontend
│   └── Job: build-backend     (параллельно)
├── Stage: test
│   ├── Job: unit-tests
│   └── Job: integration-tests (параллельно)
├── Stage: deploy-staging
│   └── Job: deploy-to-staging
└── Stage: deploy-production
    └── Job: deploy-to-prod    (manual trigger)
```

### Расширенный пример

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - deploy

variables:
  DOCKER_IMAGE: $CI_REGISTRY_IMAGE/backend

# Шаблон для переиспользования
.docker_login: &docker_login
  before_script:
    - echo "$CI_REGISTRY_PASSWORD" | docker login -u "$CI_REGISTRY_USER" --password-stdin $CI_REGISTRY

build-backend:
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  <<: *docker_login
  script:
    - docker build -t $DOCKER_IMAGE:$CI_COMMIT_SHA ./backend
    - docker push $DOCKER_IMAGE:$CI_COMMIT_SHA
  rules:
    - changes:
        - backend/**/*

test:
  stage: test
  image: python:3.12
  script:
    - cd backend
    - pip install -r requirements.txt
    - pytest --cov=app tests/
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: backend/coverage.xml
  cache:
    key: pip-$CI_COMMIT_REF_SLUG
    paths:
      - .cache/pip

deploy-staging:
  stage: deploy
  script:
    - echo "Deploying to staging..."
  environment:
    name: staging
    url: https://staging.marketplace.local
  rules:
    - if: $CI_COMMIT_BRANCH == "develop"

deploy-production:
  stage: deploy
  script:
    - echo "Deploying to production..."
  environment:
    name: production
    url: https://marketplace.local
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
      when: manual  # Требует ручного подтверждения
```

### Типы Runners

| Тип | Описание | Executor |
|---|---|---|
| **Shared** | Общий для всех проектов | Docker, Kubernetes |
| **Specific** | Привязан к конкретному проекту | Shell, Docker |
| **Group** | Для группы проектов | Любой |

```bash
# Регистрация runner
gitlab-runner register \
  --url "https://gitlab.local" \
  --registration-token "TOKEN" \
  --executor "docker" \
  --docker-image "alpine:latest"
```

---

## ArgoCD

**ArgoCD** — декларативный инструмент непрерывной доставки (CD) для Kubernetes, реализующий паттерн GitOps.

### Принцип GitOps

```
Git (единый источник правды)
  │
  │  ArgoCD отслеживает изменения
  ▼
ArgoCD сравнивает:
  Git-манифесты  ←→  Текущее состояние кластера
  │
  │  При расхождении — автоматическая синхронизация
  ▼
Kubernetes Cluster (желаемое состояние)
```

### Ключевые концепции

| Концепция | Описание |
|---|---|
| **Application** | Ресурс ArgoCD, связывающий Git-репо с K8s namespace |
| **Project** | Группировка приложений с ограничениями доступа |
| **Sync** | Приведение кластера в соответствие с Git |
| **Health Status** | Healthy, Degraded, Progressing, Missing |
| **Sync Status** | Synced (соответствует Git) или OutOfSync |
| **App of Apps** | Паттерн: одно приложение управляет другими |
| **Auto-Sync** | Автоматическая синхронизация при изменении в Git |
| **Self-Heal** | Откат ручных изменений в кластере |

### Пример Application

```yaml
# gitops/apps/marketplace-app.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: marketplace
  namespace: argocd
spec:
  project: default
  source:
    repoURL: http://gitlab.local/user/gitops-repo.git
    targetRevision: main
    path: app/helm-chart
    helm:
      valueFiles:
        - values.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: marketplace
  syncPolicy:
    automated:
      prune: true       # Удалять ресурсы, отсутствующие в Git
      selfHeal: true     # Откатывать ручные изменения
    syncOptions:
      - CreateNamespace=true
```

### Паттерн App of Apps

```yaml
# gitops/apps/root-app.yaml — управляет всеми другими приложениями
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: root
  namespace: argocd
spec:
  source:
    repoURL: http://gitlab.local/user/gitops-repo.git
    path: gitops/apps      # Директория с YAML-файлами других Application
    targetRevision: main
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      selfHeal: true
```

### Основные команды CLI

```bash
# Установка CLI
curl -sSL -o argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
chmod +x argocd && sudo mv argocd /usr/local/bin/

# Логин
argocd login argocd.local --username admin --password <pass>

# Управление приложениями
argocd app list
argocd app get marketplace
argocd app sync marketplace
argocd app diff marketplace
argocd app history marketplace
argocd app rollback marketplace <revision>
```

### CI/CD Pipeline с GitOps

```
Developer → git push → GitLab CI
  │
  ├─ Build: собирает Docker-образ, пушит в Registry
  ├─ Test: запускает тесты
  └─ Update GitOps Repo: меняет image tag в values.yaml
       │
       ▼
  ArgoCD обнаруживает изменение в gitops-repo
       │
       ▼
  ArgoCD синхронизирует Kubernetes (Rolling Update)
```
