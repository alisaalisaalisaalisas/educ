# 📚 Документация по DevOps-понятиям

Полный справочник по технологиям и инструментам, используемым в проекте.

---

## Содержание

### [1. Linux, Scripting и Инструменты](docs/01-linux-and-tools.md)
- Python — автоматизация и скриптинг
- Process Monitoring — мониторинг процессов (ps, top, htop, systemctl)
- Performance Monitoring — мониторинг производительности (vmstat, iostat, free, df)
- Networking Tools — сетевые инструменты (ip, ss, ping, curl, tcpdump)
- Text Manipulation — обработка текста (grep, sed, awk, jq)
- Vim, Nano — текстовые редакторы
- FreeBSD — Unix-подобная ОС
- Ubuntu — дистрибутив Linux

### [2. Сети и Безопасность](docs/02-networking-and-security.md)
- DNS — система доменных имён
- HTTP / HTTPS — протоколы веба
- SSL/TLS — шифрование соединений
- SSH — защищённый удалённый доступ
- Forward Proxy — прямой прокси
- Reverse Proxy — обратный прокси
- Caching Server — серверы кеширования
- Firewall — брандмауэр
- Load Balancer — балансировка нагрузки
- Cloudflare — защита и ускорение

### [3. Git, Docker и Контейнеризация](docs/03-git-and-docker.md)
- Git — система контроля версий
- GitLab — платформа DevOps
- Docker — контейнеризация (Dockerfile, Compose)

### [4. IaC и Управление конфигурацией](docs/04-iac-and-configuration.md)
- Terraform — Infrastructure as Code
- Ansible — управление конфигурацией
- Vault — управление секретами
- Artifactory — менеджер артефактов

### [5. CI/CD и GitOps](docs/05-cicd-and-gitops.md)
- GitLab CI/CD — непрерывная интеграция и доставка
- ArgoCD — GitOps для Kubernetes

### [6. Kubernetes](docs/06-kubernetes.md)
- Архитектура K8s
- Объекты: Pod, Deployment, Service, Ingress, ConfigMap, Secret
- Команды kubectl
- Helm — пакетный менеджер
- Локальные кластеры (Minikube, Kind)

### [7. Мониторинг и Observability](docs/07-monitoring-and-observability.md)
- Prometheus — сбор метрик и алертинг
- Grafana — визуализация и дашборды
- Zabbix — корпоративный мониторинг
- Loki — агрегация логов
- Elastic Stack (ELK) — поиск и аналитика логов
