# 🎮 DevOps City Explorer: Doc Quest (Master Plan 2.0)

> **Интерактивная 2D-игра, тренажер инженерных навыков и живое портфолио DevOps-инженера**

---

## 🌟 1. Концепция и Видение

**DevOps City Explorer** — это браузерная 2D-игра (Pixel-Art / Retro-Tech эстетика) в стиле классических RPG/Zelda-like приключений, где игрок управляет инженером, исследует город ИТ-инфраструктуры, чинит упавшие сервисы, расследует инциденты и собирает артефакты документации.

### Ключевая цель проекта:
1. **Для игрока:** Увлекательный способ выучить и закрепить реальные навыки (Linux, Сети, Docker, Kubernetes, CI/CD, Prometheus, Grafana, Terraform, Траблшутинг).
2. **Для автора (Портфолио):** Неоспоримое доказательство Senior/Lead-мышления: демонстрация архитектуры, Docs-as-Code, автоматизации CI/CD, чистого кода и глубокого понимания DevOps-практик.

---

## 🗺️ 2. Карта Города и Зоны Знаний

Город спроектирован по топологии реальной распределенной инфраструктуры: от низкоуровневых систем до мониторинга и облаков.

```
                  ┌───────────────────────────────┐
                  │   📊 Observability Peak       │
                  │   (Prometheus, Grafana, Loki) │
                  └───────────────┬───────────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  │      ☸️ K8s Core District      │
                  │  (Pods, Ingress, Helm, Mesh)  │
                  └───────────────┬───────────────┘
                                  │
    ┌─────────────────────────────┼─────────────────────────────┐
    │                             │                             │
┌───┴─────────────────┐ ┌─────────┴───────────┐ ┌───────────────┴───┐
│ 🐳 Docker Yard      │ │ 🌉 Git & CI/CD      │ │ ☁️ Cloud Valley   │
│ (Images, Compose)   │ │ Highway (Pipelines) │ │ (IaC, Terraform)  │
└───┬─────────────────┘ └─────────┬───────────┘ └───────────────┬───┘
    │                             │                             │
    └─────────────────────────────┼─────────────────────────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  │   🌐 Network Crossroads       │
                  │   (DNS, TCP/IP, Nginx, Proxy) │
                  └───────────────┬───────────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  │     🐧 Linux Suburbs (Core)   │
                  │ (Processes, FS, Bash, Systemd)│
                  └───────────────────────────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  │   🚨 Incident War Room        │
                  │   (Boss Fights & Major Outages│
                  └───────────────────────────────┘
```

### Подробное описание зон

| Зона | Тематика и Навыки | Игровой визуал и метафора |
|------|-------------------|---------------------------|
| 🐧 **Linux Suburbs** | Ядро Linux, процессы, $PATH, systemd, диски, права `chmod/chown`, bash-пайплайны | Старый промышленный квартал с трубами (пайпами), шестеренками и терминалами управления |
| 🌐 **Network Crossroads** | DNS, TCP/IP handshake, порты, iptables, Nginx reverse proxy, TLS-сертификаты | Перекресток магистралей со светофорами (Firewall), шлюзами и распределительными щитками |
| 🌉 **Git Bridge & CI/CD** | Коммиты, ветки, merge conflicts, GitHub Actions, GitLab CI пайплайны | Мост через реку с подвесными секциями-коммитами и конвейерной лентой фабрики CI/CD |
| 🐳 **Docker Port & Yard** | Dockerfile, слои, кэш, multi-stage, docker-compose сети и вольюмы | Морской грузовой порт с контейнеровозами, кранами и складом слоев-образов |
| ☸️ **K8s Core City** | Поды, Deployments, Services, ConfigMaps, Secrets, Ingress, HPA, Helm | Футуристичный мегаполис с модульными парящими капсулами (подами) и диспетчерской вышкой |
| 📊 **Observability Peak** | Метрики, PromQL, Grafana дашборды, LogQL, Loki, алерты Alertmanager | Высокогорная обсерватория с телескопами, графиками на экранах и аварийной сиреной |
| ☁️ **Cloud Valley** | Terraform, State, провайдеры, Ansible плейбуки, S3, IAM | Облачная долина с автоматическими фабриками, управляемыми из чертежей (IaC) |
| 🚨 **Incident War Room** | Траблшутинг (OOM Killer, 502 Bad Gateway, Disk 100%, CrashLoopBackOff) | Бункер дежурной смены с мигающими красными лампами и экстренным телефоном |

---

## 🕹️ 3. Геймплей, Механики и RPG-Система

### Основной игровой цикл (Core Loop)
1. **Explore:** Исследуем район города, общаемся с NPC (Junior Dev, SRE-архитектор, Дежурный инспектор).
2. **Discover:** Находим поврежденный узел, закрытые ворота или упавший сервис.
3. **Inspect:** Открываем интерактивный документ/терминал, изучаем логи и конфиги.
4. **Solve & Patch:** Исправляем ошибку в интерактивном редакторе или вводим правильные команды.
5. **Verify & Reward:** Система валидирует решение, игрок получает опыт, «Compute Credits» и запись в **DevOps Journal**.
6. **Unlock:** Открывается следующий шлюз или зона города.

---

### Ролевая система и Характеристики

- 📊 **SLA / System Uptime (Вместо Здоровья / HP):** 
  - Начинается со `100.00%` (Five Nines).
  - При неверных деплоях или игнорировании критических алертов Uptime падает.
  - Восстанавливается при успешном закрытии инцидентов и оптимизации систем.
- ⚡ **Compute Credits / Cloud Coins (Вместо Золота):**
  - Зарабатываются за решение квестов и оптимизацию конфигов.
  - Тратятся на «подсказки от AI-ассистента», прокачку инструментов и кастомизацию персонажа.
- ⏱️ **MTTR (Mean Time to Resolution) Tracker:**
  - Таймер на решение инцидентов. Быстрое решение дает бонусы и достижения (например, «Fast Responder: Sub-5 min fix»).
- 🎒 **DevOps Toolbelt (Инвентарь):**
  - Найденные утилиты: `curl-бластер`, `grep-сканер`, `kubectl-ключ`, `terraform-чертеж`, `wireshark-очки`.

---

### NPC и Сюжетные Квесты

- **👨‍💻 Junior Dev Вася:** Постоянно коммитит `.env` с паролями в публичный репо и пишет `FROM ubuntu:latest` в Dockerfile на 2 Гб. Квест: *«Научи джуна multi-stage сборке и `.dockerignore`»*.
- **👮‍♀️ Security Auditor Елена:** Требует закрыть root-права в контейнерах и настроить `readOnlyRootFilesystem`. Квест: *«Харденинг K8s SecurityContext»*.
- **🧙‍♂️ Old-School Sysadmin Борис:** Охраняет старый легаси-монолит на FreeBSD. Квест: *«Миграция сервиса в контейнер без даунтайма»*.
- **🚨 Incident Dispatcher (Сирена):** Вызывает игрока в War Room при внезапных падениях продакшена.

---

### 🔥 Инцидент-Боссы (Major Incident Boss Battles)

В конце каждой крупной зоны игрока ждет «Босс-инцидент» с динамическим таймером и интерактивным траблшутингом:

1. **Босс 1: «The OOM-Killer Monster»**
   - *Симптомы:* Сервис внезапно падает с кодом 137 при нагрузке.
   - *Задача игрока:* Проанализировать `dmesg`, выявить утечку памяти в коде/контейнере, выставить корректные `resources.limits` и `requests` в K8s манифесте.
2. **Босс 2: «The Phantom 502 Bad Gateway»**
   - *Симптомы:* Nginx возвращает 502, апстрим бэкенда не отвечает.
   - *Задача игрока:* Проверить статус сокетов `ss -tulpn`, конфигурацию `proxy_pass`, DNS-резолв внутри Docker-сети и логи `systemctl status`.
3. **Босс 3: «The CrashLoopBackOff Hydra»**
   - *Симптомы:* Под в Kubernetes непрерывно перезапускается.
   - *Задача игрока:* Пройти цепочку: `kubectl describe pod` → `kubectl logs --previous` → выявить отсутствующий ConfigMap/Secret → исправить манифест.
4. **Босс 4: «Terraform State Drift Phantom»**
   - *Симптомы:* Ручные правки в облаке поломали автодеплой.
   - *Задача игрока:* Сделать `terraform refresh/import`, устранить конфликт в коде и применить план.

---

## 🧩 4. Типы Интерактивных Заданий и Мини-Игр

| Мини-игра | Техническая реализация | Чему учит |
|-----------|------------------------|-----------|
| **1. Embedded Terminal (Mock CLI)** | `xterm.js` + симулированная файловая система / WebAssembly | Работа с `grep`, `find`, `journalctl`, `awk`, `curl`, `chmod`, `netstat` |
| **2. Code & YAML Fixer** | `@monaco-editor/react` (VS Code engine) с линтерами | Исправление Dockerfile, K8s YAML, Nginx configs, GitLab CI |
| **3. Pipeline Flow Builder** | Drag-and-Drop блочный конструктор (DAG) | Сборка стадий CI/CD: Lint → Test → Build → Push → Deploy |
| **4. Network Patching Puzzle** | Интерактивная схема соединения нод и маршрутов | Настройка DNS A-записей, портов 80/443/8080, Ingress Rules, Subnets |
| **5. PromQL Metric Hunter** | Интерактивный график Grafana | Написание корректных PromQL запросов: `rate()`, `histogram_quantile()`, `sum by` |
| **6. Log Detective** | Интерфейс в стиле Loki / Kibana | Поиск correlation-id, парсинг стектрейсов, выявление Root Cause |

---

## 💻 5. Техническая Архитектура Проекта

Проект спроектирован так, чтобы быть **легким, надежным, не требующим дорогих серверов** (Zero-Cost Hosting), но при этом демонстрирующим современные стандарты фронтенда и DevOps.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          БРАУЗЕР КЛИЕНТА                               │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    React 18 + TypeScript (UI Layer)              │  │
│  │  ┌────────────────────┐ ┌──────────────────┐ ┌────────────────┐  │  │
│  │  │  HUD (SLA, Coins)  │ │  DevOps Journal  │ │ Monaco / Xterm │  │  │
│  │  └────────────────────┘ └──────────────────┘ └────────────────┘  │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│  ┌──────────────────────────────────┴───────────────────────────────┐  │
│  │               Phaser 3 / PixiJS 2D Engine (Game Canvas)          │  │
│  │  ┌────────────────────┐ ┌──────────────────┐ ┌────────────────┐  │  │
│  │  │ Tilemap & Collide  │ │ Player Animation │ │ Interactive Obj│  │  │
│  │  └────────────────────┘ └──────────────────┘ └────────────────┘  │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│  ┌──────────────────────────────────┴───────────────────────────────┐  │
│  │             Game Engine Core: State Manager + Quest Runner       │  │
│  │  - LocalStorage / IndexedDB (Progress Sync & Offline Mode)       │  │
│  │  - AST & Regex Validator (Zero-latency offline validation)       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────┬──────────────────────────────────┘
                                      │ (Опциональный API Sync)
┌─────────────────────────────────────┴──────────────────────────────────┐
│                   BACKEND & CI/CD INFRASTRUCTURE                       │
│                                                                        │
│  ┌───────────────────────────┐         ┌────────────────────────────┐  │
│  │ FastAPI / Go Microservice │         │ GitHub Actions CI/CD       │  │
│  │ - Global Leaderboard      │         │ - Validate Quest Schemas   │  │
│  │ - Recruiter Analytics     │         │ - Auto-build & Deploy docs │  │
│  │ - Cloud Save Sync         │         │ - Unit & E2E Tests         │  │
│  └───────────────────────────┘         └────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Стек технологий:

1. **Frontend Core:**
   - **Framework:** React + Vite + TypeScript (для HUD, диалогов, дневника и модальных окон).
   - **Game Engine:** Phaser 3 (2D тайловые карты, коллизии, спрайты, физика движения).
   - **Код-редактор:** `@monaco-editor/react` (подсветка синтаксиса YAML, Dockerfile, Nginx, Shell).
   - **Терминал:** `xterm.js` + `xterm-addon-fit` (аутентичный терминальный опыт).
   - **Стилизация:** Чистый модульный CSS с кастомной дизайн-системой Cyber/Retro-DevOps.
   - **Аудио:** Web Audio API / Howler.js (8-bit ретро-звуки взаимодействия, шагов, деплоя).

2. **Docs-as-Code & Quest Engine:**
   - Все квесты, обучающие статьи и диалоги хранятся в **структурированных YAML/JSON файлах**.
   - Добавление новой зоны или квеста не требует переписывания игрового движка — только добавление YAML-манифеста!

3. **Backend & Data (Опциональный слой):**
   - **API:** FastAPI (Python) или Go Fiber.
   - **База данных:** SQLite / PostgreSQL + Redis.
   - **Хостинг:** Бесплатный статический деплой на GitHub Pages / Cloudflare Pages / Vercel + бэкенд на Render / Fly.io / K8s cluster.

---

## 📜 6. Пример Docs-as-Code: Спецификация квеста

Каждый квест описывается декларативным манифестом:

```yaml
id: "quest-docker-01"
zone: "docker-district"
title: "Оптимизация гигантского Dockerfile"
category: "Containers"
difficulty: "Easy"
reward:
  sla_bonus: 0.05
  credits: 150
  badge: "Container Optimizer L1"

dialogue:
  npc: "Junior Dev Вася"
  avatar: "vasya_nervous"
  text: "Шеф, мой образ весит 1.8 Гб, и деплой идет 20 минут! Помоги сделать нормальный multi-stage билд на Alpine!"

document:
  title: "Dockerfile Best Practices"
  theory_markdown: |
    ### Multi-stage сборка:
    Используйте временный этап `builder` для компиляции и финальный чистый образ `alpine` для рантайма.
    Не забывайте очищать кэш пакетного менеджера!

challenge:
  type: "monaco-patch"
  language: "dockerfile"
  initial_code: |
    FROM golang:1.22
    WORKDIR /app
    COPY . .
    RUN go build -o server .
    CMD ["./server"]
  
  validation:
    rules:
      - pattern: "FROM\\s+golang:.*\\s+AS\\s+builder"
        message: "Используйте именованный этап сборки (AS builder)"
      - pattern: "FROM\\s+(alpine|scratch|gcr.io/distroless)"
        message: "Финальный образ должен базироваться на alpine, scratch или distroless"
      - pattern: "COPY\\s+--from=builder"
        message: "Скопируйте скомпилированный бинарник из этапа builder"

hints:
  - "Добавьте `AS builder` в первую строку"
  - "Второй блок начните с `FROM alpine:latest`"
  - "Используйте `COPY --from=builder /app/server /server`"
```

---

## 📅 7. Пошаговый План Разработки (Roadmap по спринтам)

```
[Sprint 1: Engine & MVP] ──────► [Sprint 2: Linux & Git] ──────► [Sprint 3: Docker & K8s]
          │                                 │                               │
          ▼                                 ▼                               ▼
  Tilemap + React HUD              Terminal + Monaco               Boss Fights + PromQL
  WASD + LocalStorage              Git Highway Zone                K8s Tower & Port
                                                                            │
[Sprint 6: Launch & HR]  ◄───── [Sprint 5: Infra & CI/CD] ◄──── [Sprint 4: IaC & Observability]
          │                                 │                               │
          ▼                                 ▼                               ▼
  Recruiter Mode + PDF             Helm + GitHub Actions           War Room + Alertmanager
  Live URL + Portfolio             Terraform + Monitoring          Cloud Valley Quests
```

### 🔹 Спринт 1: Фундамент и Интерактивный Движок (2 недели)
- [x] Инициализация репозитория (React + Vite + TypeScript + Phaser 3).
- [x] Базовая тайловая карта города (Tiled Map Editor / Pixel Canvas).
- [x] Управление персонажем (WASD / стрелки, коллизии с домами и дорогами).
- [x] React Overlay HUD: индикатор SLA (Uptime), баланс Compute Credits, кнопка Journal.
- [x] Механика взаимодействия: триггер зоны (`E` / клик), диалоговое окно с NPC.
- [x] Движок квестов: чтение JSON/YAML квеста и отображение первого тестового задания.

### 🔹 Спринт 2: Зоны «Linux Suburbs» и «Git Highway» + Терминал (2 недели)
- [x] Интеграция `xterm.js` с эмулятором Linux-команд (`ls`, `cat`, `grep`, `ps`, `top`, `chmod`, `systemctl`, `lsof`, `truncate`).
- [x] Интеграция `@monaco-editor/react` с поддержкой валидации.
- [x] Контент Зоны Linux: квесты (права доступа, анализ загрузки CPU/RAM, поиск по логам, скрытые дескрипторы и Inodes).
- [x] Контент Зоны Git: квесты (разрешение merge-конфликта, `.gitignore`, написание GitHub Actions workflow).
- [x] Журнал инженера (DevOps Journal): сохранение открытых статей и заметок в `localStorage`.

### 🔹 Спринт 3: Зоны «Docker Yard» и «K8s Core District» (2 недели)
- [x] Отрисовка портового района и футуристичных башен Kubernetes.
- [x] Контент Зоны Docker: квесты (оптимизация слоев, docker-compose сеть, volume persistence, multi-stage).
- [x] Контент Зоны K8s: квесты (Deployment + Service, Ingress routing, TLS, ConfigMap injection, Liveness/Readiness probes).
- [x] Первый босс-инцидент: *CrashLoopBackOff Investigation*.

### 🔹 Спринт 4: Зоны «Observability Peak», «Cloud Valley» и War Room (2 недели)
- [x] Контент Зоны Мониторинга: квесты по Prometheus/Grafana (PromQL запросы, поиск спайков latency, настройка алертов).
- [x] Контент Зоны Cloud Valley (IaC): квесты по Terraform/Ansible (защита State с DynamoDB, идемпотентные плейбуки).
- [x] Локация **Incident War Room** со сценариями крупных аварий (502 Bad Gateway, Out of Memory, Disk Space 100%).
- [x] Web Audio звуковое сопровождение: ретро-синтезаторные эффекты взаимодействия и звуки победы.

### 🔹 Спринт 5: DevOps-обвязка проекта (Infrastructure as Code) (1.5 недели)
- [x] Multi-stage `Dockerfile` для сборки игры с Nginx Alpine (Node 20-slim + Nginx).
- [x] GitHub Actions CI/CD (`deploy-game.yml`):
  - Проверка валидности всех манифестов.
  - Тестирование TypeScript кода и сборки.
  - Автоматический деплой на GitHub Pages при мердже в `main`.
- [x] Helm-чарт и K8s-манифесты для развертывания проекта в Kubernetes-кластере (`helm/devops-city-explorer`).
- [x] Terraform-конфигурация для деплоя инфраструктуры, VPC, Security Groups и S3 бакета (`terraform/`).

### 🔹 Спринт 6: Режим для Рекрутеров, Полировка и Релиз (1.5 недели)
- [x] **Режим Рекрутера (Recruiter Fast-Track):**
  - Кнопка в меню «Я рекрутер / Тимлид — показать навыки сразу».
  - Позволяет мгновенно открыть любой квест, увидеть архитектурные схемы и скачать резюме.
- [x] Генерация **DevOps Skill Certificate** в интерактивном окне по завершении игры.
- [x] Финальная документация и гайды по архитектуре.

### 🔹 Спринт 7: Полная Документация Проекта и Архитектурный Гайд (1 неделя)
- [x] **ARCHITECTURE_DEEP_DIVE.md (Архитектурное руководство):**
  - Детальный разбор связки Phaser 3 ↔ React Bridge (Event Mediator, изоляция DOM от Canvas).
  - Паттерн управления состоянием State Manager с Pub/Sub и персистентностью в `localStorage`.
  - Модель рендеринга и физики Arcade (Tilemap GID mapping, статические коллайдеры шлюзов, респонсивные разрешения `Phaser.Scale.FIT`).
- [x] **DOCS_AS_CODE_GUIDE.md (Руководство по созданию квестов):**
  - Спецификация схемы квестов (YAML/JSON schema, типы квестов: `code-fix`, `terminal`).
  - Как устроен движок валидации ответов (RegEx patterns, штрафы SLA, награды).
- [x] **TERMINAL_AND_MOCK_SHELL.md (Эмулятор командной строки):**
  - Архитектура MockShell VFS (виртуальная файловая система в памяти, симуляция Linux процессов, pipes `|`, утилиты `grep`, `lsof`, `chmod`, `systemctl`, `df`, `free`, `truncate`).
- [x] **DEVOPS_CHEAT_SHEET.md (Шпаргалка инженера):**
  - Полный справочник команд и паттернов, затронутых в игре (Linux, Git, Docker, Kubernetes, Prometheus, Grafana, Terraform, CI/CD).
- [x] **DEVELOPER_AND_DEPLOYMENT_GUIDE.md (Гайд по развертыванию):**
  - Инструкция по локальному запуску и сборке (`npm run dev`, `npm run build`).
  - Production-деплой через Docker/Nginx контейнер.
  - Инструкции по Helm и Terraform развертыванию.

---

## 💼 8. Как проект упаковывается в Резюме и Портфолио

### Описание для резюме (Bullet points):
```text
DevOps City Explorer (Интерактивная образовательная платформа-игра) | Разработчик & DevOps
• Спроектировал и реализовал браузерную обучающую 2D-систему на React, TypeScript и Phaser 3 с Docs-as-Code архитектурой (15+ интерактивных тренажеров по Linux, K8s, Docker, CI/CD, PromQL).
• Реализовал модульный движок валидации конфигов (Monaco Editor, Xterm.js) с возможностью автономного офлайн-тестирования ответов.
• Настроил сквозной CI/CD пайплайн на GitHub Actions: автоматический линтинг манифестов квестов, сборка контейнеров, деплой через GitOps.
• Описал полную инфраструктуру развертывания в виде Helm-чартов и Terraform-модулей, подключил мониторинг метрик на базе Prometheus & Grafana.
• Стек: TypeScript, React, Phaser 3, Monaco Editor, Xterm.js, Docker, Kubernetes, Helm, GitHub Actions, Terraform, Prometheus, Grafana.
```

### Ссылки в портфолио:
- 🌐 **Live Demo:** `https://your-domain.dev` (мгновенный доступ с любого устройства)
- 📂 **GitHub Repo:** `https://github.com/your-username/devops-city-explorer`
- 📑 **Инфраструктурные артефакты:** папки `/helm`, `/terraform`, `/.github/workflows`, `/docs`

---

## 🎯 9. Непосредственный следующий шаг (Kickoff)

Для быстрого старта без проволочек рекомендуется следующий порядок действий:
1. **Создать каркас фронтенда:** Инициализировать проект Vite + React + TypeScript + Tailwind/CSS.
2. **Подключить Phaser 3:** Вывести 2D-канвас с перемещающимся персонажем по базовой тайловой карте.
3. **Собрать модальное окно Monaco/Terminal:** Реализовать первый рабочий квест (например, исправление `Dockerfile` Васи).
4. **Завернуть в Docker и запустить CI:** Получить рабочий прототип по ссылке уже через 2–3 дня.