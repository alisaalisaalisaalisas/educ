# 📚 Полная документация проекта Beer Marketplace & DevOps Infrastructure

Подробный обучающий и эксплуатационный справочник по всем слоям архитектуры, технологиям и процедурам локального развертывания пивного маркетплейса.

---

## 📑 Содержание

1. [Введение и Архитектура Системы](#1-введение-и-архитектура-системы)
2. [Фаза 0: Базовое Окружение и Утилиты](#2-фаза-0-базовое-окружение-и-утилиты)
3. [Фаза 1: Разработка Приложения (Frontend + Backend)](#3-фаза-1-разработка-приложения-frontend--backend)
4. [Фаза 2: Контейнеризация (Docker & Docker Compose)](#4-фаза-2-контейнеризация-docker--docker-compose)
5. [Фаза 3: Локальный Оркестратор Kubernetes (Minikube)](#5-фаза-3-локальный-оркестратор-kubernetes-minikube)
6. [Фаза 4: Управление Пакетной Сборкой (Helm Charts)](#6-фаза-4-управление-пакетной-сборкой-helm-charts)
7. [Фаза 5 & 6: Continuous Integration & Delivery (GitLab CE & GitLab CI)](#7-фаза-5--6-continuous-integration--delivery-gitlab-ce--gitlab-ci)
8. [Фаза 7: Концепция GitOps (ArgoCD)](#8-фаза-7-концепция-gitops-argocd)
9. [Фаза 8: Инфраструктура как Код (Terraform & Ansible)](#9-фаза-8-инфраструктура-как-код-terraform--ansible)
10. [Фаза 9: Полный Стек Наблюдаемости (Observability Stack)](#10-фаза-9-полный-стек-наблюдаемости-observability-stack)
    - [9.1 Метрики и Дашборды: Prometheus + Grafana](#91-метрики-и-дашборды-prometheus--grafana)
    - [9.2 Сборка и Анализ Логов: Grafana Loki & Alloy](#92-сборка-и-анализ-логов-grafana-loki--alloy)
    - [9.3 Инфраструктурный Мониторинг: Zabbix](#93-инфраструктурный-мониторинг-zabbix)
    - [9.4 Полнотекстовый Лог-Анализ: ELK Stack (Elasticsearch, Logstash, Kibana)](#94-полнотекстовый-лог-анализ-elk-stack-elasticsearch-logstash-kibana)
11. [Эксплуатация и Траблшутинг](#11-эксплуатация-и-траблшутинг)

---

## 1. Введение и Архитектура Системы

Проект **Beer Marketplace** представляет собой современный микросервисный веб-маркетплейс по продаже пива с многоуровневой DevOps-инфраструктурой, полностью адаптированной для автономного локального развертывания на Windows с использованием среды **WSL2 (Ubuntu)**.

### Общая схема потоков данных и сервисов:
```
[ Посетитель Browser ]
        │
        ▼ (Port 80/8080)
┌────────────────────────────────────────────────────────────────────────┐
│                        Nginx Ingress / Reverse Proxy                   │
└──────────┬──────────────────────────────────────────────────┬──────────┘
           │                                                  │
           ▼ /                                                ▼ /api
┌───────────────────────┐                          ┌───────────────────────┐
│     React Frontend    │                          │   Node.js Backend     │
│   (Vite SPA + TS)     │                          │ (Express + TS REST)   │
└───────────────────────┘                          └──────────┬────────────┘
                                                              │
                                            ┌─────────────────┴─────────────────┐
                                            ▼                                   ▼
                                 ┌────────────────────┐              ┌────────────────────┐
                                 │  PostgreSQL (Data) │              │   Redis (Cache)    │
                                 └────────────────────┘              └────────────────────┘

───────────────────────────────────────────────────────────────────────────────────────────
                             ИНФРАСТРУКТУРА И МОНИТОРИНГ
───────────────────────────────────────────────────────────────────────────────────────────
  [GitLab CE] ──► [GitLab CI] ──► [ArgoCD] ──► [Minikube K8s Cluster]
                                                      │
         ┌────────────────────────────────────────────┼────────────────────────────────────────────┐
         ▼                                            ▼                                            ▼
┌──────────────────┐                       ┌──────────────────┐                       ┌──────────────────┐
│ Prometheus/Grafana│                       │  Zabbix Server   │                       │    ELK Stack     │
│ (Метрики + Loki) │                       │ (Инфраструктура) │                       │ (Поиск по логам) │
└──────────────────┘                       └──────────────────┘                       └──────────────────┘
```

---

## 2. Фаза 0: Базовое Окружение и Утилиты

Для работы всей системы используется платформа виртуализации контейнеров Docker Desktop под управлением подсистемы **WSL2 (Windows Subsystem for Linux 2)** с дистрибутивом **Ubuntu 24.04**.

### Список установленных утилит и требования к ним:
- **WSL2 (Ubuntu 24.04 LTS)** — изолированное Linux-окружение.
- **Docker (v29.1+)** — контейнеризация приложений.
- **Minikube (v1.38+)** — локальный однонодовый кластер Kubernetes.
- **kubectl (v1.36+)** — консольный CLI-клиент для взаимодействия с Kubernetes API.
- **Helm (v3.21+)** — пакетный менеджер манифестов Kubernetes.
- **Terraform (v1.15+)** — инструмент декларативного описания инфраструктуры (IaC).
- **Ansible (v2.16+)** — система автоматической конфигурации и развертывания.
- **Node.js (v20+) / npm (v10+)** — среда выполнения для бэкенда и сборки фронтенда.

---

## 3. Фаза 1: Разработка Приложения (Frontend + Backend)

### Backend (`app/backend/`)
Построен на связке **Node.js + Express + TypeScript**. 
- **Архитектура:** Модульная роутинговая система (`src/routes/`).
- **Эндпоинты:**
  - `GET /api/health` — проверка состояния сервиса (uptime, timestamp, version).
  - `GET /api/beers` — получение каталога товаров с поддержкой query-параметров поиска (`search`), фильтрации (`style`, `brand`, `min_price`, `max_price`) и сортировки (`price_asc`, `price_desc`, `name`).
  - `GET /api/beers/:id` — получение подробной карточки конкретного пива.
  - `POST /api/beers` — административное добавление нового товара.
  - `GET / POST / DELETE /api/cart` — управление пользовательской корзиной.
  - `GET / POST /api/orders` — создание и отслеживание статусов заказов.
  - `POST /api/auth/register` и `/api/auth/login` — регистрация и авторизация пользователей.
- **Безопасность и логирование:** Использованы пакеты `helmet` (защитные HTTP-заголовки), `cors` (кросс-доменные запросы) и `morgan` (HTTP access-логирование).

### Frontend (`app/frontend/`)
Одностраничное приложение (SPA) на **React + TypeScript + Vite**.
- **Дизайн:** Тёмный UI с янтарными акцентами в стиле пивной тематики (`App.css`).
- **Компоненты:**
  - `BeerCard` — интерактивные карточки товаров с динамическими плашками стилей (Lager 🍺, Stout 🖤, Witbier 🌾, IPA 🍋).
  - `CartSidebar` — выдвижная панель корзины с подсчетом общей суммы и управлением позициями.
  - `Header` & `Filters` — поиск в реальном времени, фильтрация по категориям и сортировка.

---

## 4. Фаза 2: Контейнеризация (Docker & Docker Compose)

Приложение упаковано в оптимизированные многоэтапные (Multi-stage) Docker-образы.

### Multi-stage Dockerfile для Backend (`app/backend/Dockerfile`):
```dockerfile
# ── Stage 1: Build ──
FROM alpine:latest AS builder
RUN apk add --no-cache nodejs npm
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ── Stage 2: Production ──
FROM alpine:latest
RUN apk add --no-cache nodejs npm wget
WORKDIR /app
COPY package*.json ./
RUN npm ci --production && npm cache clean --force
COPY --from=builder /app/dist ./dist
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/api/health || exit 1
CMD ["node", "dist/server.js"]
```

### Локальная оркестрация через Docker Compose (`docker-compose.yml`):
Включает 4 взаимосвязанных контейнера:
1. **frontend** (порт `8080:80`) — Nginx SPA веб-сервер.
2. **backend** (порт `3000:3000`) — REST API сервис.
3. **db** (порт `5432:5432`) — База данных PostgreSQL 16.
4. **cache** (порт `6379:6379`) — Кэширующий сервер Redis 7.

---

## 5. Фаза 3: Локальный Оркестратор Kubernetes (Minikube)

Оркестрация контейнеров осуществляется кластером **Minikube**.

### Инструкции по управлению кластером:
- **Запуск кластера:**
  ```bash
  minikube start --driver=docker --cpus=2 --memory=3000mb
  ```
- **Включение Ingress контроллера:**
  ```bash
  minikube addons enable ingress
  ```
- **Сборка образов напрямую в Docker-демон Minikube:**
  ```bash
  eval $(minikube docker-env)
  ```

---

## 6. Фаза 4: Управление Пакетной Сборкой (Helm Charts)

Вся конфигурация приложения описана в виде Helm-чарта в директории `helm/beer-marketplace/`.

### Созданные Kubernetes-манифесты:
- `backend.yaml`:
  - `Namespace`: `beer-marketplace` — отдельное изолированное пространство имён.
  - `Deployment`: `backend` — запуск пода бэкенда с политикой `imagePullPolicy: Never`.
  - `Service`: `backend-service` (Type: `ClusterIP`, Port: `3000`).
- `frontend-ingress.yaml`:
  - `Deployment`: `frontend` — Nginx веб-сервер фронтенда.
  - `Service`: `frontend-service` (Type: `ClusterIP`, Port: `80`).
  - `Ingress`: `beer-ingress` — единая точка входа. Маршрутизирует `/` на фронтенд и `/api` на бэкенд.

---

## 7. Фаза 5 & 6: Continuous Integration & Delivery (GitLab CE & GitLab CI)

Для эмуляции промышленного цикла разработки развернут локальный сервер **GitLab Community Edition** (`gitlab/gitlab-ce:latest`).

- **Веб-интерфейс GitLab:** `http://localhost:8090`
- **Конфигурация Пайплайна (`.gitlab-ci.yml`):**
  1. **Stage `test`**: Запуск линтеров и синтаксическая проверка TypeScript-кода.
  2. **Stage `build`**: Транспиляция кода бэкенда и сборка производственных бандлов.
  3. **Stage `deploy`**: Автоматическое применение новых Helm манифестов в Minikube-кластер через `kubectl apply`.

---

## 8. Фаза 7: Концепция GitOps (ArgoCD)

Вместо прямых деплоев из CI/CD пайплайна реализован подход **GitOps** с использованием **ArgoCD**.

- **Манифест ArgoCD (`gitops/apps/beer-marketplace-app.yaml`):**
  Указывает на Git-репозиторий `http://gitlab.local:8090/root/beer-marketplace.git` и отслеживает изменения в каталоге `helm/beer-marketplace`.
- **Авто-синхронизация (`syncPolicy`):**
  - `automated.prune: true` — удаляет устаревшие K8s объекты, убранные из Git.
  - `automated.selfHeal: true` — автоматически восстанавливает состояние кластера при ручных изменениях извне.

---

## 9. Фаза 8: Инфраструктура как Код (Terraform & Ansible)

### Terraform (`terraform/main.tf`)
Декларативное описание инфраструктуры через провайдеры `kubernetes` и `helm`. Позволяет одной командой `terraform apply` инициализировать пространства имён и разворачивать базовые сервисы в Minikube.

### Ansible (`ansible/`)
- `inventory/hosts` — перечень целевых хостов локальной системы.
- `playbooks/bootstrap.yml` — сценарий автоматической проверки статуса Minikube, установки зависимостей и подготовки K8s-пространств имён.

---

## 10. Фаза 9: Полный Стек Наблюдаемости (Observability Stack)

Мониторинг и логирование вынесены в отдельный стек Compose: `monitoring/docker-compose-monitoring.yml`.

### 9.1 Метрики и Дашборды: Prometheus + Grafana
- **Prometheus (порт `9090`):** Сбор метрик производительности Node.js приложения, ресурсоемкости K8s нод и времени откликов HTTP REST API.
- **Grafana (порт `3001`):** Визуализация метрик на графиках. Пароль по умолчанию: `admin / admin`.

### 9.2 Сборка и Анализ Логов: Grafana Loki & Alloy
- **Grafana Loki (порт `3100`):** Высокопроизводительное хранилище логов, проиндексированное по меткам (labels).
- **Grafana Alloy:** Агент сбора логов с контейнеров Docker и подов Minikube для их немедленной передачи в Loki.

### 9.3 Инфраструктурный Мониторинг: Zabbix
- **Zabbix Server & Web (порт `8081`):** Служит для глубокого системного мониторинга загрузки CPU хоста, использования оперативной памяти, свободного места на дисках и контроля SLA сервисов.

### 9.4 Полнотекстовый Лог-Анализ: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Elasticsearch (порт `9200`):** Полнотекстовый поисковый движок для индексации всех структурных логов приложения.
- **Kibana (порт `5601`):** Дашборд для построения сложных аналитических поисковых запросов по логам в реальном времени.

---

## 11. Эксплуатация и Траблшутинг

### Частые команды диагностики:
1. **Проверить статус подов Kubernetes:**
   ```bash
   kubectl get pods -n beer-marketplace
   ```
2. **Посмотреть логи бэкенда в кластере:**
   ```bash
   kubectl logs -n beer-marketplace -l app=backend --tail=100 -f
   ```
3. **Перезапустить мониторинг стек:**
   ```bash
   cd monitoring && docker compose -f docker-compose-monitoring.yml restart
   ```
4. **Проверить статус Minikube:**
   ```bash
   minikube status
   ```

---
*Документация составлена в рамках проекта Beer Marketplace DevOps Infrastructure.*
