# 🖥️ Terminal & MockShell Engine: Устройство эмулятора CLI

> **Архитектура виртуальной файловой системы (VirtualFS), конвейеров (Pipes) и эмуляции Linux-утилит в браузере**

---

## 🌟 1. Обзор Подсистемы Терминала

Терминал в **DevOps City Explorer** обеспечивает реалистичный опыт командной строки Linux прямо в браузере без необходимости запуска удаленных виртуальных машин или тяжелых WebAssembly-контейнеров.

Подсистема состоит из трех ключевых слоев:
1. **Представление (UI):** `TerminalView.tsx` на базе библиотеки `xterm.js` с аддоном автоматической подгонки размера `xterm-addon-fit`.
2. **Командный интерпретатор:** `MockShell.ts` — парсер аргументов, флагов, конвейеров (`|`) и диспетчер утилит.
3. **Хранилище данных:** `VirtualFS.ts` — древовидная иерархия файлов и папок в памяти с поддержкой прав доступа, размеров и владельцев.

```
 ┌────────────────────────────────────────────────────────┐
 │                   Xterm.js Terminal UI                 │
 │  - Input Buffer, ANSI Escape Sequences, Key Handlers   │
 └───────────────────────────┬────────────────────────────┘
                             │ execute(commandLine)
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │                      MockShell                         │
 │  - Pipeline Splitter: cmd1 | cmd2 | cmd3               │
 │  - Tokenizer & Flag Parser (-i, -h, -l, --sort)        │
 │  - Diagnostics & Kubernetes Mock Handlers              │
 └─────────────┬────────────────────────────┬─────────────┘
               │                            │
               ▼                            ▼
 ┌──────────────────────────┐  ┌──────────────────────────┐
 │  In-Memory System State  │  │        VirtualFS         │
 │  - Services (systemctl)  │  │  - Hierarchy Tree        │
 │  - Pods (kubectl)        │  │  - Permissions & Sizes   │
 │  - Network Sockets (ss)  │  │  - Path Resolution (cd)  │
 └──────────────────────────┘  └──────────────────────────┘
```

---

## 🌲 2. Виртуальная Файловая Система (`VirtualFS.ts`)

### Структура узла (FSNode):
```typescript
export interface FSNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  permissions?: string; // Например, '-rw-r--r--' или 'drwxr-xr-x'
  owner?: string;       // 'root', 'devops', 'www-data'
  size?: number;        // Размер в байтах
  children?: Record<string, FSNode>;
}
```

### Стандартная иерархия директорий:
- `/home/devops` — домашняя директория с чеклистами (`notes.txt`) и скриптами автоматизации (`fix_deploy.sh`).
- `/var/log/nginx` — логи Nginx (`access.log` с 502 ошибками, `error.log` с connection refused).
- `/var/log/syslog` — системный журнал ядра с сообщениями OOM Killer (`code=killed, status=9/KILL`).
- `/etc/nginx` — боевой конфигурационный файл `nginx.conf`.
- `/etc/hosts` — статический резолв внутренних DNS-имен подов и хостов.
- `/proc/1024/fd/4` — виртуальные дескрипторы удаленных, но удерживаемых процессов файлов.

---

## 🚰 3. Поддержка Конвейеров (Pipes `|`)

Интерпретатор `MockShell` поддерживает выполнение цепочек команд произвольной длины:

```typescript
// Пример: dmesg | grep oom | head -n 2
private executePipeline(pipeline: string): CommandResult {
  const segments = pipeline.split('|').map(s => s.trim());
  let currentInput = '';
  let lastExit = 0;

  for (let i = 0; i < segments.length; i++) {
    const result = this.executeSingleCommand(segments[i], currentInput);
    if (result.exitCode !== 0 && i === 0 && !result.output) {
      return result;
    }
    currentInput = result.output;
    lastExit = result.exitCode;
  }

  return { output: currentInput, exitCode: lastExit };
}
```

---

## 🛠️ 4. Реализованные Linux-команды

| Категория | Команды | Поддерживаемые флаги и фичи |
|---|---|---|
| **Файлы & Навигация** | `ls`, `cd`, `pwd`, `cat`, `head`, `tail`, `grep`, `chmod`, `truncate`, `rm` | `-l`, `-la`, `-n <N>`, `-i` (case-insensitive), относительные пути `..`, `~` |
| **Системная диагностика** | `ps`, `top`, `free`, `df`, `uptime`, `dmesg`, `lsof` | `ps aux --sort=-%mem`, `df -h`, `free -m`, `lsof +L1`, `lsof \| grep deleted` |
| **Службы & Демоны** | `systemctl` | `status`, `start`, `restart`, `stop` для `backend-app`, `nginx`, `postgresql` |
| **Сеть & HTTP** | `curl`, `ss`, `netstat`, `ping` | `curl -I`, `curl -i`, `curl http://...:8080/health`, проверка сокетов 80, 443, 5432 |
| **Kubernetes CLI** | `kubectl` | `kubectl get pods`, `kubectl describe pod <name>`, `kubectl logs <name>` |
| **Интерфейс** | `clear`, `echo`, `help`, `whoami` | Очистка экрана, справочная система, переменные окружения |
