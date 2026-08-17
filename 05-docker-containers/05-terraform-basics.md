# 🏗️ Модуль 5.5: Terraform: IaC, Модули, Чистый HCL и Культура управления State

**Terraform** (от компании HashiCorp / OpenTofu) — мировой стандарт декларативного описания и управления облачной инфраструктурой (Infrastructure as Code — IaC).

---

## 📁 1. Стандартная структура производственного проекта

Культурный проект Terraform никогда не пишется в один сплошной файл. Конфигурация разделяется по четким функциональным файлам:

```
terraform-project/
├── versions.tf          # Требования к версии Terraform и плагинам провайдеров
├── providers.tf         # Конфигурация подключения к облакам (AWS, Yandex Cloud)
├── backend.tf           # Настройка удаленного хранения tfstate (S3 + DynamoDB)
├── main.tf              # Основные ресурсы и вызовы модулей
├── variables.tf         # Объявление входных переменных с типами и валидацией
├── outputs.tf           # Экспортируемые выходные данные (IP, DNS, ID)
├── locals.tf            # Вычисляемые локальные переменные и общие теги
├── terraform.tfvars     # Значения переменных для текущего окружения (НЕ коммитится в Git)
└── modules/             # Собственные переиспользуемые модули
    └── vpc_network/
        ├── main.tf
        ├── variables.tf
        └── outputs.tf
```

---

## 🧱 2. Эталонный проект: чистый код и культура HCL

### 📄 1. `versions.tf` & `backend.tf` (Фиксация версий и Remote State)
```hcl
terraform {
  required_version = ">= 1.6.0"

  required_providers {
    yandex = {
      source  = "yandex-cloud/yandex"
      version = "~> 0.115.0" # Разрешены только патч-обновления в рамках 0.115.x
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6.0"
    }
  }

  # Хранение состояния в защищенном S3 с блокировкой гонок
  backend "s3" {
    endpoint                    = "storage.yandexcloud.net"
    bucket                      = "my-company-terraform-state"
    region                      = "ru-central1"
    key                         = "production/infrastructure.tfstate"
    dynamodb_table              = "tfstate-lock-table" # Блокировка одновременного apply
    skip_region_validation      = true
    skip_credentials_validation = true
  }
}
```

---

### 📄 2. `variables.tf` (Строгая типизация и валидация)
> 💡 **Правило культуры:** Всегда задавайте `type`, `description` и блоки `validation` для входных переменных.

```hcl
variable "environment" {
  type        = string
  description = "Тип окружения развертывания (production / staging / dev)"

  validation {
    condition     = contains(["production", "staging", "dev"], var.environment)
    error_message = "Ошибка: переменная environment может принимать только значения 'production', 'staging' или 'dev'."
  }
}

variable "vm_instances" {
  type = map(object({
    cores  = number
    memory = number
    disk   = number
  }))
  description = "Конфигурация создаваемых серверов"
  default = {
    "web-01" = { cores = 2, memory = 4, disk = 30 }
    "web-02" = { cores = 2, memory = 4, disk = 30 }
  }
}

variable "db_password" {
  type        = string
  description = "Пароль суперпользователя базы данных"
  sensitive   = true # Скрывает значение пароля в логах terraform plan/apply!
}
```

---

### 📄 3. `locals.tf` (Вычисляемые константы и DRY)
```hcl
locals {
  name_prefix = "${var.environment}-app"

  # Общие теги для всех ресурсов проекта
  common_tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
    Project     = "BeerMarketplace"
    CreatedAt   = timestamp()
  }
}
```

---

### 📄 4. `main.tf` (Ресурсы, `for_each` и `dynamic` блоки)

```hcl
# 1. Локальная сеть
resource "yandex_vpc_network" "main" {
  name        = "${local.name_prefix}-network"
  description = "Основная виртуальная сеть проекта"
  labels      = local.common_tags
}

# 2. Подсеть
resource "yandex_vpc_subnet" "subnet_a" {
  name           = "${local.name_prefix}-subnet-a"
  zone           = "ru-central1-a"
  network_id     = yandex_vpc_network.main.id
  v4_cidr_blocks = ["10.10.1.0/24"]
}

# 3. Виртуальные машины через for_each (НЕ используйте count!)
resource "yandex_compute_instance" "web" {
  for_each = var.vm_instances # Создание серверов с именованными ключами

  name        = "${local.name_prefix}-${each.key}"
  platform_id = "standard-v3"
  zone        = "ru-central1-a"

  resources {
    cores  = each.value.cores
    memory = each.value.memory
  }

  boot_disk {
    initialize_params {
      image_id = "fd80mrhj8fl2oe878e3e" # Ubuntu 22.04 LTS
      size     = each.value.disk
      type     = "network-ssd"
    }
  }

  network_interface {
    subnet_id = yandex_vpc_subnet.subnet_a.id
    nat       = true # Выдать белый IP
  }

  metadata = {
    ssh-keys = "ubuntu:${file("~/.ssh/id_ed25519.pub")}"
  }

  labels = local.common_tags
}
```

---

### 📄 5. `outputs.tf` (Выходные значения)
```hcl
output "web_servers_ips" {
  description = "Карта публичных IP-адресов созданных веб-серверов"
  value = {
    for k, v in yandex_compute_instance.web : k => v.network_interface.0.nat_ip_address
  }
}

output "database_password_secret" {
  description = "Пароль базы данных (защищенный вывод)"
  value       = var.db_password
  sensitive   = true # Защита от случайного вывода в терминал
}
```

---

## 🧠 3. Культура и правила написания HCL (Style Guide)

### 1. `for_each` против `count` (Смертельная ловушка новичков)
* ❌ **Опасность `count`:**
  ```hcl
  # Если в списке ["app-1", "app-2", "app-3"] удалить "app-1",
  # элементы сдвинутся по индексам [0, 1]. Terraform УНИЧТОЖИТ И ПЕРЕСОЗДАСТ app-2 и app-3!
  resource "yandex_compute_instance" "app" {
    count = length(var.server_names)
    name  = var.server_names[count.index]
  }
  ```
* ✅ **Культурный подход (`for_each`):**
  ```hcl
  # При удалении "app-1" Terraform удалит ТОЛЬКО его, не трогая остальные серверы.
  resource "yandex_compute_instance" "app" {
    for_each = toset(var.server_names)
    name     = each.value
  }
  ```

### 2. Именование ресурсов (Naming Conventions)
* Имена ресурсов в HCL должны быть в стиле **`snake_case`**.
* ❌ Не дублируйте тип ресурса в имени: `resource "yandex_vpc_network" "vpc_network_main"` (тавтология).
* ✅ Пишите лаконично: `resource "yandex_vpc_network" "main"`.

---

## 💾 4. Управление состоянием (`terraform.tfstate`) и блокировки

> **`tfstate`** — это мост между кодом HCL и реальными ID инфраструктуры в облаке.

### 🛡️ Правила безопасности State:
1. **Никогда не коммить `*.tfstate` в Git!** Пароли и приватные ключи хранятся там в открытом виде.
2. **Всегда используйте State Locking (DynamoDB / YDB):**
   * Если Инженер А запустил `apply`, база блокируется. Если Инженер Б одновременно запустит `apply`, Terraform выдаст ошибку: `Error: Error acquiring the state lock` и спасет инфраструктуру от повреждения.

### 🧰 Команды управления состоянием:
```bash
# Список всех ресурсов в текущем state-файле
terraform state list

# Посмотреть конфигурацию конкретного ресурса в state
terraform state show yandex_compute_instance.web[\"web-01\"]

# Переименовать ресурс в state без удаления из облака (Рефакторинг)
terraform state mv yandex_compute_instance.old_name yandex_compute_instance.new_name

# Удалить ресурс из-под управления Terraform (не удаляя его из облака)
terraform state rm yandex_compute_instance.manual_server

# Импортировать созданный вручную ресурс в Terraform
terraform import yandex_vpc_network.imported_net enp80xxxxxxxxxxxx
```

---

## 🚀 5. Workflow и команды жизненного цикла

```bash
# 1. Инициализация проекта и скачивание плагинов
terraform init -upgrade

# 2. Автоматическое форматирование кода под стиль HCL
terraform fmt -recursive

# 3. Валидация синтаксиса и ссылок на переменные
terraform validate

# 4. Формирование бинарного плана изменений (Dry-Run)
terraform plan -out=tfplan

# 5. Применение строго сохраненного плана (Safe Apply в CI/CD)
terraform apply tfplan

# 6. Полное удаление созданных ресурсов
terraform destroy
```

---

## 🔍 6. Статический анализ и сканеры безопасности (CI/CD)

1. **`tflint`**: Находит скрытые логические ошибки, некорректные типы инстансов в облаках и неиспользуемые переменные.
2. **`tfsec` / `trivy config` / `checkov`**: Сканирует HCL-код на бреши в безопасности:
   * Открытые Security Groups (`0.0.0.0/0` на SSH порт 22).
   * Отсутствие шифрования на дисках и S3-бакетах.
   * Публичный доступ к базам данных.

---

## 🚫 7. Таблица антипаттернов в Terraform

| ❌ Антипаттерн | Почему это опасно | ✅ Как делать правильно |
| :--- | :--- | :--- |
| Хранение паролей в файле `terraform.tfvars` в Git | Мгновенная утечка секретов в репозиторий. | Использовать HashiCorp Vault, AWS Secrets Manager или переменные окружения `TF_VAR_db_password`. |
| Использование `count` для разнородных ресурсов | Каскадное удаление и пересоздание серверов при изменении порядка в массиве. | Всегда использовать `for_each`. |
| Хранение `tfstate` локально на ноутбуке разработчика | Потеря состояния при поломке ноутбука, невозможность командной работы. | Использовать Remote Backend в S3 с DynamoDB Locking. |
| Ручные правки ресурсов в веб-консоли облака | Приводит к **State Drift** (рассинхрону). При следующем `apply` Terraform перезатрет ручные правки. | Все изменения вносить **исключительно через код**. |
| Запуск `terraform apply` без предварительного `plan` в CI | Риск случайного удаления продакшн-ресурсов (destroy in-place). | Генерировать `plan -out=tfplan` и применять сохраненный файл. |
