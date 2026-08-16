# 🤖 Модуль 5.4: Ansible: Ad-hoc команды и базовые плейбуки

**Ansible** — инструмент автоматизации и управления конфигурациями. Он работает **без агентов (Agentless)** — подключается к удаленным серверам по обычному **SSH** и выполняет команды через Python.

---

## 1. Файл инвентаря (`hosts.ini`)

В инвентаре описываются серверы и группы, которыми мы управляем:

```ini
[webservers]
web-01 ansible_host=192.168.1.10
web-02 ansible_host=192.168.1.11

[databases]
db-01 ansible_host=192.168.1.20

[all:vars]
ansible_user=deploy
ansible_ssh_private_key_file=~/.ssh/id_ed25519
```

---

## 2. Ad-hoc команды (Главный навык дежурного)

Ad-hoc команда — это быстрый запуск одноразового действия сразу на десятках серверов без написания сложных файлов.

```bash
# 1. Проверить доступность всех хостов по SSH (Модуль ping)
ansible all -i hosts.ini -m ping

# 2. Проверить Load Average и uptime на всех веб-серверах
ansible webservers -i hosts.ini -m command -a "uptime"

# 3. Перезапустить службу Grafana Alloy сразу на всех серверах
ansible all -i hosts.ini -m systemd -a "name=alloy state=restarted" --become

# 4. Скопировать обновленный конфигурационный файл на группу серверов
ansible webservers -i hosts.ini -m copy -a "src=./config.alloy dest=/etc/alloy/config.alloy" --become

# 5. Проверить место на диске на серверах баз данных
ansible databases -i hosts.ini -m shell -a "df -h /var/lib/postgresql"
```

### 🧩 Декодер флагов Ansible (Как легко запомнить):

| Флаг | Полное название | Для чего нужен | Как запомнить (Мнемоника) |
| :--- | :--- | :--- | :--- |
| `-i` | `--inventory` | Указывает путь к файлу со списком серверов | **I**nventory (Инвентарь) |
| `-m` | `--module-name` | Какой модуль запустить (`ping`, `command`, `systemd`, `copy`) | **M**odule (Модуль) |
| `-a` | `--args` | Параметры/аргументы, которые передаются внутрь модуля | **A**rguments (Аргументы) |
| `-b` | `--become` | Выполнить команду с правами администратора (`sudo root`) | **B**ecome root (Стать рутом) |
| `-u` | `--user` | Пользователь SSH для подключения | **U**ser (Пользователь) |
| `-k` | `--ask-pass` | Спросить пароль SSH (если вход не по ключам) | **K**eyboard password |
| `-C` | `--check` | Режим симуляции (Dry Run): ничего не менять, только проверить | **C**heck (Проверка) |
| `-v` / `-vvv` | `--verbose` | Подробный вывод отладки при ошибках | **V**erbose (Многословный) |

---

## 3. Структура простого Playbook (`deploy-alloy.yml`)

Плейбук описывает целевое состояние системы на понятном языке YAML:

```yaml
---
- name: Установка и настройка Grafana Alloy
  hosts: webservers
  become: true

  tasks:
    - name: Убедиться, что пакет curl установлен
      ansible.builtin.apt:
        name: curl
        state: present
        update_cache: yes

    - name: Скопировать конфигурационный файл Alloy
      ansible.builtin.copy:
        src: ./config.alloy
        dest: /etc/alloy/config.alloy
        owner: root
        group: root
        mode: '0644'
      notify: Перезапустить Alloy

    - name: Убедиться, что служба Alloy включена и запущена
      ansible.builtin.systemd:
        name: alloy
        state: started
        enabled: yes

  handlers:
    - name: Перезапустить Alloy
      ansible.builtin.systemd:
        name: alloy
        state: restarted
```

### Запуск плейбука:
```bash
# Проверка синтаксиса
ansible-playbook -i hosts.ini deploy-alloy.yml --syntax-check

# Сухой прогон (Dry Run - ничего не меняет, только показывает)
ansible-playbook -i hosts.ini deploy-alloy.yml --check

# Боевое применение
ansible-playbook -i hosts.ini deploy-alloy.yml
```
