# 🐙 Модуль 6.3: Git и основы CI/CD для дежурного инженера

В современном мире инфраструктура, алерты Prometheus, конфиги Nginx и дашборды Grafana хранятся в Git-репозиториях (**GitOps**). А деплой приложений происходит автоматически через пайплайны **CI/CD** (GitLab CI, GitHub Actions).

---

## 1. Базовые команды Git для работы с инфраструктурным кодом

```bash
# 1. Клонировать репозиторий с конфигами мониторинга
git clone https://gitlab.company.com/devops/monitoring-configs.git

# 2. Переключиться на новую ветку для внесения правок
git checkout -b fix-alert-rules

# 3. Проверить измененные файлы и статус
git status
git diff alertmanager.yml

# 4. Зафиксировать изменения
git add alertmanager.yml
git commit -m "fix(alerts): update telegram chat id for urgent notifications"

# 5. Подтянуть свежие изменения из главной ветки (чтобы избежать конфликтов)
git pull origin main

# 6. Отправить ветку на сервер для создания Merge Request (MR) / Pull Request (PR)
git push origin fix-alert-rules

# 7. Посмотреть последние 5 коммитов (кто и что менял перед аварией)
git log -n 5 --oneline
```

---

## 2. Что такое CI/CD и как устроен пайплайн?

* **CI (Continuous Integration - Непрерывная интеграция):** Автоматическая проверка кода при каждом пуше (линтеры, юнит-тесты, сборка Docker-образа).
* **CD (Continuous Delivery / Deployment - Непрерывная доставка/развертывание):** Автоматическая или ручная доставка собранного образа на тестовые (Staging) и боевые (Production) серверы.

### Пример пайплайна (`.gitlab-ci.yml`):
```yaml
stages:
  - test
  - build
  - deploy

run_tests:
  stage: test
  script:
    - npm run test

build_docker:
  stage: build
  script:
    - docker build -t registry.company.com/app:$CI_COMMIT_SHA .
    - docker push registry.company.com/app:$CI_COMMIT_SHA

deploy_production:
  stage: deploy
  script:
    - kubectl set image deployment/app app=registry.company.com/app:$CI_COMMIT_SHA
  when: manual # Ручной запуск деплоя на прод
```

---

## 3. Дежурный кейс: «Алерт сработал сразу после деплоя»

> 💡 **Частая ситуация:** В 15:00 всё работало стабильно. В 15:05 пришел алерт: `502 Bad Gateway / High Error Rate`.

### Алгоритм расследования:
1. **Проверить историю релизов:** Зайти в GitLab/GitHub в раздел **CI/CD ➔ Pipelines** или историю коммитов.
2. **Определить:** Какой пайплайн завершился в 15:04? Какой сервис выкатился? Какой коммит был залит?
3. **Посмотреть логи джобы деплоя:** Не упала ли миграция базы данных?
4. **Решение проблемы (Mitigation):**
   * Если причина в кривом релизе — запустить кнопку **Rollback (Откат)** в пайплайне на предыдущую стабильную версию.
   * Уведомить разработчика, чей коммит вызвал падение.
