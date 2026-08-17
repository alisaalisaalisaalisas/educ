# 🔍 Модуль 2.2: Сетевая диагностика (curl, ping, ss, tcpdump, nc)

Набор практических утилит для проверки сетевой связности и поиска узких мест.

---

## 1. Проверка доступности портов (`nc` / `telnet` / `curl`)

```bash
# 1. Проверка, открыт ли TCP-порт на удаленном сервере (Netcat)
nc -zv 192.168.1.50 443
# -z : не передавать данные, только проверить соединение (Zero-I/O)
# -v : подробный вывод (Verbose)

# 2. Проверка порта через timeout в bash (если nc не установлен)
timeout 3 bash -c '</dev/tcp/192.168.1.50/443' && echo "Port OPEN" || echo "Port CLOSED"

# 3. Проверка через Telnet
telnet 192.168.1.50 80
```

### 🧩 Декодер сетевых флагов (Must Know):

| Утилита | Флаги | Расшифровка каждого флага |
| :--- | :--- | :--- |
| `ss -tulpn` | `-t -u -l -p -n` | `-t` (**T**CP), `-u` (**U**DP), `-l` (**l**istening - только слушающие), `-p` (**p**rocess - показать PID/имя процесса), `-n` (**n**umeric - не резолвить имена хостов и портов в текст). |
| `curl -Iv` | `-I -v` | `-I` (head/заголовки без тела ответа), `-v` (**v**erbose - показать весь TLS/HTTP диалог запроса и ответа). |
| `curl -s -o /dev/null -w "%{http_code}"` | `-s -o -w` | `-s` (**s**ilent - скрыть прогресс-бар), `-o /dev/null` (выбросить тело страницы), `-w` (**w**rite-out - напечатать кастомный формат, например код ответа). |
| `nc -zv` | `-z -v` | `-z` (**z**ero I/O - сканирование без отправки payload), `-v` (**v**erbose - показать результат `succeeded` / `refused`). |
| `ping -c 4` | `-c` | `-c` (**c**ount) отправить ровно 4 пакета и завершить работу. |

---

## 2. Анализ HTTP/HTTPS запросов через `curl`

`curl` — швейцарский нож инженера для проверки веб-сервисов и API.

```bash
# 1. Получить только заголовки и статус-код (без тела страницы)
curl -Iv https://example.com

# 2. Отправить запрос в обход DNS (напрямую на IP конкретного бэкенда)
curl -Iv https://example.com --resolve example.com:443:10.0.0.15

# 3. Замерить тайминги ответа (DNS, Connect, TLS, TTFB, Total)
curl -o /dev/null -s -w "DNS: %{time_namelookup}s | Connect: %{time_connect}s | TLS: %{time_appconnect}s | TTFB: %{time_starttransfer}s | Total: %{time_total}s\n" https://example.com

# 4. Проверка срока действия SSL-сертификата через OpenSSL
echo | openssl s_client -servername example.com -connect example.com:443 2>/dev/null | openssl x509 -noout -dates
```

---

## 3. Прослушиваемые порты и соединения (`ss` / `netstat`)

Утилита `ss` (Socket Statistics) пришла на замену старому `netstat`.

```bash
# Показать все слушающие TCP и UDP порты с именами процессов
ss -tulpn

# Показать все установленные соединения к конкретному порту (например, 80)
ss -tn state established '( dport = :80 or sport = :80 )'

# Подсчет количества активных TCP-соединений в разных состояниях
ss -s
```

---

## 4. Маршрутизация и потери пакетов (`ping`, `traceroute`, `mtr`)

```bash
# Проверка сетевой задержки и потерь
ping -c 5 8.8.8.8

# Трассировка маршрута (где теряются пакеты по пути)
traceroute -T -p 443 example.com   # Через TCP SYN на 443 порт

# Интерактивный мониторинг качества маршрута в реальном времени
mtr -rw example.com
```

---

## 5. Захват сетевых пакетов (`tcpdump`)

Когда нужно понять, приходят ли пакеты на сервер и что именно внутри.

```bash
# Слушать весь трафик на интерфейсе eth0 на порту 80
tcpdump -i eth0 -nn -s0 port 80

# Отфильтровать трафик с конкретного IP
tcpdump -i any -nn host 192.168.1.100 and port 443

# Сохранить дамп в pcap-файл для анализа в Wireshark
tcpdump -i eth0 -w /tmp/capture.pcap port 53
```

---

## 💡 Кейс на собеседовании: «Сайт не открывается у пользователей»
**Порядок действий инженера:**
1. Резолвится ли имя? (`dig example.com +short`)
2. Идет ли ICMP-пинг? (`ping example.com`)
3. Открыт ли 443 порт? (`nc -zv example.com 443`)
4. Что отвечает веб-сервер? (`curl -Iv https://example.com`)
5. Слушает ли сервис порт на самом сервере? (`ss -tulpn | grep 443`)
6. Что пишут логи веб-сервера? (`tail -n 50 /var/log/nginx/error.log`)
