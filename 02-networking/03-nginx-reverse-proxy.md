# 🌐 Модуль 2.3: Nginx: Reverse Proxy, Балансировка и Траблшутинг

**Nginx** — самый распространенный веб-сервер и обратный прокси (Reverse Proxy). Почти любой веб-трафик сначала попадает в Nginx, а затем передается на бэкенд-сервисы.

---

## 1. Что такое Reverse Proxy?

* **Forward Proxy:** Стоит перед клиентом (пользователем) и скрывает клиента от интернета (например, офисный VPN/прокси).
* **Reverse Proxy (Nginx):** Стоит перед серверами (бэкендами) и скрывает их внутреннюю архитектуру от пользователей, распределяя запросы, терминируя SSL и отдавая статику.

---

## 2. Базовая конфигурация Nginx (`/etc/nginx/conf.d/app.conf`)

```nginx
# 1. Группа бэкенд-серверов (Upstream)
upstream backend_cluster {
    # Алгоритм балансировки по умолчанию: Round-Robin (по очереди)
    # Альтернативы: least_conn (на наименее загруженный), ip_hash (привязка клиента по IP)
    server 10.0.0.11:8080 max_fails=3 fail_timeout=10s;
    server 10.0.0.12:8080 max_fails=3 fail_timeout=10s;
}

# 2. Виртуальный хост (Server)
server {
    listen 80;
    server_name api.example.com;

    # Редирект с HTTP на HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    # Пути к SSL-сертификатам
    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    # Логи
    access_log /var/log/nginx/api_access.log;
    error_log /var/log/nginx/api_error.log warn;

    # Проксирование API-запросов на бэкенд
    location / {
        proxy_pass http://backend_cluster;
        
        # Передача реальных клиентских заголовков бэкенду
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Тайм-ауты ожидания ответа от бэкенда
        proxy_connect_timeout 5s;
        proxy_read_timeout 60s;
    }

    # Отдача статики напрямую без бэкенда
    location /static/ {
        root /var/www/html;
        expires 30d;
    }
}
```

---

## 3. Команды управления Nginx

```bash
# 1. ПРОВЕРКА СИНТАКСИСА КОНФИГА (Всегда выполнять перед перезапуском!)
nginx -t

# 2. Бесшовное применение конфига (без обрыва активных соединений пользователей)
nginx -s reload
# или
systemctl reload nginx

# 3. Полный перезапуск
systemctl restart nginx
```

---

## 4. Диагностика частых ошибок Nginx

| Ошибка в `error.log` | Что означает | Как лечить |
| :--- | :--- | :--- |
| `111: Connection refused while connecting to upstream` | Nginx не может подключиться к порту бэкенда | Проверить, запущен ли бэкенд (`systemctl status` / `docker ps`), слушает ли он нужный порт (`ss -tulpn`). |
| `no live upstreams while connecting to upstream` | Все серверы из блока `upstream` упали и помечены как неработающие | Проверить состояние всех реплик бэкенда. |
| `upstream timed out (110: Connection timed out)` (504 Error) | Бэкенд принял запрос, но не ответил за время `proxy_read_timeout` | Завис тяжелый SQL-запрос, перегружена база данных или внешний API. |
| `client intended to send too large body` (413 Error) | Клиент загружает файл больше разрешенного лимита | Увеличить директиву `client_max_body_size 50M;` в блоке `server` или `http`. |
