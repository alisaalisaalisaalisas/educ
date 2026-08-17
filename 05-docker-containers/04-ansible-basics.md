# 🤖 Модуль 5.4: Ansible: Ad-hoc, Плейбуки, Роли и Культура автоматизации

**Ansible** — это инструмент автоматизации и управления конфигурациями (Configuration Management). Он работает по безагентной схеме (**Agentless**): подключается к серверам по стандартному протоколу **SSH** (или WinRM для Windows) и выполняет задачи с помощью модулей Python.

---

## 🏗️ 1. Архитектура и структура проекта Ansible

```
ansible-project/
├── ansible.cfg              # Глобальные настройки (таймауты, пути, ssh-параметры)
├── inventory/               # Каталог инвентаря
│   ├── production/
│   │   ├── hosts.ini        # Список серверов и групп
│   │   ├── group_vars/      # Переменные групп (web.yml, db.yml, all.yml)
│   │   └── host_vars/       # Переменные отдельных хостов
├── playbooks/               # Точки входа сценариев
│   ├── site.yml             # Главный мастер-плейбук
│   └── deploy-app.yml
└── roles/                   # Переиспользуемые роли
    └── nginx/
        ├── defaults/main.yml # Переопределяемые дефолтные переменные
        ├── vars/main.yml     # Жестко зашитые переменные роли
        ├── tasks/main.yml    # Основной список задач
        ├── handlers/main.yml # Обработчики событий (триггеры рестарта)
        ├── templates/        # Jinja2 шаблоны (.j2)
        ├── files/            # Статические неизменяемые файлы
        └── meta/main.yml     # Зависимости и метаданные роли
```

---

## 📋 2. Файл инвентаря (`hosts.ini` и `hosts.yml`)

### Формат INI:
```ini
[webservers]
web-01.prod.lan ansible_host=192.168.1.10
web-02.prod.lan ansible_host=192.168.1.11

[databases]
db-master.prod.lan ansible_host=192.168.1.20 ansible_user=postgres_admin

[production:children]
webservers
databases

[all:vars]
ansible_user=deploy
ansible_port=22
ansible_ssh_private_key_file=~/.ssh/id_ed25519
ansible_python_interpreter=/usr/bin/python3
```

---

## ⚡ 3. Ad-hoc команды (Главный навык дежурного)

Ad-hoc команды позволяют выполнить одно действие сразу на десятках серверов одной строкой:

```bash
# 1. Проверить доступность хостов по SSH
ansible all -i inventory/hosts.ini -m ping

# 2. Выполнить команду uptime или df на всех серверах группы
ansible webservers -i inventory/hosts.ini -m ansible.builtin.command -a "uptime"
ansible databases -i inventory/hosts.ini -m ansible.builtin.shell -a "df -h /var/lib/postgresql"

# 3. Перезапустить службу с правами root (sudo become)
ansible webservers -i inventory/hosts.ini -m ansible.builtin.systemd -a "name=nginx state=restarted" --become

# 4. Проверить статус пакета
ansible all -i inventory/hosts.ini -m ansible.builtin.package_facts

# 5. Экстренно скопировать файл на серверы
ansible webservers -i inventory/hosts.ini -m ansible.builtin.copy -a "src=./hotfix.conf dest=/etc/nginx/conf.d/ mode=0644" --become
```

### 🧩 Таблица ключевых флагов Ansible:
| Флаг | Полное имя | Назначение |
| :--- | :--- | :--- |
| `-i` | `--inventory` | Путь к файлу инвентаря или папке. |
| `-m` | `--module-name` | Название модуля (`ansible.builtin.ping`, `apt`, `systemd`). |
| `-a` | `--args` | Аргументы, передаваемые внутрь модуля. |
| `-b` | `--become` | Повышение привилегий до root через `sudo`. |
| `-C` | `--check` | **Dry-Run (Режим симуляции):** проверить, что изменится, не внося реальных правок. |
| `-D` | `--diff` | Показать точечный diff (какие строки в конфигах будут заменены). |
| `-v` / `-vvv` | `--verbose` | Уровень детализации вывода (для траблшутинга SSH и Python). |

---

## 🎨 4. Культура правильного написания Ansible (Best Practices)

### 1. Фундаментальный принцип: Идемпотентность (Idempotency)
> **Идемпотентность** означает: выполнение плейбука 1 раз или 100 раз подряд на сервере должно приводить к **одному и тому же результату**, а при повторном запуске неизмененной конфигурации Ansible обязан возвращать `changed=0`.

* ❌ **Антипаттерн (грязный вызов bash, нарушающий идемпотентность):**
  ```yaml
  # ПРИ КАЖДОМ запуске статус будет changed=1, даже если пользователь уже есть!
  - name: Создать пользователя
    ansible.builtin.shell: useradd deployer
  ```
* ✅ **Культурный подход (нативный идемпотентный модуль):**
  ```yaml
  - name: Создать системного пользователя deployer
    ansible.builtin.user:
      name: deployer
      state: present
      uid: 10001
      shell: /bin/bash
      create_home: true
  ```

#### Если модуль `command` или `shell` неизбежен:
Всегда используйте параметры `creates`, `removes` или `changed_when`:
```yaml
- name: Инициализировать кластер PostgreSQL (только если каталог пуст)
  ansible.builtin.command: /usr/lib/postgresql/16/bin/initdb -D /var/lib/postgresql/data
  args:
    creates: /var/lib/postgresql/data/PG_VERSION # Не выполнится, если файл уже есть
```

---

### 2. Использование FQCN (Fully Qualified Collection Names)
Начиная с Ansible 2.10, модули вынесены в коллекции. Использование коротких имен (`copy`, `apt`) считается устаревшим стилем. Всегда пишите полное имя:
* ✅ `ansible.builtin.apt`
* ✅ `ansible.builtin.template`
* ✅ `ansible.builtin.systemd`
* ✅ `community.docker.docker_container`
* ✅ `ansible.posix.firewalld`

---

### 3. Обработка ошибок: блоки `block`, `rescue`, `always`
Позволяет реализовать логику отката (Rollback) при возникновении сбоев:
```yaml
- name: Развертывание новой версии конфигурации
  block:
    - name: Обновить конфиг приложения
      ansible.builtin.template:
        src: app.conf.j2
        dest: /etc/app/app.conf
        validate: '/usr/bin/app --test-config -f %s'

    - name: Перезапустить сервис
      ansible.builtin.systemd:
        name: my-app
        state: restarted

  rescue:
    - name: Оповестить дежурного о сбое деплоя
      ansible.builtin.debug:
        msg: "Ошибка применения конфига! Выполняем откат на бэкап..."

    - name: Восстановить предыдущую рабочую конфигурацию
      ansible.builtin.copy:
        src: /etc/app/app.conf.bak
        dest: /etc/app/app.conf
        remote_src: true

  always:
    - name: Удалить временные файлы деплоя
      ansible.builtin.file:
        path: /tmp/deploy-lock
        state: absent
```

---

### 4. Безопасность: Секреты и `no_log: true`
1. **Никогда не храните пароли в открытом виде!** Используйте `ansible-vault`:
   ```bash
   # Зашифровать отдельную строку для вставки в плейбук
   ansible-vault encrypt_string 'MySuperSecretP@ssw0rd' --name 'db_password'
   ```
2. **Используйте `no_log: true`** для задач, работающих с чувствительными данными, чтобы токены не попали в логи CI/CD runner:
   ```yaml
   - name: Авторизоваться в приватном Docker Registry
     community.docker.docker_login:
       registry_url: https://registry.example.com
       username: "{{ vault_registry_user }}"
       password: "{{ vault_registry_password }}"
     no_log: true # Пароль никогда не появится в логах консоли!
   ```

---

## 🚀 5. Эталонный Production Playbook (`site.yml`)

```yaml
---
- name: Настройка веб-серверов и балансировщика Nginx
  hosts: webservers
  become: true
  gather_facts: true

  vars:
    nginx_port: 80
    app_user: "webapp"
    app_version: "2.1.0"

  tasks:
    - name: "[System] Обновить кэш apt и установить базовые утилиты"
      ansible.builtin.apt:
        name:
          - curl
          - htop
          - ufw
        state: present
        update_cache: true
        cache_valid_time: 3600

    - name: "[Nginx] Установить веб-сервер Nginx"
      ansible.builtin.apt:
        name: nginx
        state: present

    - name: "[Nginx] Сгенерировать конфигурационный файл из Jinja2 шаблона"
      ansible.builtin.template:
        src: templates/nginx.conf.j2
        dest: /etc/nginx/sites-available/default
        owner: root
        group: root
        mode: '0644'
        validate: '/usr/sbin/nginx -t -c %s'
      notify: Reload Nginx

    - name: "[Nginx] Убедиться, что сервис Nginx включен в автозагрузку и запущен"
      ansible.builtin.systemd:
        name: nginx
        state: started
        enabled: true

  handlers:
    - name: Reload Nginx
      ansible.builtin.systemd:
        name: nginx
        state: reloaded
```

---

## 🔍 6. Линтинг: `ansible-lint`

`ansible-lint` — обязательный инструмент проверки качества кода перед коммитом в Git:
```bash
# Запуск линтера
ansible-lint playbooks/site.yml
```
* Проверяет отсутствие устаревших конструкций (`with_items` ➔ `loop`).
* Требует обязательного наличия `name:` у всех тасок.
* Проверяет права доступа (`mode: '0644'`) при копировании файлов.
* Требует использования FQCN.

---

## 🚫 7. Таблица антипаттернов в Ansible

| ❌ Антипаттерн | Почему это плохо | ✅ Как делать правильно |
| :--- | :--- | :--- |
| Использование `shell: apt-get install nginx` | Теряется идемпотентность, не работают проверки ошибок. | Использовать модуль `ansible.builtin.apt`. |
| Таски без понятного имени (`name:`) | В логах отображается безымянный шаг, невозможно понять, где упал плейбук. | Каждой таске давать четкое имя с префиксом `[Component] Действие`. |
| Хранение паролей в `vars/main.yml` в Git | Компрометация ключей и баз данных. | Шифровать через `ansible-vault`. |
| Использование `command: systemctl restart nginx` в середине тасок | Nginx будет перезапускаться 5 раз за один прогон, создавая простой пользователям. | Использовать `notify: Restart Nginx` в блоке `handlers`. |
| Отсутствие флага `validate:` при копировании конфигов | Если в шаблоне синтаксическая ошибка, упадет весь продакшн Nginx. | Добавлять `validate: '/usr/sbin/nginx -t -c %s'`. |
