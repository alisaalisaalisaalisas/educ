# 🚀 Developer & Deployment Guide: Руководство по Развертыванию

> **Пошаговая инструкция по локальной разработке, Docker-контейнеризации, деплою в Kubernetes и настройке CI/CD пайплайна**

---

## 💻 1. Локальная Разработка

### Требования:
- Node.js >= 18.0.0 (рекомендуется Node 20 LTS)
- npm >= 9.0.0

### Запуск проекта:
```bash
# 1. Перейдите в директорию игры
cd devops-city-explorer

# 2. Установите зависимости
npm install

# 3. Запустите dev-сервер с Hot Module Replacement (HMR)
npm run dev

# Сервер будет доступен по адресу: http://localhost:5173
```

### Проверка типов и линтинг:
```bash
# Проверка типов TypeScript
npm run build
```

---

## 🐳 2. Сборка и Запуск в Docker

В проекте используется оптимизированный multi-stage `Dockerfile` на базе `node:20-slim` и `nginx:alpine`:

```bash
# 1. Сборка Docker-образа
docker build -t devops-city-explorer:v2.0.0 .

# 2. Локальный запуск контейнера
docker run -d -p 8080:80 --name devops-city devops-city-explorer:v2.0.0

# 3. Проверка работоспособности
curl -I http://localhost:8080
```

### Запуск через Docker Compose:
```bash
docker-compose up -d --build
# Игра доступна на порту http://localhost:8080
```

---

## ☸️ 3. Развертывание в Kubernetes через Helm

В директории `helm/devops-city-explorer` находится production-ready Helm-чарт.

### Установка чарта:
```bash
# 1. Добавление/проверка манифестов в dry-run режиме
helm template devops-city ./helm/devops-city-explorer -f ./helm/devops-city-explorer/values.yaml

# 2. Установка в неймспейс production
helm upgrade --install devops-city ./helm/devops-city-explorer \
  --namespace production \
  --create-namespace \
  --set image.tag="v2.0.0"

# 3. Проверка статуса подов и сервисов
kubectl get pods,svc,ingress -n production -l app.kubernetes.io/name=devops-city-explorer
```

---

## ☁️ 4. Развертывание Инфраструктуры через Terraform

```bash
cd terraform

# 1. Инициализация провайдеров и S3 бэкенда
terraform init

# 2. Планирование изменений
terraform plan -var-file="terraform.tfvars.example"

# 3. Применение конфигурации
terraform apply -var-file="terraform.tfvars.example"
```

---

## 🔄 5. CI/CD Пайплайн (GitHub Actions)

В файле `.github/workflows/deploy-game.yml` настроен сквозной процесс:
1. **Lint & Test:** валидация TypeScript и проверка целостности JSON-квестов.
2. **Build:** компиляция оптимизированного бандла через Vite.
3. **Deploy:** автоматическая публикация на GitHub Pages при пуше в ветку `main`.
