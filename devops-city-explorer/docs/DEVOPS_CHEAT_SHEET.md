# 📑 DevOps Cheat Sheet: Шпаргалка Инженера

> **Быстрый справочник по командам, конфигам и алгоритмам траблшутинга, встречающимся в DevOps City Explorer**

---

## 🐧 1. Linux Core & Troubleshooting

### Диагностика ресурсов:
```bash
# Топ процессов по памяти
ps aux --sort=-%mem | head -n 10

# Топ процессов по CPU
ps aux --sort=-%cpu | head -n 10

# Проверка Load Average и Uptime
uptime

# Анализ свободной памяти в мегабайтах
free -m -h

# Проверка заполнения дисков и таблицы инодов
df -h
df -i

# Поиск удаленных файлов, которые удерживаются процессами (100% disk bug)
lsof +L1
lsof | grep deleted

# Обнуление файла лога без рестарта процесса
truncate -s 0 /proc/$PID/fd/$FD
:> /path/to/logfile.log
```

### Системный журнал и OOM Killer:
```bash
# Поиск сообщений OOM Killer в ядре
dmesg -T | grep -i -E "oom|out of memory|killed process"

# Логи сервиса в systemd
journalctl -u backend-app -n 100 --no-pager
systemctl restart backend-app
```

---

## 🌐 2. Компьютерные Сети & Nginx

### Сетевая диагностика:
```bash
# Проверка открытых портов и слушающих сокетов
ss -tulpn
netstat -tulpn

# Проверка доступности порта и времени ответа
curl -Iv https://api.devops.city
curl -w "\nHTTP: %{http_code} | Time: %{time_total}s\n" -o /dev/null -s https://example.com

# Трассировка и DNS резолв
dig +short api.devops.city
nslookup api.devops.city
```

### Шаблон Nginx Reverse Proxy:
```nginx
upstream backend_servers {
    server 127.0.0.1:8080 max_fails=3 fail_timeout=10s;
    keepalive 32;
}

server {
    listen 80;
    server_name api.devops.city;

    location / {
        proxy_pass http://backend_servers;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_connect_timeout 5s;
        proxy_read_timeout 60s;
    }
}
```

---

## 🐳 3. Docker & Multi-Stage Builds

### Оптимизированный Dockerfile:
```dockerfile
# 1. Этап сборки (Build Stage)
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /server .

# 2. Финальный легковесный образ (Runtime Stage)
FROM alpine:3.19
RUN adduser -D -u 10001 appuser
USER appuser
WORKDIR /home/appuser
COPY --from=builder /server /server
EXPOSE 8080
ENTRYPOINT ["/server"]
```

---

## ☸️ 4. Kubernetes & Ingress

### Траблшутинг CrashLoopBackOff:
```bash
# Получить список подов с кодами завершения
kubectl get pods -n production -o wide

# Просмотреть события пода
kubectl describe pod <pod-name> -n production

# Логи предыдущего упавшего инстанса контейнера
kubectl logs <pod-name> --previous -n production
```

### Манифест Ingress с TLS:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - api.devops.city
      secretName: api-tls-secret
  rules:
    - host: api.devops.city
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-service
                port:
                  number: 80
```

---

## 📊 5. PromQL & Мониторинг

### Базовые PromQL паттерны:
```promql
# 1. RPS (Запросов в секунду) по сервисам
sum(rate(http_requests_total[5m])) by (service, status)

# 2. Процент 5xx ошибок от общего трафика (Error Rate)
sum(rate(http_requests_total{status=~"5.."}[5m])) 
/ 
sum(rate(http_requests_total[5m])) * 100

# 3. 99-й перцентиль времени ответа (P99 Latency)
histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, handler))

# 4. Утилизация CPU ноды в процентах
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
```

---

## ☁️ 6. Terraform & IaC

```hcl
terraform {
  required_version = ">= 1.5.0"
  backend "s3" {
    bucket         = "prod-terraform-state"
    key            = "platform/state.tfstate"
    region         = "eu-central-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
```
