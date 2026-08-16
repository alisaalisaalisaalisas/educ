# 🐳 Модуль 5.1: Основы Docker: команды, логи, инспекция

Docker позволяет упаковывать приложение и все его зависимости в изолированный контейнер.

---

## 1. Контейнер vs Виртуальная машина

* **Виртуальная машина (KVM, VMware):** Эмулирует полноценное железо и запускает собственное независимое ядро гостевой ОС (тяжеловесная, долгий запуск).
* **Docker Контейнер:** Изолированный процесс на хосте, использующий общее ядро Linux через механизмы `namespaces` (изоляция сети, PID, монтирований) и `cgroups` (лимиты CPU/RAM).

---

## 2. Шпаргалка по командам Docker

```bash
# 1. Просмотр запущенных контейнеров (или всех с ключом -a)
docker ps
docker ps -a

# 2. Просмотр логов контейнера (с отслеживанием в реальном времени)
docker logs -f --tail 100 <container_name_or_id>
docker logs --since 10m <container_name> # Логи за последние 10 минут

# 3. Мониторинг потребления ресурсов контейнерами (CPU, RAM, Net I/O)
docker stats --no-stream

# 4. Вход внутрь работающего контейнера в интерактивный shell
docker exec -it <container_name> /bin/bash
docker exec -it <container_name> /bin/sh # если bash нет (Alpine)

# 5. Инспекция параметров контейнера (IP, переменные окружения, маунты)
docker inspect <container_name>

# 6. Получить только IP-адрес контейнера через jsonpath
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' <container_name>

# 7. Управление состоянием контейнеров
docker restart <container_name>
docker stop <container_name>
docker rm -f <container_name>

# 8. Очистка неиспользуемых контейнеров, сетей и зависших образов
docker system prune -a --volumes
```

---

## 3. Лимиты ресурсов (CPU и Memory) в Docker

Если контейнер не ограничен по памяти, он может вызвать OOM Killer всего хоста.
```bash
# Запуск с лимитом в 512 МБ памяти и 1 ядром CPU
docker run -d --name my-app -m 512m --cpus 1.0 nginx:alpine
```
