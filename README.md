# 🍺 Beer Marketplace — DevOps Project

Маркетплейс по продаже пива (аналог Ozon) с полным CI/CD и GitOps pipeline.

## Стек технологий

| Категория | Инструменты |
|---|---|
| **Приложение** | Node.js (Express + TypeScript), React (Vite), PostgreSQL, Redis |
| **Контейнеризация** | Docker, Docker Compose |
| **Оркестрация** | Kubernetes (Minikube), Helm |
| **CI/CD** | GitLab CE, GitLab CI/CD Runner |
| **GitOps** | ArgoCD |
| **IaC** | Terraform, Ansible |
| **Мониторинг** | Prometheus, Grafana, Zabbix |
| **Логи** | Grafana Alloy + Loki, ELK Stack (Elasticsearch + Logstash + Kibana) |

## Структура проекта

```
dev/
├── app/                  # Приложение (backend + frontend)
├── helm/                 # Helm-чарты для K8s
├── gitops/               # GitOps-манифесты для ArgoCD
├── terraform/            # Infrastructure as Code
├── ansible/              # Конфигурация и автоматизация
├── monitoring/           # Конфиги мониторинга и логирования
├── gitlab/               # Docker Compose для локального GitLab
├── scripts/              # Вспомогательные скрипты
└── docs/                 # Документация
```

## Быстрый старт

```bash
# 1. Запустить Minikube-кластер
minikube start --driver=docker --cpus=4 --memory=8192 --disk-size=40g

# 2. Развернуть инфраструктуру через Terraform
cd terraform && terraform init && terraform apply

# 3. Запустить приложение через ArgoCD
# ArgoCD автоматически синхронизирует манифесты из gitops/
```

## Документация

- 📖 [Главное Руководство и Документация Проекта (MASTER_DOCUMENTATION.md)](docs/MASTER_DOCUMENTATION.md) — Исчерпывающий обучающий и справочный документ по всей архитектуре, фазам развертывания и траблшутингу.
- 📁 Справочники по технологиям доступны в папке [docs/](docs/).
