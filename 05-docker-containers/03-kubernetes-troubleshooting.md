# ☸️ Модуль 5.3: Kubernetes: Архитектура, Манифесты, Best Practices и Траблшутинг

**Kubernetes (K8s)** — ведущая платформа оркестрации контейнеризированных приложений. Она автоматизирует развертывание, масштабирование, балансировку нагрузки и самовосстановление (Self-healing) микросервисов.

---

## 🏛️ 1. Архитектура Kubernetes

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CONTROL PLANE (MASTER NODE)                          │
│                                                                        │
│  ┌────────────────┐     ┌──────────────┐     ┌──────────────────────┐  │
│  │   kube-apiserver│ ◄── │  kube-scheduler│  │kube-controller-manager│ │
│  └────────┬───────┘     └──────────────┘     └──────────────────────┘  │
│           │                                                            │
│     ┌─────▼─────┐                                                      │
│     │   etcd    │  (Распределенная база данных состояния кластера)     │
│     └───────────┘                                                      │
└───────────┬────────────────────────────────────────────────────────────┘
            │
 ┌──────────┴──────────────────────────┬──────────────────────────┐
 │                                     │                          │
 ▼                                     ▼                          ▼
┌───────────────────────────┐ ┌───────────────────────────┐ ┌───────────────────────────┐
│        WORKER NODE 1      │ │        WORKER NODE 2      │ │        WORKER NODE 3      │
│ ┌───────────────┐         │ │ ┌───────────────┐         │ │ ┌───────────────┐         │
│ │    kubelet    │         │ │ │    kubelet    │         │ │ │    kubelet    │         │
│ ├───────────────┤         │ │ ├───────────────┤         │ │ ├───────────────┤         │
│ │   kube-proxy  │         │ │ │   kube-proxy  │         │ │ │   kube-proxy  │         │
│ ├───────────────┤         │ │ ├───────────────┤         │ │ ├───────────────┤         │
│ │Container Runtime (CRI)│ │ │ │Container Runtime (CRI)│ │ │ │Container Runtime (CRI)│ │
│ └───────┬───────┘         │ │ └───────┬───────┘         │ │ └───────┬───────┘         │
│   ┌─────▼─────────────┐   │ │   ┌─────▼─────────────┐   │ │   ┌─────▼─────────────┐   │
│   │ Pod 1  │  Pod 2   │   │ │   │ Pod 3  │  Pod 4   │   │ │   │ Pod 5  │  Pod 6   │   │
│   └───────────────────┘   │ │   └───────────────────┘   │ │   └───────────────────┘   │
└───────────────────────────┘ └───────────────────────────┘ └───────────────────────────┘
```

### Основные компоненты:
* **`kube-apiserver`**: Центральная точка входа («мозг»). Все клиенты (`kubectl`), воркер-ноды и контроллеры общаются только через него по REST API.
* **`etcd`**: Отказоустойчивое хранилище формата ключ-значение, где хранится вся конфигурация и текущий статус кластера.
* **`kube-scheduler`**: Анализирует требования подов (CPU, RAM, Affinity) и выбирает наилучшую ноду для их запуска.
* **`kubelet`**: Агент на каждой ноде. Следит за состоянием контейнеров через Container Runtime (containerd/CRI-O) и отчитывается мастеру.
* **`kube-proxy`**: Сетевой прокси на нодах. Настраивает правила iptables/IPVS для роутинга трафика Services.

---

## 📜 2. Анатомия и культура написания K8s-манифестов

Каждый манифест в Kubernetes имеет 4 обязательных корневых поля:
1. `apiVersion`: Версия API ресурса (`apps/v1`, `v1`, `networking.k8s.io/v1`).
2. `kind`: Тип объекта (`Deployment`, `Service`, `ConfigMap`, `Ingress`).
3. `metadata`: Метаданные (имя, неймспейс, лейблы, аннотации).
4. `spec`: Декларативное описание **желаемого состояния** объекта.

### 🏷️ Стандартные рекомендуемые лейблы (Kubernetes Recommended Labels)
Использование единого стандарта лейблов упрощает мониторинг, поиск логов и управление через Helm:
```yaml
metadata:
  labels:
    app.kubernetes.io/name: "orders-api"          # Название приложения
    app.kubernetes.io/instance: "orders-api-prod" # Уникальный инстанс/релиз
    app.kubernetes.io/version: "1.8.4"            # Версия сборки
    app.kubernetes.io/component: "backend"        # Компонент (frontend, backend, db)
    app.kubernetes.io/part-of: "ecommerce"        # Часть большой системы
    app.kubernetes.io/managed-by: "helm"          # Инструмент управления (helm/argocd/manual)
```

---

## 🚀 3. Эталонный Production-Ready манифест `Deployment`

Манифест ниже включает **все требования надежности и безопасности**: ресурсы, 3 типа проб, защиту от сбоев при выкатке, разнос по нодам (Anti-Affinity), непривилегированный SecurityContext и Graceful Shutdown:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orders-api
  namespace: production
  labels:
    app.kubernetes.io/name: orders-api
    app.kubernetes.io/component: backend
spec:
  replicas: 3
  revisionHistoryLimit: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%        # Дополнительно поднимаем до 25% новых подов при деплое
      maxUnavailable: 0    # НИ ОДИН старый под не гасится, пока новый не станет Ready
  selector:
    matchLabels:
      app.kubernetes.io/name: orders-api
  template:
    metadata:
      labels:
        app.kubernetes.io/name: orders-api
        app.kubernetes.io/component: backend
    spec:
      # Защита от потери запросов при остановке пода (Graceful Shutdown)
      terminationGracePeriodSeconds: 45

      # Разнос реплик по разным физическим нодам для высокой доступности (HA)
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchExpressions:
                    - key: app.kubernetes.io/name
                      operator: In
                      values: ["orders-api"]
                topologyKey: "kubernetes.io/hostname"

      # Контекст безопасности на уровне Pod
      securityContext:
        runAsNonRoot: true
        runAsUser: 10001
        runAsGroup: 10001
        fsGroup: 10001
        seccompProfile:
          type: RuntimeDefault

      containers:
        - name: orders-api
          image: registry.example.com/ecommerce/orders-api:v1.8.4
          imagePullPolicy: IfNotPresent

          # Контекст безопасности контейнера
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop:
                - ALL

          ports:
            - name: http
              containerPort: 8080
              protocol: TCP

          # 1. Лимиты и гарантированные ресурсы (QoS: Burstable)
          resources:
            requests:
              cpu: 200m        # 0.2 CPU ядра
              memory: 256Mi    # 256 МБ RAM
            limits:
              cpu: 1000m       # Максимум 1 CPU ядро
              memory: 512Mi    # Лимит памяти (при превышении — OOMKilled)

          # 2. Пробы работоспособности (Probes)
          # Проба первоначального старта (дает время на загрузку тяжелых библиотек)
          startupProbe:
            httpGet:
              path: /healthz/startup
              port: http
            failureThreshold: 30
            periodSeconds: 2

          # Проба жизнеспособности (убивает и перезапускает зависший под)
          livenessProbe:
            httpGet:
              path: /healthz/liveness
              port: http
            initialDelaySeconds: 5
            periodSeconds: 10
            timeoutSeconds: 3
            failureThreshold: 3

          # Проба готовности (включает/выключает под в балансировку Service)
          readinessProbe:
            httpGet:
              path: /healthz/readiness
              port: http
            periodSeconds: 5
            timeoutSeconds: 2
            successThreshold: 1
            failureThreshold: 2

          # 3. Хук корректного завершения (Graceful Shutdown)
          # Дает время iptables/kube-proxy обновиться до того, как процесс закроет сокет
          lifecycle:
            preStop:
              exec:
                command: ["/bin/sh", "-c", "sleep 10"]

          # Временная папка в RAM для приложений, требующих записи во временные файлы
          volumeMounts:
            - name: tmp-volume
              mountPath: /tmp

          envFrom:
            - configMapRef:
                name: orders-api-config
            - secretRef:
                name: orders-api-secrets

      volumes:
        - name: tmp-volume
          emptyDir: {}
```

---

## 🌐 4. Манифесты Service, Ingress, HPA, PDB и NetworkPolicy

### 1. Service (ClusterIP)
```yaml
apiVersion: v1
kind: Service
metadata:
  name: orders-api-svc
  namespace: production
spec:
  type: ClusterIP
  selector:
    app.kubernetes.io/name: orders-api
  ports:
    - name: http
      port: 80
      targetPort: http
```

### 2. Ingress (TLS + HTTPS Routing)
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: orders-api-ingress
  namespace: production
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
spec:
  tls:
    - hosts:
        - api.example.com
      secretName: api-example-tls-secret
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: orders-api-svc
                port:
                  number: 80
```

### 3. HorizontalPodAutoscaler (HPA v2)
Автоматическое горизонтальное масштабирование реплик от 3 до 10 при росте нагрузки:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: orders-api-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: orders-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### 4. PodDisruptionBudget (PDB — Защита доступности)
Гарантирует, что во время плановых обновлений нод (`kubectl drain`) всегда будет работать минимум 2 реплики сервиса:
```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: orders-api-pdb
  namespace: production
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app.kubernetes.io/name: orders-api
```

### 5. NetworkPolicy (Сетевая изоляция Zero Trust)
Разрешает входящий трафик на бэкенд только от Ingress-контроллера и запрещает прямой доступ из чужих неймспейсов:
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-ingress-only
  namespace: production
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: orders-api
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: ingress-nginx
      ports:
        - protocol: TCP
          port: 8080
```

---

## 🎯 5. Культура и правила надежности в K8s

### 1. Resources: Requests vs Limits & QoS классы
* **`requests`**: Гарантированное количество ресурсов. Используется **Scheduler**'ом для выбора ноды. Если на ноде свободно 1.5 ГБ RAM, а запрошено 2 ГБ — под на нее не встанет (`Pending`).
* **`limits`**: Жесткий потолок.
  * При превышении `limits.cpu` ядро Linux начинает троттлить процесс (Throttle / падение RPS).
  * При превышении `limits.memory` процесс немедленно убивается ядром с ошибкой `OOMKilled` (Exit Code 137).

#### Классы качества обслуживания (QoS Classes):
| QoS Класс | Условие | Приоритет при дефиците памяти ноды |
| :--- | :--- | :--- |
| **`Guaranteed`** | `requests == limits` (для всех контейнеров) | **Высший** (убиваются в самую последнюю очередь). Подходит для БД. |
| **`Burstable`** | `requests < limits` | **Средний**. Стандарт для большинства микросервисов. |
| **`BestEffort`** | `requests` и `limits` вообще не заданы | **Низший**. Убиваются ОС первыми при малейшей нехватке памяти на ноде! |

---

### 2. Детальный разбор Проб (Probes): когда какую применять

```
[ Старт контейнера ]
        │
        ▼
  startupProbe ────(Fail)───► Перезапуск контейнера (дает время разогреться до 1-2 мин)
        │ (Success)
        ├───────────────────────────┬───────────────────────────┐
        ▼                           ▼                           ▼
  livenessProbe               readinessProbe                    │
        │                           │                           │
     (Fail)                      (Fail)                         │
        │                           │                           │
  Перезапуск пода           Снятие трафика из Service           │
  (Deadlock / зависание)    (Временная перегрузка/кэширование)  │
```

> ⚠️ **Главный антипаттерн проб:** НИКОГДА не проверяйте состояние внешней базы данных (PostgreSQL) в `livenessProbe` микросервиса! Если база упадет на 10 секунд, ВСЕ 50 микросервисов кластера одновременно признают себя мертвыми и начнут лавинообразно перезапускаться, устроив кластерный шторм (Cascading Failure). В `livenessProbe` проверяют **только локальное здоровье процесса**.

---

## 🛠️ 6. Шпаргалка команд `kubectl` для инженера дежурной смены

```bash
# -------------------------------------------------------------
# 1. Просмотр состояния ресурсов
# -------------------------------------------------------------
kubectl get pods -A                                    # Поды во всех неймспейсах
kubectl get pods -n production -o wide                 # Показать IP пода и имя рабочей ноды
kubectl get svc,ingress,hpa -n production              # Комплексный просмотр сервисов
kubectl top nodes                                      # Загрузка CPU и RAM на физических нодах
kubectl top pods -n production --sort-by=memory        # Топ подов по потреблению памяти

# -------------------------------------------------------------
# 2. Глубокая диагностика и отладка
# -------------------------------------------------------------
kubectl describe pod <pod_name> -n production          # События (Events), лимиты, статусы проб
kubectl logs -f <pod_name> -n production               # Логи в реальном времени
kubectl logs -f <pod_name> -c <container_name>         # Логи конкретного контейнера в поде
kubectl logs --previous <pod_name> -n production       # Логи УПАВШЕГО (предыдущего) запуска

# -------------------------------------------------------------
# 3. Интерактивная работа и локальный проброс портов
# -------------------------------------------------------------
kubectl exec -it <pod_name> -n production -- /bin/sh   # Зайти внутрь пода
kubectl port-forward svc/orders-api-svc 8080:80 -n prod # Проброс порта пода на localhost

# -------------------------------------------------------------
# 4. Управление развертываниями и рестартами
# -------------------------------------------------------------
kubectl rollout restart deployment/orders-api -n prod  # Бесшовный перезапуск всех реплик
kubectl rollout status deployment/orders-api -n prod   # Мониторинг статуса деплоя
kubectl rollout undo deployment/orders-api -n prod     # Мгновенный откат на прошлую версию
```

---

## 🚨 7. Расшифровка аварийных статусов подов K8s

| Статус | Что означает | Причины | Алгоритм решения |
| :--- | :--- | :--- | :--- |
| **`CrashLoopBackOff`** | Контейнер падает сразу после старта, K8s перезапускает его с экспоненциальной задержкой. | Ошибка в конфиге, отсутствие обязательного ENV, сбой коннекта к БД. | `kubectl logs <pod> --previous` и `kubectl describe pod <pod>`. |
| **`OOMKilled`** (Exit Code 137) | Процесс убит ядром из-за превышения `resources.limits.memory`. | Утечка памяти в коде (Memory leak) или заниженный лимит. | Увеличить `limits.memory` в Deployment или эскалировать разработчикам. |
| **`ImagePullBackOff`** | Не удается скачать образ контейнера из реестра. | Опечатка в теге, нет секретов доступа к приватному реестру (`imagePullSecrets`). | Проверить имя образа и статус реестра в `kubectl describe pod`. |
| **`Pending`** | Под создан в etcd, но Scheduler не может найти ноду. | Закончились CPU/RAM в кластере, есть Taints/Tolerations или не смонтирован PVC. | `kubectl describe pod <pod> \| grep -A 5 Events`. |
| **`Node NotReady`** | Вся нода перестала отвечать Master API. | Упал демон `kubelet`, проблемы с диском (`DiskPressure`) или сетевая недоступность. | Зайти на ноду по SSH, проверить `systemctl status kubelet` и `df -h`. |

---

## 🚫 8. Таблица антипаттернов в Kubernetes

| ❌ Антипаттерн | Почему это опасно | ✅ Как делать правильно |
| :--- | :--- | :--- |
| Развертывание одиночного `Pod` без `Deployment` | Если нода упадет, под не будет пересоздан на другой ноде. | Всегда использовать `Deployment` или `StatefulSet`. |
| Отсутствие `resources.requests` и `limits` | Под попадает в класс `BestEffort` и будет убит первым при OOM на ноде. | Всегда задавать `requests` и `limits` для CPU и памяти. |
| Запуск с `privileged: true` или `runAsUser: 0` | Полная уязвимость ноды кластера при взломе приложения. | Настраивать строгий `securityContext` (non-root, drop capabilities). |
| Отсутствие `podAntiAffinity` для критичных сервисов | Все 3 реплики могут встать на одну физическую ноду. При её падении сервис падает на 100%. | Разносить реплики по нодам через `podAntiAffinity`. |
| Игнорирование `terminationGracePeriodSeconds` | Воркеры закрываются моментально, сбрасывая тысячи активных пользовательских сессий. | Использовать `preStop` sleep и давать 30–60 секунд на завершение. |
