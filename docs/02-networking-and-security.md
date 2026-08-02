# 2. Сети и Безопасность

---

## DNS (Domain Name System)

**DNS** — система доменных имён, переводящая читаемые имена (например `google.com`) в IP-адреса.

### Принцип работы

```
Браузер → Локальный кеш → Резолвер (провайдер/8.8.8.8)
  → Root DNS (.)
    → TLD DNS (.com)
      → Authoritative DNS (google.com → 142.250.74.206)
```

### Типы DNS-записей

| Запись | Назначение | Пример |
|---|---|---|
| `A` | Имя → IPv4-адрес | `example.com → 93.184.216.34` |
| `AAAA` | Имя → IPv6-адрес | `example.com → 2606:2800:220:1:...` |
| `CNAME` | Алиас (псевдоним) | `www.example.com → example.com` |
| `MX` | Почтовый сервер | `example.com → mail.example.com` |
| `TXT` | Текстовая информация | SPF, DKIM, верификация домена |
| `NS` | Авторитативный DNS-сервер | `example.com → ns1.provider.com` |
| `SRV` | Сервис + порт | Используется в Kubernetes, SIP |
| `PTR` | Обратная запись (IP → имя) | Для reverse DNS |

### Инструменты

```bash
dig example.com A          # Запрос A-записи
dig example.com MX +short  # Только ответ
nslookup example.com       # Простой запрос
host example.com            # Ещё проще
```

---

## HTTP / HTTPS

### HTTP (HyperText Transfer Protocol)

Протокол прикладного уровня для передачи данных в вебе. Работает по модели «запрос-ответ».

**Структура HTTP-запроса:**
```
GET /api/products HTTP/1.1
Host: marketplace.local
Accept: application/json
Authorization: Bearer <token>
```

**Основные методы:**

| Метод | Назначение | Идемпотентный |
|---|---|---|
| `GET` | Получить ресурс | Да |
| `POST` | Создать ресурс | Нет |
| `PUT` | Заменить ресурс | Да |
| `PATCH` | Частично обновить | Нет |
| `DELETE` | Удалить ресурс | Да |

**Коды ответов:**

| Диапазон | Категория | Примеры |
|---|---|---|
| `2xx` | Успех | `200 OK`, `201 Created`, `204 No Content` |
| `3xx` | Перенаправление | `301 Moved`, `302 Found`, `304 Not Modified` |
| `4xx` | Ошибка клиента | `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found` |
| `5xx` | Ошибка сервера | `500 Internal Error`, `502 Bad Gateway`, `503 Service Unavailable` |

### HTTPS

**HTTPS = HTTP + TLS/SSL** — зашифрованная версия HTTP. Весь трафик шифруется, данные защищены от перехвата.

- Порт по умолчанию: **443** (vs 80 для HTTP)
- Требуется SSL/TLS-сертификат
- Обязателен для любого продакшн-сайта

---

## SSL/TLS

**SSL** (Secure Sockets Layer) и **TLS** (Transport Layer Security) — криптографические протоколы для защищённого соединения. TLS — современная версия (SSL устарел).

### Процесс TLS Handshake

```
Клиент                              Сервер
  │── ClientHello (поддерж. шифры) ──→│
  │←── ServerHello + Сертификат ──────│
  │── Проверка сертификата ──────────→│
  │── Обмен ключами ─────────────────→│
  │←── Подтверждение ─────────────────│
  │═══ Зашифрованное соединение ═════│
```

### Сертификаты

| Понятие | Описание |
|---|---|
| **CA** (Certificate Authority) | Удостоверяющий центр, выпускающий сертификаты |
| **Let's Encrypt** | Бесплатный CA с автоматической выдачей |
| **Self-Signed** | Самоподписанный сертификат (для разработки) |
| **CSR** | Запрос на подпись сертификата |
| **Wildcard** | Сертификат `*.example.com` — на все поддомены |
| **SAN** | Subject Alternative Name — несколько доменов в одном сертификате |

```bash
# Генерация самоподписанного сертификата
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Проверка сертификата удалённого сервера
openssl s_client -connect example.com:443
```

---

## SSH (Secure Shell)

Протокол для защищённого удалённого доступа к серверам и передачи данных.

### Основные операции

```bash
# Подключение к серверу
ssh user@192.168.1.100

# Подключение с указанием ключа и порта
ssh -i ~/.ssh/mykey.pem -p 2222 user@server.com

# Копирование файлов (SCP)
scp file.txt user@server:/home/user/

# Синхронизация директорий (rsync через SSH)
rsync -avz ./project/ user@server:/deploy/

# Туннелирование (проброс портов)
ssh -L 8080:localhost:80 user@server    # Локальный → удалённый
ssh -R 9090:localhost:3000 user@server  # Удалённый → локальный
```

### SSH-ключи

```bash
# Генерация ключевой пары
ssh-keygen -t ed25519 -C "user@example.com"

# Копирование публичного ключа на сервер
ssh-copy-id user@server

# Конфигурационный файл ~/.ssh/config
Host myserver
    HostName 192.168.1.100
    User admin
    Port 2222
    IdentityFile ~/.ssh/mykey
```

| Файл | Назначение |
|---|---|
| `~/.ssh/id_ed25519` | Приватный ключ (НИКОГДА не передавать) |
| `~/.ssh/id_ed25519.pub` | Публичный ключ (ставится на сервер) |
| `~/.ssh/authorized_keys` | Список разрешённых ключей на сервере |
| `~/.ssh/known_hosts` | Отпечатки серверов, к которым подключались |

---

## Forward Proxy (Прямой прокси)

Прокси-сервер, стоящий **перед клиентами** и выполняющий запросы от их имени.

```
Клиенты ──→ [Forward Proxy] ──→ Интернет
```

**Назначение:**
- Фильтрация контента (блокировка сайтов)
- Анонимизация (сервер не видит IP клиента)
- Кеширование для ускорения
- Контроль доступа в корпоративных сетях

**Примеры:** Squid, Privoxy, корпоративные прокси.

---

## Reverse Proxy (Обратный прокси)

Прокси-сервер, стоящий **перед серверами** и принимающий запросы от клиентов.

```
Интернет ──→ [Reverse Proxy] ──→ Backend-серверы
```

**Назначение:**
- Балансировка нагрузки между backend-серверами
- SSL-терминация (разгрузка шифрования)
- Кеширование статики
- Защита от DDoS
- Единая точка входа для микросервисов

**Примеры:** Nginx, HAProxy, Traefik, Envoy.

```nginx
# Nginx как reverse proxy
server {
    listen 80;
    server_name marketplace.local;

    location / {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Caching Server (Сервер кеширования)

Сервер, хранящий копии часто запрашиваемых данных для ускорения отдачи.

| Тип | Описание | Примеры |
|---|---|---|
| **In-Memory** | Кеш в оперативной памяти | Redis, Memcached |
| **CDN** | Географически распределённый кеш | Cloudflare, CloudFront |
| **HTTP-кеш** | Кеширование HTTP-ответов | Varnish, Nginx |
| **DNS-кеш** | Кеширование DNS-ответов | Unbound, dnsmasq |

```
# HTTP-заголовки кеширования
Cache-Control: public, max-age=3600    # Кешировать 1 час
ETag: "abc123"                          # Валидация по хешу
Last-Modified: Wed, 01 Jan 2025 00:00:00 GMT
```

---

## Firewall (Брандмауэр)

Система фильтрации сетевого трафика на основе правил.

### Типы

| Тип | Уровень OSI | Описание |
|---|---|---|
| Пакетный фильтр | L3-L4 | По IP, порту, протоколу |
| Stateful | L3-L4 | Отслеживает состояние соединений |
| WAF (Web Application Firewall) | L7 | Анализ HTTP-запросов |

### Инструменты

```bash
# UFW (Ubuntu) — упрощённый интерфейс
ufw enable
ufw allow 22/tcp
ufw allow 80,443/tcp
ufw deny from 10.0.0.5

# iptables — низкоуровневый
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -j DROP

# firewalld (CentOS/RHEL)
firewall-cmd --add-service=http --permanent
firewall-cmd --reload
```

---

## Load Balancer (Балансировщик нагрузки)

Распределяет входящий трафик между несколькими серверами.

### Алгоритмы балансировки

| Алгоритм | Описание |
|---|---|
| **Round Robin** | По очереди каждому серверу |
| **Weighted Round Robin** | С учётом веса (мощности) сервера |
| **Least Connections** | Серверу с наименьшим числом соединений |
| **IP Hash** | Привязка клиента к серверу по IP |
| **Random** | Случайный выбор |

### Уровни балансировки

- **L4 (Transport)** — по IP/порту, не анализируя содержимое (HAProxy TCP, Nginx Stream)
- **L7 (Application)** — по URL, заголовкам, cookies (Nginx, HAProxy HTTP, Traefik)

```nginx
# Nginx: L7-балансировка
upstream backend {
    least_conn;
    server backend1:3000 weight=3;
    server backend2:3000 weight=1;
    server backend3:3000 backup;
}

server {
    listen 80;
    location / {
        proxy_pass http://backend;
    }
}
```

---

## Cloudflare

**Cloudflare** — глобальная платформа для защиты и ускорения веб-ресурсов.

### Возможности

| Функция | Описание |
|---|---|
| **CDN** | Кеширование контента на 300+ точках по всему миру |
| **DDoS-защита** | Автоматическая фильтрация атак на L3/L4/L7 |
| **WAF** | Защита от SQL-инъекций, XSS и т.д. |
| **DNS** | Быстрый DNS с низкой задержкой |
| **SSL/TLS** | Бесплатные сертификаты, гибкие режимы шифрования |
| **Workers** | Serverless-функции на edge |
| **Zero Trust** | Защищённый доступ к внутренним ресурсам |
| **Tunnels** | Проброс локальных сервисов через `cloudflared` |

### Режимы SSL

```
Flexible   — HTTPS только между клиентом и Cloudflare
Full       — HTTPS до origin, но сертификат не проверяется
Full Strict — HTTPS до origin с валидным сертификатом (рекомендуется)
```
