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
  - [ ] [01. Концепции Observability, TSDB, SRE-сигналы и High Cardinality](./03-monitoring-systems/01-monitoring-concepts.md)
  - [ ] [02. Prometheus & Grafana: Манифесты, Продвинутый PromQL и Культура Дашбордов](./03-monitoring-systems/02-prometheus-grafana.md)
  - [ ] [03. Alertmanager: Культура правил алертов, Роутинг, Ингибирование и Шаблоны](./03-monitoring-systems/03-alertmanager.md)
  - [ ] [04. Zabbix 7.0 LTS: Архитектура, Agent 2, LLD, Макросы и Эскалации](./03-monitoring-systems/04-zabbix-overview.md)
- [ ] **[04. Логирование](./04-logging/)**
  - [ ] [01. Grafana Loki & Alloy: River-манифесты, LogQL и Борьба с Кардинальностью](./04-logging/01-logs-and-loki.md)
  - [ ] [02. Стек ELK / OpenSearch: Filebeat, Logstash, ILM, ECS и KQL](./04-logging/02-elk-opensearch.md)
- [ ] **[05. Контейнеризация и Оркестрация](./05-docker-containers/)**
  - [ ] [01. Docker: Архитектура, команды и культура написания Dockerfile](./05-docker-containers/01-docker-fundamentals.md)
  - [ ] [02. Docker Compose: Манифесты, Healthchecks и Best Practices](./05-docker-containers/02-docker-compose.md)
  - [ ] [03. Kubernetes: Архитектура, Манифесты, Best Practices и Траблшутинг](./05-docker-containers/03-kubernetes-troubleshooting.md)
  - [ ] [04. Ansible: Ad-hoc, Плейбуки, Роли и Культура автоматизации](./05-docker-containers/04-ansible-basics.md)
  - [ ] [05. Terraform: IaC, Модули, Чистый HCL и Культура управления State](./05-docker-containers/05-terraform-basics.md)
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
