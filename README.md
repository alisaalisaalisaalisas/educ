<<<<<<< HEAD
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
=======
# 🚀 База знаний: Путь в DevOps через мониторинг (NOC / L1-L2 Ops)

Добро пожаловать в репозиторий для подготовки к профессии **Инженер мониторинга / Дежурный инженер / NOC** с дальнейшим переходом в **DevOps-инженер**.

Здесь собраны структурированные конспекты, шпаргалки с командами, алгоритмы расследования инцидентов (Runbooks), скрипты автоматизации и вопросы с реальных собеседований.

---

## 🗺️ Программа обучения и трекер прогресса

- [ ] **[01. Linux & Базовое администрирование](./01-linux-basics/)**
  - [ ] [01. Основные команды и работа в терминале](./01-linux-basics/01-linux-core-commands.md)
  - [ ] [02. Диагностика ресурсов: CPU, RAM, Disk, Load Average](./01-linux-basics/02-troubleshooting-resources.md)
  - [ ] [03. Bash-скриптинг и автоматизация для дежурного инженера](./01-linux-basics/03-bash-scripting-for-ops.md)
  - [ ] [04. Python для инженера мониторинга и Ops-скриптинга](./01-linux-basics/04-python-for-ops.md)
  - [ ] [05. Linux: Сертификаты, Ядро, Лимиты и Сетевой стек](./01-linux-basics/05-kernel-certificates-networking.md)
  - [ ] [06. Внутреннее устройство ОС: Архитектуры (x86_64 vs ARM), Процессы и Файловые системы](./01-linux-basics/06-os-internals-architecture-fs.md)
  - [ ] [07. Потоки ввода-вывода (редиректы), $PATH, Пакеты, Синхронизация времени и SSH](./01-linux-basics/07-linux-essential-extras.md)
- [ ] **[02. Компьютерные сети и Веб-серверы](./02-networking/)**
  - [ ] [01. Основы сетей: OSI, TCP/IP, DNS, HTTP/HTTPS](./02-networking/01-network-fundamentals.md)
  - [ ] [02. Сетевая диагностика (curl, ping, ss, tcpdump, nc)](./02-networking/02-network-diagnostics.md)
  - [ ] [03. Nginx: Reverse Proxy, Балансировка и Траблшутинг](./02-networking/03-nginx-reverse-proxy.md)
  - [ ] [04. CDN (Cloudflare) и архитектура с Ingress в Kubernetes](./02-networking/04-cdn-and-ingress-architecture.md)
- [ ] **[03. Системы мониторинга и метрики](./03-monitoring-systems/)**
  - [ ] [01. Концепции мониторинга: Метрики, Push vs Pull, SLA/SLO/SLI](./03-monitoring-systems/01-monitoring-concepts.md)
  - [ ] [02. Prometheus & Grafana: PromQL, Node Exporter, Дашборды](./03-monitoring-systems/02-prometheus-grafana.md)
  - [ ] [03. Alertmanager: Настройка алертов и роутинг в Telegram](./03-monitoring-systems/03-alertmanager.md)
  - [ ] [04. Zabbix: Архитектура, агенты, шаблоны, триггеры](./03-monitoring-systems/04-zabbix-overview.md)
- [ ] **[04. Логирование](./04-logging/)**
  - [ ] [01. Стек Grafana Loki & Grafana Alloy (LogQL)](./04-logging/01-logs-and-loki.md)
  - [ ] [02. Стек ELK / OpenSearch (Elasticsearch, Filebeat, Kibana)](./04-logging/02-elk-opensearch.md)
- [ ] **[05. Контейнеризация и Оркестрация](./05-docker-containers/)**
  - [ ] [01. Основы Docker: команды, логи, инспекция](./05-docker-containers/01-docker-fundamentals.md)
  - [ ] [02. Docker Compose: запуск сервисов одной командой](./05-docker-containers/02-docker-compose.md)
  - [ ] [03. Kubernetes: Базовый Траблшутинг (Read-Only для Дежурного)](./05-docker-containers/03-kubernetes-troubleshooting.md)
  - [ ] [04. Ansible: Ad-hoc команды и базовые плейбуки](./05-docker-containers/04-ansible-basics.md)
  - [ ] [05. Terraform: Основы IaC, HCL, Workflow и State file](./05-docker-containers/05-terraform-basics.md)
- [ ] **[06. Инцидент-менеджмент и процессы](./06-incident-management/)**
  - [ ] [01. Жизненный цикл инцидента и эскалация](./06-incident-management/01-incident-lifecycle.md)
  - [ ] [02. Runbooks: Решение типовых проблем (502 Bad Gateway, Диск 100%, OOM)](./06-incident-management/02-runbooks-and-cases.md)
  - [ ] [03. Git и основы CI/CD для дежурного инженера](./06-incident-management/03-git-and-cicd-for-ops.md)
- [ ] **[07. Подготовка к собеседованиям и Pet-проект](./07-interview-prep/)**
  - [ ] [01. Топ вопросов и кейсов на собеседовании](./07-interview-prep/01-top-interview-questions.md)
  - [ ] [02. Домашний лабораторный стенд (Pet-project в резюме)](./07-interview-prep/02-pet-project-guide.md)

---

## 🎯 Наш план действий

1. **Изучаем модуль за модулем** по файлам в документации.
2. **Отрабатываем практику** на командах, конфигах и реальных кейсах.
3. **Разворачиваем локальный стенд** мониторинга на Docker Compose.
4. **Проводим тестовое собеседование** с каверзными вопросами и задачами на траблшутинг.
>>>>>>> 0c74ffe1381e602e5a460f45e306ff77cc84af2f
