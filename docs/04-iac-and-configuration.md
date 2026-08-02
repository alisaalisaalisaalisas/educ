# 4. IaC и Управление конфигурацией

---

## Terraform

**Terraform** (HashiCorp) — инструмент Infrastructure as Code (IaC) для декларативного описания и управления инфраструктурой.

### Ключевые концепции

| Концепция | Описание |
|---|---|
| **Provider** | Плагин для работы с платформой (AWS, Kubernetes, Helm) |
| **Resource** | Единица инфраструктуры (сервер, БД, namespace) |
| **Data Source** | Чтение существующих ресурсов |
| **Variable** | Входной параметр конфигурации |
| **Output** | Выходные данные после применения |
| **State** | Файл состояния (terraform.tfstate) — «карта» инфраструктуры |
| **Module** | Переиспользуемый набор ресурсов |
| **Backend** | Место хранения state (local, S3, Consul) |

### Жизненный цикл

```bash
terraform init      # Скачать провайдеры и модули
terraform plan      # Показать что будет изменено (dry-run)
terraform apply     # Применить изменения
terraform destroy   # Удалить всю инфраструктуру
terraform state list  # Просмотр ресурсов в state
terraform import    # Импорт существующего ресурса в state
```

### Пример конфигурации

```hcl
# main.tf
terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

# Переменные
variable "namespace" {
  type    = string
  default = "marketplace"
}

# Ресурс — Kubernetes Namespace
resource "kubernetes_namespace" "app" {
  metadata {
    name = var.namespace
    labels = {
      managed-by = "terraform"
    }
  }
}

# Helm Release — установка чарта
resource "helm_release" "argocd" {
  name       = "argocd"
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  namespace  = "argocd"
  version    = "5.46.0"

  set {
    name  = "server.service.type"
    value = "NodePort"
  }
}

# Output
output "namespace_name" {
  value = kubernetes_namespace.app.metadata[0].name
}
```

### Лучшие практики

1. **Remote state** — храните state в S3/GCS с блокировкой (DynamoDB)
2. **Modules** — выносите повторяющиеся конфигурации в модули
3. **Workspaces** — разделяйте окружения (dev, staging, prod)
4. **`terraform plan` перед `apply`** — всегда проверяйте перед применением
5. **Версионирование провайдеров** — фиксируйте версии через `~>`
6. **Не редактируйте state вручную** — используйте `terraform state mv/rm`

---

## Ansible

**Ansible** (Red Hat) — инструмент автоматизации для управления конфигурацией, деплоя и оркестрации. Работает по SSH, не требует агентов.

### Ключевые концепции

| Концепция | Описание |
|---|---|
| **Inventory** | Список серверов и их групп |
| **Playbook** | YAML-файл с набором задач |
| **Task** | Единичное действие (установить пакет, скопировать файл) |
| **Module** | Встроенная функция (apt, copy, docker_container) |
| **Role** | Переиспользуемый набор задач, шаблонов, файлов |
| **Handler** | Задача, выполняемая по уведомлению (restart nginx) |
| **Facts** | Автоматически собранная информация о хосте |
| **Vault** | Шифрование секретов в playbook |

### Структура

```
ansible/
├── inventory/
│   ├── hosts.yml         # Список серверов
│   └── group_vars/
│       └── all.yml       # Переменные для всех
├── playbooks/
│   └── setup.yml         # Основной playbook
├── roles/
│   └── nginx/
│       ├── tasks/main.yml
│       ├── templates/nginx.conf.j2
│       ├── handlers/main.yml
│       └── defaults/main.yml
└── ansible.cfg
```

### Пример Playbook

```yaml
# playbooks/setup.yml
---
- name: Configure web servers
  hosts: webservers
  become: yes  # sudo

  vars:
    app_port: 3000

  tasks:
    - name: Update apt cache
      apt:
        update_cache: yes
        cache_valid_time: 3600

    - name: Install Nginx
      apt:
        name: nginx
        state: present
      notify: restart nginx

    - name: Deploy Nginx config
      template:
        src: templates/nginx.conf.j2
        dest: /etc/nginx/sites-available/default
      notify: restart nginx

    - name: Ensure Nginx is running
      service:
        name: nginx
        state: started
        enabled: yes

  handlers:
    - name: restart nginx
      service:
        name: nginx
        state: restarted
```

### Основные команды

```bash
# Запуск playbook
ansible-playbook -i inventory/hosts.yml playbooks/setup.yml

# Проверка без применения (dry-run)
ansible-playbook playbooks/setup.yml --check --diff

# Ad-hoc команда на всех серверах
ansible all -m ping
ansible webservers -m shell -a "uptime"

# Шифрование файла с секретами
ansible-vault encrypt secrets.yml
ansible-vault view secrets.yml
```

### Terraform vs Ansible

| Аспект | Terraform | Ansible |
|---|---|---|
| Подход | Декларативный | Процедурный (+ декларативный) |
| Назначение | Создание инфраструктуры | Настройка серверов |
| State | Хранит состояние | Без состояния (stateless) |
| Агент | Не нужен | Не нужен (SSH) |
| Язык | HCL | YAML |
| Идемпотентность | Встроенная | Зависит от модуля |

---

## Vault (HashiCorp)

**Vault** — инструмент для управления секретами, ключами шифрования и сертификатами.

### Ключевые концепции

| Концепция | Описание |
|---|---|
| **Secret Engine** | Бэкенд для хранения секретов (KV, PKI, Database) |
| **Auth Method** | Метод аутентификации (Token, LDAP, Kubernetes, AppRole) |
| **Policy** | Правила доступа (кто что может читать/писать) |
| **Lease** | Время жизни секрета (автоматический отзыв) |
| **Seal/Unseal** | Запечатывание/распечатывание хранилища |
| **Dynamic Secrets** | Секреты, генерируемые по запросу (пароли БД) |

### Основные операции

```bash
# Запуск dev-сервера
vault server -dev

# Аутентификация
export VAULT_ADDR='http://127.0.0.1:8200'
vault login <token>

# Запись и чтение секретов (KV v2)
vault kv put secret/myapp db_password="s3cret" api_key="abc123"
vault kv get secret/myapp
vault kv get -field=db_password secret/myapp

# Политики
vault policy write app-policy - <<EOF
path "secret/data/myapp/*" {
  capabilities = ["read", "list"]
}
EOF
```

### Интеграция с Kubernetes

```yaml
# Приложение в K8s получает секреты через Vault Agent Injector
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  template:
    metadata:
      annotations:
        vault.hashicorp.com/agent-inject: "true"
        vault.hashicorp.com/role: "myapp"
        vault.hashicorp.com/agent-inject-secret-config: "secret/data/myapp"
```

---

## Artifactory (JFrog)

**Artifactory** — универсальный менеджер артефактов (бинарный репозиторий).

### Возможности

| Функция | Описание |
|---|---|
| **Local Repos** | Хранение собственных артефактов |
| **Remote Repos** | Проксирование внешних репозиториев (npm, PyPI, Maven) |
| **Virtual Repos** | Объединение local + remote под одним URL |
| **Docker Registry** | Хранение Docker-образов |
| **Helm Charts** | Хранение Helm-чартов |
| **Build Integration** | Интеграция с CI/CD (сборка + метаданные) |
| **Xray** | Сканирование на уязвимости |

### Типы поддерживаемых пакетов

Docker, Helm, npm, PyPI, Maven, Go, NuGet, Debian/RPM, Generic и другие.

```bash
# Пример: push Docker-образа в Artifactory
docker login myartifactory.company.com
docker tag myapp:1.0 myartifactory.company.com/docker-local/myapp:1.0
docker push myartifactory.company.com/docker-local/myapp:1.0

# Пример: npm через Artifactory
npm config set registry https://myartifactory.company.com/api/npm/npm-virtual/
npm install express
```
