# 6. Kubernetes

---

## Что такое Kubernetes (K8s)

**Kubernetes** — система оркестрации контейнеров с открытым исходным кодом. Автоматизирует развёртывание, масштабирование и управление контейнеризированными приложениями.

---

## Архитектура

```
┌──────────────── Control Plane ────────────────┐
│  API Server ← точка входа для всех операций   │
│  etcd       ← распределённое хранилище (state) │
│  Scheduler  ← выбирает ноду для Pod           │
│  Controller Manager ← поддерживает состояние  │
└───────────────────────────────────────────────┘
        │               │               │
┌───────▼───┐   ┌───────▼───┐   ┌───────▼───┐
│  Worker    │   │  Worker    │   │  Worker    │
│  Node 1    │   │  Node 2    │   │  Node 3    │
│ ┌────────┐ │   │ ┌────────┐ │   │ ┌────────┐ │
│ │ kubelet│ │   │ │ kubelet│ │   │ │ kubelet│ │
│ │ kube-  │ │   │ │ kube-  │ │   │ │ kube-  │ │
│ │ proxy  │ │   │ │ proxy  │ │   │ │ proxy  │ │
│ │ Pods   │ │   │ │ Pods   │ │   │ │ Pods   │ │
│ └────────┘ │   │ └────────┘ │   │ └────────┘ │
└────────────┘   └────────────┘   └────────────┘
```

---

## Основные объекты

### Workloads (Рабочие нагрузки)

| Объект | Описание |
|---|---|
| **Pod** | Минимальная единица — один или несколько контейнеров с общей сетью и хранилищем |
| **Deployment** | Управляет ReplicaSet, обеспечивает Rolling Update и откат |
| **ReplicaSet** | Поддерживает заданное количество копий Pod |
| **StatefulSet** | Для stateful-приложений (БД) — стабильные имена и хранилища |
| **DaemonSet** | По одному Pod на каждой ноде (логирование, мониторинг) |
| **Job / CronJob** | Одноразовые / периодические задачи |

### Networking (Сеть)

| Объект | Описание |
|---|---|
| **Service** | Стабильный IP/DNS для группы Pod |
| **ClusterIP** | Доступ только внутри кластера (по умолчанию) |
| **NodePort** | Открывает порт на каждой ноде (30000-32767) |
| **LoadBalancer** | Внешний балансировщик (облако) |
| **Ingress** | HTTP/HTTPS-маршрутизация по доменам и путям |

### Configuration & Storage

| Объект | Описание |
|---|---|
| **ConfigMap** | Конфигурация в виде ключ-значение |
| **Secret** | Чувствительные данные (base64, но НЕ шифрование) |
| **PersistentVolume (PV)** | Физическое хранилище |
| **PersistentVolumeClaim (PVC)** | Запрос на хранилище от Pod |

### RBAC (Контроль доступа)

| Объект | Описание |
|---|---|
| **ServiceAccount** | Идентификация Pod в кластере |
| **Role / ClusterRole** | Набор разрешений |
| **RoleBinding / ClusterRoleBinding** | Привязка роли к пользователю/сервису |

---

## Примеры манифестов

### Deployment + Service

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: marketplace
  labels:
    app: backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: marketplace/backend:1.2.0
          ports:
            - containerPort: 3000
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 15
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
          envFrom:
            - configMapRef:
                name: backend-config
            - secretRef:
                name: backend-secrets
---
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: marketplace
spec:
  selector:
    app: backend
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
```

### Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: marketplace-ingress
  namespace: marketplace
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
    - host: marketplace.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  number: 80
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: backend
                port:
                  number: 80
```

### ConfigMap + Secret

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
data:
  APP_PORT: "3000"
  LOG_LEVEL: "info"
  DATABASE_HOST: "postgres.marketplace.svc"
---
apiVersion: v1
kind: Secret
metadata:
  name: backend-secrets
type: Opaque
data:
  DATABASE_PASSWORD: cDRzc3cwcmQ=   # base64 of "p4ssw0rd"
  JWT_SECRET: bXlzZWNyZXRrZXk=
```

---

## Основные команды kubectl

```bash
# Информация о кластере
kubectl cluster-info
kubectl get nodes

# Работа с ресурсами
kubectl get pods -n marketplace
kubectl get svc,deploy,ingress -n marketplace
kubectl describe pod backend-abc123 -n marketplace

# Логи и отладка
kubectl logs -f backend-abc123 -n marketplace
kubectl exec -it backend-abc123 -n marketplace -- sh
kubectl port-forward svc/backend 8080:80 -n marketplace

# Применение манифестов
kubectl apply -f deployment.yaml
kubectl delete -f deployment.yaml

# Масштабирование
kubectl scale deployment backend --replicas=5 -n marketplace

# Откат
kubectl rollout status deployment/backend -n marketplace
kubectl rollout undo deployment/backend -n marketplace
kubectl rollout history deployment/backend -n marketplace
```

---

## Helm (Пакетный менеджер K8s)

| Концепция | Описание |
|---|---|
| **Chart** | Пакет K8s-манифестов с шаблонами |
| **Release** | Установленный экземпляр Chart |
| **Values** | Параметры для кастомизации (`values.yaml`) |
| **Repository** | Хранилище Charts |

```bash
# Установка чарта
helm install myapp ./helm-chart -n marketplace -f values-prod.yaml

# Обновление
helm upgrade myapp ./helm-chart -n marketplace --set image.tag=1.3.0

# Список релизов
helm list -n marketplace

# Откат
helm rollback myapp 1
```

---

## Локальные кластеры (для разработки)

| Инструмент | Описание |
|---|---|
| **Minikube** | Одноузловой кластер в VM/Docker |
| **Kind** | Kubernetes в Docker-контейнерах |
| **k3s/k3d** | Лёгкий дистрибутив K8s |
| **Docker Desktop** | Встроенный K8s |

```bash
# Minikube
minikube start --driver=docker --cpus=4 --memory=8192
minikube addons enable ingress
minikube dashboard

# Kind
kind create cluster --name dev --config kind-config.yaml
```
