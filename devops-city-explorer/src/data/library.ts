export interface LibraryItem {
  title?: string;
  text: string;
  code?: string;
  tip?: string;
  tipKind?: 'tip' | 'warning';
}

export interface LibrarySection {
  heading: string;
  intro?: string;
  ordered?: boolean;
  items: LibraryItem[];
}

export interface LibraryTopic {
  id: string;
  title: string;
  icon: string;
  zone: string;
  color: string;
  summary: string;
  tags: string[];
  sections: LibrarySection[];
}

export const LIBRARY_TOPICS: LibraryTopic[] = [
  {
    id: 'linux-suburbs',
    title: 'Linux & Базовое администрирование',
    icon: '🐧',
    zone: 'Linux Suburbs',
    color: '#4ade80',
    summary:
      'Linux — операционная система, из которой состоит 90% серверов в мире. Карьера дежурного инженера начинается с умения быстро разбираться, что происходит на сервере: какие процессы едят CPU, куда делась память, почему диск полон и что говорит systemd. Этот раздел — фундамент для всего остального.',
    tags: ['Процессы', 'Файловая система', 'Права', 'Память и диски', 'systemd', 'Bash'],
    sections: [
      {
        heading: 'Что такое Linux и как он устроен',
        intro: 'Прежде чем писать команды, поймите базовую философию — на ней построено 90% всех решений.',
        items: [
          {
            title: 'Ядро + утилиты',
            text: 'Ядро (kernel) — единственная программа, которая разговаривает с железом: планирует процессы на CPU, выделяет память, читает диски. Всё остальное (ls, ps, bash) — обычные программы, которые через системные вызовы просят ядро что-то сделать. Поэтому ваша задача — научиться «спрашивать» у ядра состояние системы.',
            tip: 'Запомните: управляя процессами или памятью, вы общаетесь с ядром. Отсюда название утилит: sysctl, systemd, syslog.',
          },
          {
            title: '«Всё есть файл»',
            text: 'В Linux диски, сокеты, настройки и даже сами процессы представлены файлами: /dev/sda — диск, /proc/1234/ — каталог процесса, /proc/meminfo и /proc/sys — состояние ядра. Читая их как обычные файлы, вы диагностируете систему без специального софта.',
            code: 'cat /proc/meminfo | head -5\\nls /proc/ | head -10   # каталог каждого процесса = его PID',
          },
          {
            title: 'Много мелких утилит + пайпы',
            text: 'Unix-философия: каждая программа делает одну вещь идеально, а сложное строится связкой через пайпы `|`. ps показывает процессы, grep фильтрует, sort сортирует — вместе это мощный анализатор без GUI.',
            code: 'ps aux | grep nginx | grep -v grep   # процессы nginx\\nps aux --sort=-%mem | head -5           # топ-5 по памяти',
          },
          {
            title: 'Дистрибутивы — один и тот же Linux',
            text: 'Ubuntu/Debian, CentOS/Rocky, Alpine отличаются только менеджером пакетов (apt, dnf/yum, apk) и набором утилит. Устройство ядра, процессы, /proc, bash — одинаковые. В контейнерах и играх чаще всего Alpine (5 МБ) — запомните его менеджер пакетов `apk add --no-cache`.',
            code: 'apt-get update && apt-get install -y htop   # Ubuntu/Debian\\ndnf install -y htop                          # CentOS/Rocky\\napk add --no-cache htop                     # Alpine',
          },
        ],
      },
      {
        heading: 'Файловая система и структура каталогов',
        intro: 'Зная, где что лежит, вы быстрее находите логи, конфиги и причины проблем.',
        items: [
          {
            title: 'Карта каталогов (FHS)',
            text: '/etc — конфигурация, /var/log — логи, /var/lib — данные сервисов, /home — пользователи, /tmp — временные файлы, /usr/bin — программы, /proc и /sys — интерфейс к ядру, /dev — устройства. Для дежурного важнее всего /etc и /var/log.',
            tip: 'Главное правило: инцидент начинается с логов. Знали, где логи, — прошли полпути к диагнозу.',
          },
          {
            title: 'Inode: «паспорт» файла',
            text: 'Каждый файл — это inode (метаданные: владелец, права, размер, блоки) плюс имя-ссылка на него. Диск может быть «полным» по inode, хотя место ещё есть — миллионы мелких файлов (кэш, сессии) съедают их. Проверяйте оба показателя: df -h И df -i.',
            code: 'df -h   # свободное место в гигабайтах\\ndf -i   # свободные inode — 100% тоже означает «диск полон»',
            tipKind: 'warning',
            tip: 'Классическая засада: мониторинг следит только за df -h, а сервис пишет «No space left on device» при df -i = 100%. Всегда смотрите обе колонки.',
          },
          {
            title: 'Симлинки и жёсткие ссылки',
            text: 'Символьная ссылка (ln -s) — «ярлык»: отдельный файл с путём, у него своя жизнь. Жёсткая ссылка — второе имя того же inode, данные общие. Логи часто делают симлинками: tail /var/log/app.log может читать файл на другой файловой системе.',
            code: 'ln -s /data/logs/nginx.log /var/log/nginx.log\\nls -l /var/log/nginx.log   # покажет -> /data/logs/nginx.log',
          },
          {
            title: 'Права rwx и chmod',
            text: 'Права задаются для трёх групп: владелец (u), группа (g), остальные (o). Каждая — тройка rwx (read/write/eXecute). Числовой вид: r=4, w=2, x=1; суммами получаем 755, 644, 600. Число = сумма битов: 7 = 4+2+1 (rwx), 6 = rw-, 5 = r-x, 4 = r--.',
            code: 'chmod 755 script.sh          # владелец: всё; остальные: читать и запускать\\nchmod 640 secret.conf          # 600/640 для конфигов с паролями\\nchown -R app:app /opt/app      # сменить владельца и группу',
            tip: 'Заучите «магические тройки»: 7=rwx, 6=rw-, 5=r-x. Никогда не давайте 777 файлам на проде — это «открытая дверь для всех».',
          },
          {
            title: 'Спецбиты: SUID, SGID, sticky',
            text: 'SUID (4xxx) — файл запускается с правами владельца (у passwd виден как s). SGID (2xxx) на каталоге — новые файлы наследуют группу каталога. Sticky (1xxx, у /tmp) — в каталоге можно удалять только свои файлы, даже если права 777.',
            code: 'ls -l /usr/bin/passwd   # -rwsr-xr-x — s = SUID\\nchmod 1777 /tmp          # sticky bit',
          },
          {
            title: 'umask: права по умолчанию',
            text: 'Новые файлы получают 666 минус umask (обычно 022 → файлы 644, каталоги 755). Жёсткие среды (банки, ПДн) ставят umask 027, чтобы новые файлы были 640 — считываемы только группой.',
            code: 'umask        # выведет 0022\\numask 027    # новые файлы будут 640',
          },
        ],
      },
      {
        heading: 'Процессы: кто ест CPU и память',
        intro: 'Наблюдение за процессами — первое действие при любом «тормозит».',
        items: [
          {
            title: 'ps aux: картина всех процессов',
            text: 'Поля: USER, PID, %CPU, %MEM, STAT, START, TIME, COMMAND. STAT-коды: R — работает на CPU, S — спит, D — ждёт диска, Z — зомби, I — idle. Колонка TIME — суммарное время на CPU: быстро растёт → процесс «молотит».',
            code: 'ps aux --sort=-%cpu | head -10   # топ-10 по CPU\\nps aux --sort=-%mem | head -10   # топ-10 по памяти',
            tip: 'Одна `top` с клавишами P (по CPU), M (по памяти), 1 (все ядра), q (выход) закрывает половину задач диагностики.',
          },
          {
            title: 'Сигналы: как просить процесс завершиться',
            text: 'SIGTERM (15) — вежливая просьба (kill по умолчанию), процесс сам завершается и чистит за собой. SIGKILL (9) — немедленное убийство ядром, невозможно перехватить. SIGHUP (1) — «перечитай конфиг» (reload). SIGINT (2) — Ctrl+C. Используйте kill, pkill, killall.',
            code: 'kill 4242            # SIGTERM\\nkill -9 4242          # SIGKILL — только в крайнем случае\\npkill -f node         # по имени/маске',
            tipKind: 'warning',
            tip: 'SIGKILL не даёт процессу сохранить данные и корректно завершиться. Правильный порядок: TERM → подождать → KILL. «Не убивается» почти всегда = D-состояние (жду диска), а не злая воля процесса.',
          },
          {
            title: 'Зомби и сироты',
            text: 'Зомби (Z) — процесс завершился, но родитель не «забрал» его код возврата (wait). Он не ест память, но десятки зомби — симптом больного родителя. Лечение: перезапустить родителя — зомби «усыновит» PID 1 и заберёт. Сирота — процесс, чей родитель умер; его тоже забирает PID 1.',
            code: 'ps aux | awk \'$8 ~ /Z/ {print}\'   # найти зомби\\nps -eo pid,ppid,stat,cmd | grep -w Z',
          },
          {
            title: 'Память: free, buff/cache и OOM-killer',
            text: 'free -h столбцы: used (приложения), buff/cache (кэш ядра — отдаётся при нагрузке), swap. «Свободно 0» — норма, если buff/cache большой: кэш ядра быстро освобождается. Если и правда не хватило — ядро запускает OOM-killer, который прибивает самый жирный процесс. Следы — в dmesg.',
            code: 'free -h\\ndmesg | grep -i oom | tail -5   # кто и когда убит за память\\njournalctl -k | grep -i oom | tail -5',
            tip: 'OOM-killer снова убивает ваш сервис — не «просто перезапускайте», а ищите утечку памяти или поднимайте лимиты. Лечить симптом — значит лечить вечно.',
          },
          {
            title: 'Load Average: спидометр занятости',
            text: 'Три числа uptime — среднее число процессов, ожидающих выполнения, за 1/5/15 минут. Норма: меньше числа ядер (nproc). load 8 при 4 ядрах — перегрузка. Смотрите динамику за 5–15 минут: пик за минуту может быть выбросом.',
            code: 'uptime\\n# ... load average: 1.98, 1.55, 1.20\\nnproc   # сколько ядер — делите load на это число',
          },
        ],
      },
      {
        heading: 'Диски: место, дескрипторы, нагрузка',
        intro: '«Диск полон» — самая частая авария на дежурствах. Научитесь видеть её за 30 секунд.',
        items: [
          {
            title: 'df: занятость файловых систем',
            text: 'df -h показывает размер, занято, доступно, смонтировано. Ищите строки 95%+. Обращайте внимание на точку монтирования: полный / и полный /var — разные беды. /dev/mapper — LVM, /overlay — контейнерные слои.',
            code: 'df -h\\n# /dev/sda1  40G  38G   0G  100%  /     ← вот беда\\ndf -i               # вторая проверка — inode',
          },
          {
            title: 'du: кто занял место',
            text: 'Начинайте с корня: du -sh * | sort -rh | head. Опускайтесь по дереву до виновника: чаще всего это логи, docker overlay2, бэкапы, tmp. Именно спуск по уровням экономит время, а не «покопаться наугад».',
            code: 'cd / && du -sh * 2>/dev/null | sort -rh | head -10\\nfind /var/log -type f -size +500M -exec ls -lh {} +   # «слоны»-файлы',
          },
          {
            title: 'lsof +L1: удалённые, но открытые файлы',
            text: 'rm файла не освобождает место, пока процесс держит дескриптор. Классика: удалили лог, место не вернулось. Ищите через lsof +L1 или /proc/<pid>/fd. Лечится перезапуском процесса или безопасным опустошением дескриптора через truncate.',
            code: 'lsof +L1 | head -20\\nls -l /proc/4242/fd | grep deleted\\n# лечение без даунтайма:\\ntruncate -s 0 /proc/4242/fd/9',
            tipKind: 'warning',
            tip: 'Вместо rm больших логов используйте truncate -s 0: освобождает место даже у открытых файлов и не заставляет перезапускать сервис.',
          },
          {
            title: 'Диск не по размеру, а по скорости',
            text: 'Место есть, а всё тормозит — проверьте IO-насыщение: iostat -x 1 (util% ≈ 90+ = диск упирается), iotop (кто пишет). Перегруженный один диск на общем хранилище тянет вниз всех соседей по виртуалке.',
            code: 'iostat -x 1 5   # %util, await, r/s, w/s\\niotop -o -b -n 3   # текущие пожиратели IO',
          },
          {
            title: 'SQL и базы: отдельная песня',
            text: 'Диск полон → база падает или в read-only. Проверяйте размер таблиц и логов БД до того, как это сделает диск (PostgreSQL: pg_database_size, MySQL: SHOW TABLE STATUS). В инциденте — это цепочка: диск → БД → приложение → 5xx.',
          },
        ],
      },
      {
        heading: 'Терминал: пайпы, редиректы, переменные',
        intro: 'Bash — язык общения с сервером. Без него не работают ни диагностика, ни автоматизация.',
        items: [
          {
            title: 'Три потока: stdin, stdout, stderr',
            text: 'Ввод (0), вывод (1), ошибки (2). Ошибки уходят в stderr, поэтому при редиректе «пропадают». Редиректы: > файл (перезапись), >> файл (дописать), 2> файл (только ошибки), 2>&1 (ошибки туда же, куда вывод), &> (оба потока вместе).',
            code: 'ls > out.txt 2>&1            # вывод и ошибки вместе\\ngrep err app.log | grep -v debug | tail -50   # цепочка фильтров',
            tip: 'Автоматизация дежурного: script.sh >> /var/log/deploy.log 2>&1 — иначе ошибки скрипта вы увидите только в следах загадочных инцидентов.',
          },
          {
            title: 'Пайпы |: конвейер утилит',
            text: 'Вывод слева — ввод справа: find | grep фильтрует, cut/awk режет колонки, wc -l считает строки, head/tail ограничивают, sort -u уникализирует, xargs преобразует в аргументы. Комбинируя 3–4 утилиты, вы решаете задачи, под которые нет готовых команд.',
            code: 'journalctl -u nginx -f | grep -i error    # наблюдать только за ошибками\\ndocker ps -q | xargs docker inspect --format \'{{.Name}} {{.State.Status}}\'',
          },
          {
            title: 'Переменные, $PATH, окружение',
            text: 'Переменные окружения (export VAR=value, echo $HOME, env) передаются дочерним процессам и читаются приложениями (включая docker и k8s). PATH — список каталогов, где оболочка ищет команды. «command not found» при установленном пакете = программа вне PATH; зовите полным путём (which покажет).',
            code: 'echo $PATH\\nwhich python3 kubectl docker   # где лежит команда\\nexport APP_ENV=production   # задать для текущего сеанса и детей\\nprintenv | grep -i proxy    # что унаследуют процессы',
          },
          {
            title: 'Первый bash-скрипт',
            text: 'Файл с шебангом #!/bin/bash и chmod +x становится программой. Внутри: переменные, if/else, for, $? (код возврата последней команды; 0 — успех). Пример ниже — скрипт-«пульс»: сам проверяет healthcheck и логирует результат.',
            code: '#!/bin/bash\\nif curl -sf http://localhost:8080/health; then\\n  echo "OK: $(date)" >> /var/log/health.log\\nelse\\n  echo "DOWN: $(date)" >> /var/log/health.log\\n  exit 1\\nfi',
          },
        ],
      },
      {
        heading: 'systemd и journalctl: как стартуют сервисы',
        intro: 'Почти все современные сервисы управляются systemd. Половина инцидентов начинается со слов «сервис не стартует».',
        items: [
          {
            title: 'Unit: паспорт сервиса',
            text: 'Unit — файл в /etc/systemd/system: [Service] с ExecStart (команда), Restart (политика перезапуска), User, Environment. После правки — systemctl daemon-reload. Restart=on-failure — systemd сам поднимет упавший сервис.',
            code: 'systemctl status app                    # статус + дамп последних логов\\nsystemctl start|stop|restart app\\nsystemctl enable --now app               # автозапуск при загрузке\\nsystemctl is-active app && systemctl is-enabled app',
            tip: 'Читайте вторую строку systemctl status: «Main PID: 123 (code=exited, status=1/FAILURE)» — это уже диагноз: процесс упал с ошибкой, а не systemd. Паттерн: exited+FAILURE = ошибка приложения, signal = убит сигналом.',
          },
          {
            title: 'journalctl: единый журнал',
            text: 'systemd пишет логи всех сервисов в бинарный журнал. Читается через journalctl: -u юнит, --since время, -p err уровень, -f реальное время, -n 200 последние строки. Самый быстрый инструмент первой помощи.',
            code: 'journalctl -u app -f                    # следить в реальном времени\\njournalctl -u app --since "10 minutes ago" -p err\\njournalctl -u app -n 200 --no-pager\\njournalctl -b -p err                       # все ошибки с последней загрузки',
          },
          {
            title: 'Где ещё живут логи',
            text: '/var/log/syslog (Debian) или /var/log/messages (RHEL), /var/log/nginx/, /var/log/kern.log (ядро/OOM), /var/log/auth.log (входы и атаки), /var/log/mysql/ и т.д. Если сервис не пишет в journal — ищите его файл в /var/log/<имя>.',
          },
          {
            title: 'Сбор метрик: top -H и потоки',
            text: 'Когда одно приложение ест 90% CPU — загляните внутрь: top -H -p <pid> показывает потоки. Поток с PID, отличающимся от главного, + быстрый рост TIME = изнанка процесса. Для Java добавьте jstack, для node — /proc/<pid>/task/<tid>/status.',
            code: 'top -H -p 4242\\ncat /proc/4242/status | grep -E "Threads|State"\\nls /proc/4242/task | wc -l   # сколько потоков',
          },
        ],
      },
      {
        heading: 'Рецепт: «Сервер тормозит» — алгоритм дежурного',
        ordered: true,
        intro: 'Действуйте по порядку — он сэкономит 15 минут паники. Кратко: load → CPU → память → диск → логи → решение.',
        items: [
          {
            title: 'Общая картина за 10 секунд',
            text: 'uptime (load против nproc), top (клавиша 1 — все ядра, M — память), free -h (free/swap), df -h и df -i. Четыре команды дали направление.',
          },
          {
            title: 'Виновник CPU',
            text: 'top + клавиша P. kworker/kernel — обычно это IO (смотрите диски), приложение — ищите поток top -H -p <pid> и логи. Типично: бесконечный цикл, горячий polling, GC-шторм, внезапный пересчёт.',
          },
          {
            title: 'Память и swap',
            text: 'free -h: приложения в swap (si/so в vmstat растут) = память на пределе. Уточняем: ps aux --sort=-%mem | head, dmesg на OOM. Клиент медленный при живом сервисе — нередко это swap thrash.',
            code: 'free -h\\nvmstat 1 5      # si/so — обмен с swap\\ndmesg | grep -i oom | tail -3',
          },
          {
            title: 'Диски и IO',
            text: 'df -h + df -i, iostat -x 1 (util 90%+), lsof +L1 (удалённые открытые файлы). Не игнорируйте iostat на виртуалках: общий диск соседей тоже бьёт по вам.',
          },
          {
            title: 'Логи и события ядра',
            text: 'journalctl -b -p err --no-pager | tail -50, dmesg -T | tail -30 (диски, OOM, сеть). Сверьте с алертами: инцидент новый или «всегда так»? Это калибрует усилия.',
          },
          {
            title: 'Решение и фиксация',
            text: 'Сначала стабилизация (перезапуск проблемного сервиса, откат), потом root cause. Не прошло 15 минут — эскалация по runbook + пост в чат смены: время, симптом, что проверили, что сделали.',
            tip: 'Каждая выполненная команда — в заметки. Пустые «проверил, всё ок» на дежурстве = постмортем без фактов. След инцидента должен быть воспроизводим.',
          },
        ],
      },
    ],
  },
  {
    id: 'network-crossroads',
    title: 'Сети и Веб-серверы',
    icon: '🌐',
    zone: 'Network Crossroads',
    color: '#22d3ee',
    summary:
      'Сеть — то, как сервисы общаются друг с другом и с клиентами: от IP-адреса до nginx, который стоит перед всеми приложениями. Здесь разбираем TCP/IP, DNS, HTTP/HTTPS, nginx и диагностику «всё пропало» через curl, ss и tcpdump.',
    tags: ['TCP/IP', 'DNS', 'HTTP/HTTPS', 'Nginx', 'TLS', 'Диагностика'],
    sections: [
      {
        heading: 'Как устроена сеть: адреса и порты',
        intro: 'Поймите простую вещь: чтобы приложение поговорило с другим — нужны адрес (IP), «дверь» (порт) и транспорт (TCP/UDP).',
        items: [
          {
            title: 'IP-адрес: дом и квартира',
            text: 'IPv4 — 4 байта, например 192.168.1.10. IP + маска (255.255.255.0) говорят, что в вашей локальной сети, а что дальше через шлюз (default gateway). 127.0.0.1 — сам сервер (localhost), 0.0.0.0 — «все интерфейсы». IPv6 — длинная версия, уже везде по умолчанию.',
            code: 'ip addr show          # свои адреса и интерфейсы\\nip route show          # default via <шлюз> — куда идёт всё остальное\\nhostname -I            # быстрый список IP',
          },
          {
            title: 'Порт: номер двери',
            text: 'Порты 0–65535. Стандартные: 22 SSH, 53 DNS, 80 HTTP, 443 HTTPS, 3306 MySQL, 5432 PostgreSQL, 6379 Redis, 8080/3000 приложения. Проверка «слушает ли кто-то» — ss -tulpn. Отдельно от слушателя — firewall: сервис слушает, но снаружи не дотянуться.',
            code: 'ss -tulpn | grep -E ":(80|443|8080)"\\n# tcp LISTEN 0 511 0.0.0.0:80 ... users:((nginx:master))\\nss -tn state established | wc -l   # сколько активных соединений',
            tipKind: 'warning',
            tip: 'Программа слушает на 127.0.0.1:8080 — она НЕ доступна снаружи и из контейнеров соседних хостов. Слушает на 0.0.0.0 — доступна всем. Это первая проверка при 502/connection refused.',
          },
          {
            title: 'TCP: рукопожатие и гарантии',
            text: 'TCP — гарантированная доставка: клиент шлёт SYN («давай начнём»), сервер отвечает SYN-ACK, клиент — ACK, дальше обмен с подтверждениями. Поэтому веб (HTTP) работает поверх TCP. UDP — быстрый, без гарантий: DNS, VoIP, стриминг.',
            code: 'tcpdump -i any port 443 -c 10   # увидим SYN/SYN-ACK/ACK своими глазами',
            tip: 'nc -zv host port вернул «open» — рукопожатие прошло. SYN улетел, ответа нет → firewall/security group между. SYN даже не улетел → блок на клиенте/пути.',
          },
          {
            title: 'NAT и приватные сети',
            text: 'Внутри офисов и контейнерных сетей — приватные адреса (10.x, 172.16–31.x, 192.168.x), наружу выходит NAT шлюза. «Снаружи» и «изнутри» — две разные вселенные: половина сетевых инцидентов — про их пересечение. Проверяйте доступность по обоим путям.',
          },
        ],
      },
      {
        heading: 'DNS: как имена становятся адресами',
        intro: 'Большинство «имя пропало» — это DNS. Сервер может быть жив, но кривой резолв делает инфраструктуру слепой.',
        items: [
          {
            title: 'Как работает резолвинг',
            text: 'Клиент спрашивает резолвер (обычно из /etc/resolv.conf), тот — кэш, потом цепочка до авторитативных серверов. Ответ приходит с TTL — временем жизни в кэше. Сменили A-запись — ждите TTL старой на всех клиентах (вот почему «уже 5 минут, а не работает!»).',
            code: 'cat /etc/resolv.conf\\ndig +short example.com   # быстрая проверка\\ndig +trace example.com    # весь путь — где «врут»',
          },
          {
            title: 'Типы записей',
            text: 'A — IPv4, AAAA — IPv6, CNAME — алиас, MX — почта, TXT — проверки (SPF/DKIM/ACME). NXDOMAIN — имени не существует вообще. Проверка записей изменилась — dig/nslookup покажут мгновенно, что DNS не виноват.',
            code: 'dig A api.example.com\\nnslookup db.internal.svc\\ngetent hosts api.example.com   # системный резолв (NSS) — как видит приложение',
          },
          {
            title: 'Внутренние DNS: Docker и K8s',
            text: 'docker-compose раздаёт имена сервисов (имя сервиса = имя хоста), Kubernetes — <service>.<namespace>.svc.cluster.local. Если внешнее имя резолвится, а внутреннее нет — смотрите, какой DNS видит контейнер изнутри (cat /etc/resolv.conf внутри).',
            code: 'docker exec app cat /etc/resolv.conf\\nkubectl run dns-test --rm -it --image=busybox -- nslookup db.default',
            tip: 'Знаменитый «502: слушаем, но не резолвим»: proxy_pass по имени сервиса, а DNS в контейнере его не знает. Всегда проверяйте резолв с того места, откуда ходит трафик.',
          },
          {
            title: 'Диагностика: DNS или не DNS?',
            text: 'Сравните три команды: dig (отвечает DNS-сервер), getent hosts (системный резолв — как видит приложение), curl (реальный трафик). Сходятся — DNS не виноват, проблема в сети/приложении. Расходятся — копайте слой, где расхождение.',
          },
        ],
      },
      {
        heading: 'HTTP и HTTPS: язык веба',
        intro: 'Вы должны понимать, что просит браузер и что отвечает сервер — вплоть до заголовка.',
        items: [
          {
            title: 'Запрос и ответ',
            text: 'Запрос: метод (GET/POST/PUT/DELETE), URI, заголовки, возможно тело. Ответ: статус-код, заголовки, тело. curl -v покажет весь обмен — от DNS и TCP до TLS и самих строк запроса. Это ваш главный «рентген».',
            code: 'curl -sv https://api.example.com/health\\n# * Trying 93.184.216.34:443...     ← TCP\\n# * Connected ...\\n# * SSL connection using TLSv1.3  ← рукопожатие\\n# > GET /health HTTP/2\\n# < HTTP/2 200',
          },
          {
            title: 'Статус-коды: карта для инцидентов',
            text: '200 OK; 201 Created; 301/302 — редирект (curl без -L его не перейдёт); 304 — кэш; 400 — кривой запрос; 401 — нет авторизации; 403 — доступ запрещён; 404 — нет такого; 408 — таймаут ожидания; 429 — rate limit; 500 — упал код приложения; 502 — bad gateway (nginx не достучался до бэкенда); 503 — недоступен (нет живых апстримов); 504 — бэкенд не ответил вовремя.',
            code: 'curl -s -o /dev/null -w "%{http_code} %{time_total}s\\n" https://example.com\\ncurl -sI https://example.com   # только заголовки',
            tip: '502 vs 504: 502 — соединение упало/отказано, 504 — соединение есть, но ответа дольше таймаута. Разница сразу указывает, где копать.',
          },
          {
            title: 'Заголовки, которые решают инциденты',
            text: 'Cache-Control/ETag/Last-Modified управляют кэшем (неправильный max-age = «пользователь видит старую версию» без единой ошибки в коде). Set-Cookie — сессии. Content-Type — формат тела. X-Request-Id/корреляционные заголовки — связка запроса с логами: приучите команду всегда их смотреть.',
          },
          {
            title: 'HTTPS и TLS: замок с цепочкой доверия',
            text: 'HTTPS = HTTP поверх TLS. Рукопожатие: клиент предлагает версии и шифры, сервер присылает сертификат, стороны договариваются о ключах (в TLS 1.3 — одно сообщение туда-обратно). Доверие — по цепочке: сертификат → промежуточный CA → корневой CA в хранилище клиента. Оборванная цепочка = «недоверенный» замок.',
            code: 'echo | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null | grep -E "Verify return|subject=|issuer="\\necho | openssl s_client -connect example.com:443 2>/dev/null | openssl x509 -noout -dates   # срок действия',
            tip: 'Продлевайте сертификаты по уведомлениям (30/14/7 дней), а не по «пользователи жалуются». Ошибка ERR_CERT_DATE_INVALID у всех клиентов — уже инцидент.',
          },
        ],
      },
      {
        heading: 'Nginx: реверс-прокси и балансировщик',
        intro: 'Nginx — «лицо» почти любого веб-приложения: принимает клиентов, отдаёт статику, проксирует на бэкенды, балансирует нагрузку.',
        items: [
          {
            title: 'Структура конфига',
            text: 'Основной /etc/nginx/nginx.conf: блок http {} с общими опциями и include каталога sites-enabled. Каждый сайт — файл с блоками server {} (порт + server_name) и внутри location {} (правила маршрутов). Золотое правило: nginx -t перед каждым изменением конфига.',
            code: 'server {\\n    listen 80;\\n    server_name app.example.com;\\n    location / {\\n        proxy_pass http://backend;\\n        proxy_set_header Host $host;\\n        proxy_set_header X-Real-IP $remote_addr;\\n    }\\n}\\n\\nupstream backend {\\n    server 10.0.1.2:8080;\\n    server 10.0.1.3:8080;\\n}',
            tip: 'Синтаксическая ошибка в конфиге = nginx не стартует (или reload «неудача» без даунтайма). Ритуал: правка → nginx -t → nginx -s reload.',
          },
          {
            title: 'proxy_pass и апстримы',
            text: 'proxy_pass — куда слать запросы. Можно статично http://ip:port, можно именем upstream — тогда nginx сам балансирует между серверами и ведёт статистику. Ключевой файл отладки: access.log (коды ответов) и error.log (connect() failed / timed out / refused).',
            code: 'tail -f /var/log/nginx/error.log\\ngrep "connect() failed" /var/log/nginx/error.log | tail -5\\n# ... connect() failed (111: Connection refused) while connecting to upstream',
          },
          {
            title: 'Балансировка: стратегии',
            text: 'По умолчанию round-robin. least_conn — наименее загруженному (медленные бэкенды), ip_hash — клиент «прилипает» к бэкенду (сессии). max_fails/fail_timeout — nginx выводит упавший бэкенд из ротации (по умолчанию после 1 ошибки за 10 секунд).',
            code: 'upstream backend {\\n    least_conn;\\n    server 10.0.1.2:8080 max_fails=3 fail_timeout=30s;\\n    server 10.0.1.3:8080 max_fails=3 fail_timeout=30s;\\n    keepalive 32;\\n}',
            tip: 'keepalive в апстриме — недооценённая настройка: без неё nginx открывает новое TCP-соединение на каждый запрос, и на пиках у бэкенда кончаются сокеты (шторм TIME_WAIT, внезапные 502).',
          },
          {
            title: 'Таймауты — инструмент против «подвисших»',
            text: 'proxy_connect_timeout — до соединения; proxy_read_timeout — между ответами бэкенда; proxy_send_timeout — на отправку. Медленный бэкенд — увеличивайте read; недоступный — уменьшайте connect (например 2с), чтобы клиент не ждал вечность.',
            code: 'location / {\\n    proxy_connect_timeout 3s;\\n    proxy_read_timeout 60s;\\n    proxy_send_timeout 60s;\\n    proxy_pass http://backend;\\n}',
          },
          {
            title: 'SSL в nginx',
            text: 'listen 443 ssl + ssl_certificate (цепочка fullchain) и ssl_certificate_key. Редирект с HTTP — return 301 https://$host$request_uri в 80-ом блоке. Для быстрых рукопожатий — ssl_session_cache. Сертификаты обычно ротируют через certbot/ACME — проверяйте права на ключ после обновления.',
            code: 'server {\\n    listen 443 ssl;\\n    server_name app.example.com;\\n    ssl_certificate     /etc/nginx/ssl/fullchain.pem;\\n    ssl_certificate_key /etc/nginx/ssl/privkey.pem;\\n}\\nserver { listen 80; server_name app.example.com; return 301 https://$host$request_uri; }',
          },
        ],
      },
      {
        heading: 'Диагностика сети: curl, ss, nc, tcpdump',
        intro: 'Единый формат расследования — слоями снизу вверх: интерфейс → маршрут → DNS → TCP → TLS → HTTP.',
        items: [
          {
            title: 'curl: швейцарский нож',
            text: 'Основные флаги: -v (весь обмен), -I (только заголовки), -o /dev/null -w (метрики), -H (свой заголовок), --max-time (таймаут), --resolve (обойти DNS), -k (без проверки TLS), -x (через прокси). Тайминги -w распишут, где теряются миллисекунды.',
            code: 'curl -o /dev/null -s -w "http=%{http_code} dns=%{time_namelookup}s conn=%{time_connect}s tls=%{time_appconnect}s total=%{time_total}s\\n" https://api.example.com\\ncurl --resolve api.example.com:443:10.0.1.5 https://api.example.com/health   # игнорировать DNS',
            tip: 'Сравните tls−conn (рукопожатие TLS) с conn (TCP). tls вдруг +500мс — проверяйте цепочку и OCSP. total значительно больше tls — долгий сам запрос/бэкенд.',
          },
          {
            title: 'ss и nc: кто слушает и кто доступен',
            text: 'ss -tulpn — слушатели и процессы; ss -tn — активные соединения; ss state time-wait — шторм закрытых (обычно: сервис закрывает соединения, не успевая). nc -zv host port — проба порта с таймаутом -w2. В контейнерах ss может отсутствовать — ставьте или смотрите /proc/net/tcp.',
            code: 'nc -zv -w2 10.0.1.2 8080    # Connection to ... succeeded!\\nss -tn state time-wait | wc -l  # тиски из TIME_WAIT',
          },
          {
            title: 'tcpdump: увидеть пакеты своими глазами',
            text: 'Работает под root. Фильтры: -i any (все интерфейсы), port, host, -c число (сколько пакетов), -n (не резолвить имена). Ключевой вопрос, на который отвечает: «SYN доходит до сервера?» — ответы синхронизируют всю картину.',
            code: 'tcpdump -i any port 443 -n -c 20\\n# 14:02:11.123 IP 10.0.1.2.53412 > 10.0.1.5.443: Flags [S]  ← SYN пришёл\\ntcpdump -ni any tcp port 80 and \'tcp[tcpflags] & tcp-syn != 0\' -c 10   # только SYN',
            tip: 'Правдоподобное правило: SYN приходит, ответ не уходит — firewall на сервере. SYN не виден вовсе — блок на пути/клиенте. «ss слушает» + «tcpdump видит» закрывают 80% сетевых загадок.',
          },
        ],
      },
      {
        heading: 'Рецепт: разбираем 502/504 Bad Gateway',
        ordered: true,
        intro: 'Пошаговый алгоритм, который закрывает почти все 502/504 на лёгких и средних стендах.',
        items: [
          {
            title: 'Уточнить симптом',
            text: '502 (не достучались) или 504 (не дождались)? Смотрим error.log nginx: «connect() failed (111: Connection refused)» против «upstream timed out». Разные болезни — разное лечение.',
          },
          {
            title: 'Жив ли бэкенд и слушает ли порт',
            text: 'На хосте бэкенда: ss -tulpn | grep <порт> (слушает ли), systemctl status / docker ps (упал ли), журнал приложения (journalctl -u <сервис> -n 50). Упавший инстанс из нескольких в upstream — тоже 502, но частичный.',
            code: 'ss -tulpn | grep 8080\\nsystemctl status app   # или docker ps --filter name=app\\njournalctl -u app -n 50 --no-pager',
          },
          {
            title: 'Проверяем доступность по прокси-пути',
            text: 'С самого nginx-хоста: curl http://10.0.1.2:8080/health. Refused — не слушает (или слушает только 127.0.0.1). No route/timeout — сеть между nginx и бэкендом (firewall, VPC, разные сети). Проверьте nc -zv, при странностях — tcpdump.',
          },
          {
            title: 'Не забываем про DNS внутри',
            text: 'Если proxy_pass по имени (http://backend:8080, сервис в k8s) — проверьте резолв с хоста nginx: getent hosts backend. Протухший кэш резолвера — тоже 502. Быстрая проверка: curl по IP со --resolve.',
            code: 'getent hosts backend\\ncurl http://backend:8080/health   # по внутреннему имени — прямо как nginx',
          },
          {
            title: 'Стабилизация и root cause',
            text: 'Сначала вернуть сервис: перезапуск бэкенда, исключение больного инстанса из upstream + reload. Потом корень: лог бэкенда (OOM? деплой? сеть?), события ядра (dmesg), алерты. Запишите таймлайн — это будущий постмортем.',
          },
        ],
      },
    ],
  },
  {
    id: 'git-bridge',
    title: 'Git & CI/CD',
    icon: '🌉',
    zone: 'Git Bridge & CI/CD',
    color: '#fbbf24',
    summary:
      'Git — система управления версиями, без которой не живёт ни одна команда: все изменения кода и инфраструктуры проходят через неё. А CI/CD автоматизирует сборку, тесты и выкладку. Для дежурного это и инструмент, и объект инцидентов: «деплой сломал прод» — вы будете смотреть, кто, что и когда смержил.',
    tags: ['Ветки', 'Merge', 'Откаты', 'GitHub Actions', 'CI/CD', 'Автоматизация'],
    sections: [
      {
        heading: 'Что такое Git и зачем он нужен',
        intro: 'Коротко: Git — машина времени и система параллельного редактирования. Каждое изменение запоминается навсегда, от каждого можно откатиться.',
        items: [
          {
            title: 'Репозиторий и коммиты',
            text: 'Репозиторий (.git) хранит историю: коммиты — снимки состояния с хешем (sha), автором, датой и сообщением. Каждый коммит ссылается на родителя — получается цепочка (граф). Всё закоммиченное восстановимо: удалённую строку можно вернуть через git log → revert/restore.',
            code: 'git init\\n# ...изменяем файлы...\\ngit add file.txt       # в staging\\ngit commit -m "fix: retry on network timeout"\\ngit log --oneline --graph -10   # история графом',
          },
          {
            title: 'Три зоны',
            text: 'Рабочий каталог (что на диске) → Staging (git add: что войдёт в коммит) → HEAD (закоммичено). Состояния файла: modified, staged, untracked, deleted. git status — ваш GPS: читайте его перед каждым «нелогичным» действием.',
            code: 'git status\\n# On branch main\\n# Changes not staged for commit:\\n#   modified:   src/app.ts\\n# Untracked files:\\n#   src/new.ts',
          },
          {
            title: 'Удалённый репозиторий (remote)',
            text: 'Код дублируется на сервере (GitHub/GitLab/Bitbucket). git pull = fetch (забрать) + merge (влить). git push — залить свои коммиты. Сообщение «rejected: non-fast-forward» — другой уже пушил: сделайте git pull --rebase и пушите снова.',
            code: 'git remote -v\\ngit fetch origin && git status   # обновились, ничего не вливая\\ngit push origin feature/rates',
          },
        ],
      },
      {
        heading: 'Основной рабочий цикл',
        intro: 'Двадцать команд решают 99% задач. Вот сценарий типового дня.',
        items: [
          {
            title: 'Сценарий: задача → ветка → слив',
            text: 'От main делаем feature-ветку, работаем, коммитим, пушим, открываем Pull Request (PR) / Merge Request, проходим ревью, сливаем. Так параллельные задачи не мешают друг другу, а история остаётся понятной.',
            code: 'git checkout -b feature/rate-limit main\\n# ... правки ...\\ngit add . && git commit -m "feat: rate limit middleware"\\ngit push -u origin feature/rate-limit\\n# далее PR в интерфейсе GitHub/GitLab',
          },
          {
            title: 'Как писать коммиты',
            text: 'Конвенция Conventional Commits: type(scope): описание — fix:, feat:, chore:, docs:, refactor:. Коммиты делайте маленькими и логичными. «Исправил» без деталей — завтра никто не поймёт, что исправляли; при инциденте именно по коммитам ищут, что сломало прод.',
            code: 'fix(auth): return 401 instead of 500 on invalid session\\ndocs(readme): add local dev section\\nrefactor(billing): extract pricing to module',
          },
          {
            title: 'diff: что именно изменилось',
            text: 'git diff — неоткоммиченное; git diff --staged — подготовленное; git diff main..feature — между ветками; git diff v1.2.0..v1.2.1 — между релизами. В инциденте «деплой сломал прод» это первая команда: какие файлы и насколько изменились.',
            code: 'git diff --stat v1.2.0..v1.2.1\\ngit show <sha> --stat\\ngit blame src/app.ts   # кто и в каком коммите писал эту строку',
            tip: 'git blame — ваш детектив на проде: «эта строка ведёт к таймауту» → кто её добавил → осознанный фикс или быстрый откат.',
          },
        ],
      },
      {
        heading: 'Ветки, merge и конфликты',
        intro: 'Слияния — источник и порядка, и хаоса. Учитесь разводить конфликты руками до того, как они придут в прод.',
        items: [
          {
            title: 'merge и rebase: два способа влить',
            text: 'merge создаёт коммит-«стык» двух линий (история с ветками). rebase перекладывает ваши коммиты поверх другой ветки (история линейная). ВАЖНО: rebase переписывает sha коммитов — никогда не делайте его на общих ветках (main/master).',
            code: 'git merge main          # вливаем main в свою ветку\\ngit rebase main         # свои коммиты поверх main — линейно\\ngit pull --rebase       # pull без «Merge branch»-горы',
          },
          {
            title: 'Как выглядит конфликт',
            text: 'Обе стороны изменили один кусок → маркеры внутри файла: <<<<<<< HEAD (ваше), =======, >>>>>>> <ветка> (чужое). Вы оставляете правильный вариант, убираете маркеры, git add и завершаете: git merge --continue / git rebase --continue.',
            code: '<<<<<<< HEAD\\nbranch: main\\n=======\\nbranch: feature\\n>>>>>>> feature/rates\\n# оставляем нужное:\\nbranch: feature',
            tip: 'Конфликт в terraform state или секретах — не «чините на скорую руку». Разбирайте: там чужая инфраструктура или чужие ключи. Кто-то один должен владеть решением.',
          },
          {
            title: 'Аварийные выходы: abort',
            text: 'Запутались в середине? git merge --abort / git rebase --abort возвращает всё как было. Это безопасно и всегда доступно. В панике отложите «красивое» и выйдите через abort — потом разберётесь спокойно.',
          },
          {
            title: 'Когда конфликт в прод пришёл сам',
            text: 'Бывает, деплой выкатал коммит, слитый без ревью. Алгоритм: git log main --oneline -5 (что приехало), git diff <прошлый тег>..<текущий> (что изменилось), git revert <sha> и новый релиз. Стабильность важнее разбирательств — восстановили, потом анализируем.',
          },
        ],
      },
      {
        heading: 'Откаты: если что-то пошло в прод',
        intro: 'Когда деплой ломает прод, важнее скорость восстановления, чем воспитание автора. Вот арсенал.',
        items: [
          {
            title: 'revert vs reset',
            text: 'git revert <sha> — новый коммит, отменяющий изменения: историю никто не переписывает, безопасен для общих веток. git reset --hard <sha> — переместить ветку назад, стерев коммиты: опасно и переписывает историю. На проде — только revert.',
            code: 'git revert --no-edit <sha> && git push\\ngit revert HEAD~3..HEAD --no-edit   # отменить последние 3 коммита целиком',
          },
          {
            title: 'Откат незакоммиченного',
            text: 'git restore <file> — вернуть файл к HEAD; git restore --staged <file> — убрать из staging; git clean -fd — удалить неотслеживаемые файлы (навсегда! сначала -n — просмотр).',
            code: 'git restore src/config.ts\\ngit clean -n   # сухой прогон: что будет удалено\\ngit clean -fd  # реальное удаление',
          },
          {
            title: 'stash: спрятать черновик',
            text: 'Надо срочно переключиться, а правки не готовы к коммиту? git stash — отложить, git stash pop — вернуть, git stash list — очередь. Спрятанное не теряется до stash clear.',
          },
          {
            title: 'git bisect: найти сломанный коммит автоматически',
            text: 'Бинарный поиск по истории: вы указываете «этот коммит ещё хороший», «этот уже плохой» — git сам проходит середину, вы проверяете (вручную или скриптом через run) и за ~log2(n) шагов находится виновник.',
            code: 'git bisect start HEAD v1.2.0\\ngit bisect run ./test.sh   # скрипт: 0 = ок, 1 = сломано\\n# ... первый плохой коммит: abc1234 ...\\ngit bisect reset',
          },
        ],
      },
      {
        heading: 'История: log, tags, .gitignore',
        intro: 'Умение читать историю — половина расследования любого «что сломал прод».',
        items: [
          {
            title: 'Git log на максимуме',
            text: '--oneline --graph — граф; --since/--until — окно времени («что деплоили в 3 ночи?»); --author — автор; -S"строка" — когда добавили конкретную строку; --all — во всех ветках; --name-status — какие файлы трогал коммит.',
            code: 'git log --oneline --since="2026-08-01 22:00" --until="2026-08-02 06:00"\\ngit log -S "timeout_ms" --oneline --all\\ngit log --name-status -1',
          },
          {
            title: 'Теги: метки релизов',
            text: 'Теги (v1.2.3) фиксируют точку истории: релиз, версию, точку отката. Откат «на вчерашний тег» — главный сценарий дежурного.',
            code: 'git tag v1.2.4 && git push --tags\\ngit tag -l "v1.2*"\\ngit diff v1.2.3..v1.2.4 --stat   # что изменилось в релизе',
          },
          {
            title: '.gitignore: что нельзя коммитить',
            text: 'Секреты (.env, *.pem), зависимости (node_modules, vendor), артефакты (dist, *.log), IDE-каталоги (.idea). Просочившийся секрет = уже скомпрометирован: ротируйте ключи, а не только удаляйте строку из кода.',
            code: '.env\\n*.pem\\nnode_modules/\\ndist/\\n*.log\\n.idea/',
            tipKind: 'warning',
            tip: 'Секрет уехал в историю — недостаточно того, чтобы стереть файл. Считайте его опубликованным: меняйте пароль/ключ и только потом вычищайте историю (git filter-repo / BFG).',
          },
          {
            title: 'Пустой .env в репозитории',
            text: 'Пустые шаблоны конфигов (.env.example с заглушками) — норм. Заполненные (.env с реальными паролями) — катастрофа. Правило: в репозитории только структура и заготовки, секреты — в CI-секретах или Vault.',
          },
        ],
      },
      {
        heading: 'CI/CD: пайплайны и GitHub Actions',
        intro: 'CI (Continuous Integration) — автоматические сборка и тесты на каждое изменение. CD (Continuous Delivery/Deployment) — автоматическая выкладка. Инфраструктура и релизы теперь тоже описываются кодом и едут через те же пайплайны.',
        items: [
          {
            title: 'Как устроен workflow в GitHub Actions',
            text: 'Файл .github/workflows/<name>.yml: on: (триггеры: push, pull_request, schedule), jobs: (задачи), внутри steps: (шаги: uses — готовое действие, run — команды). Переменные секретов — ${{ secrets.TOKEN }}.',
            code: 'name: CI\\non:\\n  push:\\n    branches: [main]\\n  pull_request:\\n\\njobs:\\n  build:\\n    runs-on: ubuntu-latest\\n    steps:\\n      - uses: actions/checkout@v4\\n      - run: npm ci\\n      - run: npm test\\n      - uses: actions/upload-artifact@v4\\n        with:\\n          name: dist\\n          path: dist/',
          },
          {
            title: 'Секреты и их враги',
            text: 'Секреты хранятся в Settings → Secrets (Actions). НИКОГДА не в коде и не в логах пайплайна. Ошибка debug-логирования `echo $TOKEN` в CI — классическая утечка: лог остаётся в истории workflow. Мониторинг таких лог-строк — задача дежурного.',
            tipKind: 'warning',
            tip: 'Вывод секрета в лог CI = ротация секрета. Независимо от того, «вроде никого не было». Логи пайплайнов живут годами.',
          },
          {
            title: 'Стадии типичного пайплайна',
            text: 'Lint → Test → Build → Push image → Deploy. Чем раньше упало, тем лучше: ошибка на этапе lint не дала выкатить баг. Плохие пайплайны деплоят по кнопке, хорошие — деплоят с флагом отката, отличные — откатываются сами по healthcheck.',
            code: 'jobs:\\n  test: { ... }\\n  build:\\n    needs: test\\n    steps: [ ... сборка и публикация образа ... ]\\n  deploy:\\n    needs: build\\n    if: github.ref == \'refs/heads/main\'\\n    steps: [ ... выкат на прод ... ]',
          },
          {
            title: 'Инцидент: «пайплайн сломал прод»',
            text: 'Смотрите: какой коммит едет (git log в начале workflow), кто запустил (workflow run → actor), какие файлы изменились. Первое действие — откат деплоя на прошлый тег, потом разбор. CI — не чёрный ящик: каждый run имеет лог с таймингом.',
            code: 'gh run list --limit 5\\ngh run view <run-id> --log | grep ERROR\\ngh run rerun <run-id> --failed',
          },
        ],
      },
      {
        heading: 'Рецепт: откат failed-деплоя за 5 минут',
        ordered: true,
        items: [
          {
            title: 'Зафиксировать версию «до»',
            text: 'Тег последнего стабильного релиза (или sha из прошлого успешного run). Запишите его — всё дальнейшее строится на нём.',
            code: 'git tag -l "v*" | sort -V | tail -5\\ngit log --oneline -3',
          },
          {
            title: 'Понять, что именно приехало',
            text: 'git diff <стабильный тег>..HEAD --stat — какие файлы изменились. Если CI-флоу позволяет деплой по тегу/коммиту — перезапустите его на стабильной версии.',
          },
          {
            title: 'Откатить код или конфиг',
            text: 'Код: git revert <sha> (или новый коммит) + push. Конфиг/инфраструктура: terraform state/код в репозитории — верните содержимое и примените. Затем перекатите сервис (restart/rollout).',
          },
          {
            title: 'Проверить здоровье и доложить',
            text: 'curl/im-health, статус в мониторинге, пользовательская жалоба закрыта. Отметить в чате смены: инцидент, время, что откатили. Постмортем — после стабилизации.',
          },
        ],
      },
    ],
  },
  {
    id: 'docker-yard',
    title: 'Docker и Контейнеризация',
    icon: '🐳',
    zone: 'Docker Yard',
    color: '#38bdf8',
    summary:
      'Docker упаковывает приложение и всё, что ему нужно (библиотеки, рантайм, конфиг), в изолированный контейнер, который одинаково работает где угодно. Это фундамент современной инфраструктуры: из здесь вытекают Kubernetes, композиции и половина инцидентов («контейнер падает»).',
    tags: ['Образы', 'Dockerfile', 'Команды', 'Volumes', 'Сети', 'Compose'],
    sections: [
      {
        heading: 'Контейнеризация: зачем и как',
        intro: 'Поймите разницу между виртуализацией и контейнерами — от неё зависит половина архитектурных решений.',
        items: [
          {
            title: 'Контейнер vs виртуальная машина',
            text: 'ВМ — полноценная ОС с собственным ядром: тяжёлая (гигабайты), медленный старт, полная изоляция. Контейнер — процесс + собственная файловая система, но на ядре хост-системы: лёгкий (мегабайты), стартует за секунды. Из-за общего ядра контейнер и дешевле, и опаснее границ.',
            tip: 'Изоляция контейнеров не железобетонная: ядро общее, поэтому «контейнер = мини-ВМ» — опасное заблуждение. Отсюда и категории security-инцидентов с --privileged.',
          },
          {
            title: 'Образ и контейнер',
            text: 'Образ (image) — неизменяемый «чертёж»: слои файловой системы + метаданные (CMD, ENV, ports). Контейнер — запущенный экземпляр образа со своим слоем записи. Образы версионируются тегами: app:1.2.0, app:latest, app:sha-abc123.',
            code: 'docker images\\ndocker image inspect app:v1 --format \'{{.Config.Env}}\'',
          },
          {
            title: 'Реестры образов',
            text: 'Образы живут в реестрах: Docker Hub, GHCR, ECR, GCR, свои. Публичный образ весов не имеет, свой — надо пушить: docker tag + docker push. Скачивание — docker pull. По умолчанию тянутся с Docker Hub.',
            code: 'docker pull nginx:alpine\\ndocker tag app:v1 ghcr.io/me/app:v1\\ndocker push ghcr.io/me/app:v1',
          },
          {
            title: 'Как Docker изолирует',
            text: 'Механизмы ядра: namespaces (изолируют процессы, сеть, файловую систему, пользователей) и cgroups (ограничивают CPU/память/IO). Cgroups — почему работают docker stats и лимиты из k8s requests/limits.',
            code: 'docker stats   # живой мониторинг CPU/RAM всех контейнеров\\ndocker run --memory=512m --cpus=0.5 nginx   # жёсткие лимиты',
          },
        ],
      },
      {
        heading: 'Dockerfile: как пишется образ',
        intro: 'Dockerfile — рецепт сборки образа. Каждая инструкция = новый слой. От порядка строк зависит размер и скорость сборки.',
        items: [
          {
            title: 'Основные инструкции',
            text: 'FROM — базовый образ. RUN — выполнить команду на этапе сборки. COPY — скопировать файлы с хоста. WORKDIR — рабочий каталог. ENV — переменные окружения. EXPOSE — объявить порт (документация). CMD — команда по умолчанию. ENTRYPOINT — исполняемая точка входа.',
            code: 'FROM node:20-alpine\\nWORKDIR /app\\nCOPY package*.json ./\\nRUN npm ci\\nCOPY . .\\nEXPOSE 3000\\nCMD ["node", "server.js"]',
          },
          {
            title: 'Слои и кэш: почему порядок важен',
            text: 'Каждая инструкция создаёт слой. При пересборке Docker переиспользует неизменённые слои. Поэтому «тяжёлые и редко меняющиеся» операции (установка зависимостей) ставьте раньше, «часто меняющиеся» (копирование кода) — позже. Скопировали код раньше npm ci — каждый коммит переустанавливает зависимости.',
            code: '# ПЛОХО: код меняется постоянно, зависимости пересобираются всегда\\nCOPY . .\\nRUN npm ci\\n\\n# ХОРОШО: пакет-файлы меняются редко - слой с npm ci кэшируется\\nCOPY package*.json ./\\nRUN npm ci\\nCOPY . .',
            tip: 'Оптимизируйте не «чтобы собиралось», а «чтобы пересобиралось быстро»: слои-зависимости живут в кэше между коммитами.',
          },
          {
            title: 'CMD vs ENTRYPOINT',
            text: 'CMD — аргументы/команда по умолчанию (можно переопределить при docker run). ENTRYPOINT — фиксированная точка входа; аргументы из CMD и docker run передаются ей. Контейнер живёт, пока живёт процесс из точки входа: если он падает — контейнер перезапускается (Restart/--restart).',
            code: 'ENTRYPOINT ["python"]\\nCMD ["app.py"]\\n# docker run my-py --help   → python --help',
            tipKind: 'warning',
            tip: 'Контейнер «умирает мгновенно» почти всегда = процесс точки входа вышел с ошибкой. Смотрите docker logs: там причина. Проверяйте также, что процесс слушает, а не просто стартовал и работает.',
          },
          {
            title: 'Multi-stage: маленький финальный образ',
            text: 'Несколько FROM в одном Dockerfile: в промежуточных этапах (builder) компиляторы и SDK, в финальный копируем только результат через COPY --from=<этап>. Результат: с 2 ГБ до 50 МБ. Это квест Васи из Docker Yard — здесь он подробно.',
            code: 'FROM golang:1.22 AS builder\\nWORKDIR /app\\nCOPY . .\\nRUN CGO_ENABLED=0 go build -o server .\\n\\nFROM alpine:latest\\nCOPY --from=builder /app/server /server\\nCMD ["/server"]',
          },
          {
            title: '.dockerignore',
            text: 'Аналог .gitignore для контекста сборки: не отправлять на сборщик node_modules, .git, логи. Иначе кэш не работает (контекст считается изменённым), сборка медленная, а в образ могут попасть секреты.',
            code: 'node_modules\\n.git\\ndist\\n*.log\\n.env',
            tipKind: 'warning',
            tip: 'docker build с контекстом, содержащим .env — риск утечки секрета в слой образа (лежит в истории слоёв). .dockerignore обязателен.',
          },
          {
            title: 'HEALTHCHECK',
            text: 'Dockerfile-инструкция или --health-cmd при запуске: Docker периодически проверяет здоровье контейнера и помечает unhealthy. На уровне compose/k8s это те же probes. Без healthcheck «контейнер работает, но приложение мертво» — типичный сценарий мониторинга.',
            code: 'HEALTHCHECK --interval=10s --timeout=3s --retries=3 \\\\\\n  CMD curl -sf http://localhost:3000/health || exit 1',
          },
        ],
      },
      {
        heading: 'Запуск и управление контейнерами',
        intro: 'Базовый набор команд — вторая природа дежурного.',
        items: [
          {
            title: 'docker run во всех вариантах',
            text: 'docker run -d (detached, фоном) -p порт:порт -e ENV=value -v volume:каталог --name имя --restart unless-stopped -it (интерактивно). --rm — удалить после остановки (для тестов). Именованные аргументы: имя контейнера, образ:тег.',
            code: 'docker run -d -p 8080:80 --name web --restart unless-stopped nginx:alpine\\ndocker run -it --rm alpine sh   # разовый отладочный контейнер',
          },
          {
            title: 'Мониторинг и инспекция',
            text: 'docker ps (запущенные), -a (все), docker logs -f --tail 100 (логи), docker stats (ресурсы), docker top (процессы в контейнере), docker inspect (всё остальное: env, сети, лимиты, exit code).',
            code: 'docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"\\ndocker logs -f --tail 200 app\\ndocker inspect app --format \'{{.State.ExitCode}} {{.RestartCount}}\'',
          },
          {
            title: 'Внутрь контейнера',
            text: 'docker exec -it <id> sh — оболочка внутри (в alpine sh, в debian bash). Отсюда проверяйте резолв DNS, порты (ss/netstat внутри), процессы. Важно: утилит может не быть — ставьте через пакетный менеджер дистрибутива.',
            code: 'docker exec -it app sh\\ndocker exec app cat /etc/resolv.conf   # какой DNS видит контейнер',
          },
          {
            title: 'Жизненный цикл: stop/start/restart/rm',
            text: 'stop — SIGTERM (вежливо); kill — SIGKILL; start — поднять остановленный; restart — перезапустить; rm — удалить контейнер (НЕ образ!). rm -f — удалить даже запущенный. Удалённые контейнеры не восстановить: тройная проверка перед rm.',
            code: 'docker stop app && docker rm app\\ndocker rm -f app   # насильно\\ndocker system prune   # удалить висячие образы, сети, кэш',
          },
          {
            title: 'docker system df: утечки места',
            text: 'Образы, контейнеры, объёмы, кэш сборки копятся и съедают диск — классическая причина «диск 100% на билд-машине». docker system df покажет расклад; prune-команды — чистка (осторожно с volumes!).',
            code: 'docker system df\\ndocker image prune -a   # все неиспользуемые образы\\ndocker system prune -a --volumes   # полная чистка — и всё удалит!',
            tipKind: 'warning',
            tip: 'docker system prune -a --volumes удаляет ВСЁ неиспользуемое, включая volumes с данными. Команда только после сверки с «что тут вообще живёт».',
          },
        ],
      },
      {
        heading: 'Данные и сети',
        intro: 'Контейнер — эфемерный. Данные и сеть — отдельные механизмы, о которых забывают до первого инцидента.',
        items: [
          {
            title: 'Volumes и bind mounts',
            text: 'Место внутри контейнера исчезает вместе с ним (слой записи). Для данных: named volume (-v mydata:/var/lib/mysql) — Docker сам управляет местом; bind mount (-v /host/path:/container/path) — прямо на диск хоста (логи, конфиги). Проверка: docker volume ls, docker inspect.',
            code: 'docker volume create pgdata\\ndocker run -d -v pgdata:/var/lib/postgresql/data postgres:16\\ndocker run -d -v /etc/nginx/conf.d:/etc/nginx/conf.d:ro nginx',
            tip: 'Правило: бэкенды-БД без volume = потеря данных при перезапуске. «Контейнер пересоздали, а данные… где данные?» — лучшая страшилка Docker Yard.',
          },
          {
            title: 'Сети Docker',
            text: 'По умолчанию bridge: контейнеры в одной сети видят друг друга по имени. host — контейнер делит сеть хоста (быстро, но без изоляции). none — без сети. Свои сети создаются под сервисы: docker network create + --network.',
            code: 'docker network create mynet\\ndocker run --network mynet --name api api:1\\ndocker run --network mynet --name web nginx\\n# web → curl http://api:8080   — по ИМЕНИ, не по IP',
            tip: 'Запоминается из-за частых 502: «не резолвится имя сервиса» — контейнеры в разных сетях. docker network inspect покажет участников.',
          },
          {
            title: 'Порты и публикация',
            text: '-p хостовый:контейнерный — внешний доступ. Без -p контейнер живёт только внутри сети Docker. -P — опубликовать все EXPOSE автоматически. Смотрите освоенный порт в docker ps (столбец PORTS).',
            code: 'docker run -p 8080:80 nginx     # хост:8080 → контейнер:80\\ndocker port <id>                      # какие порты опубликованы',
          },
        ],
      },
      {
        heading: 'Docker Compose: несколько сервисов одним файлом',
        intro: 'Compose описывает многосервисный стек (app + db + cache + nginx) в docker-compose.yml — и поднимает всё одной командой.',
        items: [
          {
            title: 'Структура compose-файла',
            text: 'version (устарел), services: (список сервисов: image/build, ports, environment, volumes, depends_on, restart), networks:, volumes:. Одно и то же стекло поднимается на любой машине — это и есть «инфраструктура как код» в миниатюре.',
            code: 'services:\\n  web:\\n    build: .\\n    ports: ["8080:3000"]\\n    depends_on:\\n      - db\\n    restart: unless-stopped\\n  db:\\n    image: postgres:16\\n    environment:\\n      POSTGRES_PASSWORD: ${DB_PASSWORD}\\n    volumes:\\n      - pgdata:/var/lib/postgresql/data\\nvolumes:\\n  pgdata:',
          },
          {
            title: 'Команды Compose',
            text: 'docker compose up -d (поднять), --build (пересобрать образы), down (остановить и удалить сети; -v — и volumes), ps, logs -f, exec, config (валидация/сборка эффективного конфига).',
            code: 'docker compose up -d --build\\ndocker compose ps\\ndocker compose logs -f web\\ndocker compose exec web sh\\ndocker compose config   # итоговый конфиг после переменных',
          },
          {
            title: 'depends_on и healthcheck',
            text: 'depends_on ждёт только старта, не готовности. Для порядка реального запуска используйте conditions: service_healthy + healthcheck в зависимом сервисе. Иначе db «стартовала, но не готова», а app падает с connection refused при старте.',
            code: 'depends_on:\\n  db:\\n    condition: service_healthy\\n# ...а в db:\\nhealthcheck:\\n  test: ["CMD", "pg_isready", "-U", "user"]\\n  interval: 5s\\n  retries: 5',
          },
          {
            title: 'Переменные окружения',
            text: '.env рядом с compose-файлом подставляет переменные (${VAR}). Никогда не кладите реальные секреты прямо в docker-compose.yml — их увидят все, кто читает репозиторий.',
            tipKind: 'warning',
            tip: 'Логичный порядок: репозиторий = compose + .env.example; реальный .env — на сервере и в закромах секретов. Секреты в docker-compose.yml = утечка.',
          },
        ],
      },
      {
        heading: 'Рецепт: «контейнер падает / образ раздут»',
        ordered: true,
        items: [
          {
            title: 'Упавший контейнер: читаем логи',
            text: 'docker logs <id> — ищем первую ошибку (не последнюю: stack trace читают снизу до первой причины — root cause обычно вверху). docker inspect: ExitCode + RestartCount (сколько раз перезапустился с --restart).',
            code: 'docker ps -a | grep app\\ndocker logs app --tail 100\\ndocker inspect app --format \'{{.State.ExitCode}} / {{.RestartCount}}\'',
          },
          {
            title: 'Входим внутрь и проверяем',
            text: 'docker exec -it app sh: процесс жив ли (ps), слушает ли порт (ss -tulpn), DNS видит ли (cat /etc/resolv.conf, getent hosts db). Сравните с ожиданием — расхождение часто и есть диагноз.',
          },
          {
            title: 'Контейнер жив, а приложение мертво',
            text: 'Симптом «docker ps показывает Up, но сервис не отвечает». Проверьте healthcheck (docker inspect → State.Health), порт изнутри, логи. Лечится probes/healthcheck + Restart, а не «пересоздать контейнер и надеяться».',
          },
          {
            title: 'Образ раздут: multi-stage + слои',
            text: 'Длинная сборка/гигантский образ → multi-stage (см. выше), меньше RUN-операций, чистка кэшей пакетов в той же инструкции (RUN apt-get update && apt-get install ... && rm -rf /var/lib/apt/lists/*). Финал: golang:2ГБ → alpine:60МБ.',
            code: 'RUN apt-get update \\\\\\n    && apt-get install -y --no-install-recommends build-essential \\\\\\n    && rm -rf /var/lib/apt/lists/*',
          },
          {
            title: 'Зафиксировать и переиспользовать',
            text: 'Решение легло — зафиксируйте команды в runbook зоны (образ, проверки, версии тегов). «Я помню, что когда-то чинил» — худший runbook.',
          },
        ],
      },
    ],
  },
  {
    id: 'k8s-core',
    title: 'Kubernetes',
    icon: '☸️',
    zone: 'K8s Core District',
    color: '#818cf8',
    summary:
      'Kubernetes — оркестратор контейнеров: сам размещает, масштабирует, перезапускает и маршрутизирует ваши приложения на кластере серверов. Это «город» из Докер Ярда, только с правительством, полицией и зонами. Здесь: архитектура, поды, Deployment, Service, Ingress, ресурсы и расследование CrashLoopBackOff.',
    tags: ['Поды', 'Deployment', 'Service/Ingress', 'ConfigMap', 'Ресурсы', 'CrashLoop'],
    sections: [
      {
        heading: 'Архитектура: кто в доме хозяин',
        intro: 'Kubernetes = control plane (управление) + worker nodes (рабочие). Поймите роли — и большинство «магических» событий станут объяснимыми.',
        items: [
          {
            title: 'Control plane',
            text: 'api-server (единственная дверь: все ваши kubectl и контроллеры идут через него), etcd (хранилище всего состояния — «база данных кластера»), scheduler (решает, где запускать под), controller-manager (приводит реальность к желаемой: увидел расхождение — починил).',
            tip: 'kubectl get events задним числом покажет работу контроллеров: почему под пересоздался, кто его удалил, что не даёт запуститься.',
          },
          {
            title: 'Worker nodes: kubelet и kube-proxy',
            text: 'На рабочих нодах: kubelet (локальный «источник истины» о контейнерах ноды: запускает, следит, убивает), container runtime (containerd), kube-proxy (правила сети: iptables/ipvs для Service). Если pod не стартует — состояние тянется у kubelet ноды.',
            code: 'kubectl get nodes\\nkubectl describe node worker-1 | grep -A5 Conditions   # Ready? MemoryPressure? DiskPressure?',
          },
          {
            title: 'Декларативность: желаемое состояние',
            text: 'Вы описываете ЖЕЛАЕМОЕ (манифест: сколько реплик, какой образ), а кластер сам приводит к нему фактическое. Никаких «логинов на ноду и ручного запуска»: правильное лечение — print манифест, а не серым ssh-командам.',
            code: 'kubectl apply -f deployment.yaml\\nkubectl rollout status deployment/app   # дождаться применения',
          },
        ],
      },
      {
        heading: 'Поды: минимальная единица',
        intro: 'Под — «клетка» кластера: один или несколько контейнеров, объединённых общим IP, сетью и томом.',
        items: [
          {
            title: 'Состав пода',
            text: 'Контейнеры пода разделяют сетевой namespace и тома. Основной контейнер + боковые (sidecar: sider proxy, log-shipper, metrics exporter). Плюс init-контейнеры — выполняются до старта основных (подготовка конфига, прогон миграций).',
            code: 'initContainers:\\n  - name: init-migrate\\n    image: app-migrate:1\\n    command: ["sh", "-c", "node migrate.js"]\\ncontainers:\\n  - name: app\\n    image: app:1.2.0',
          },
          {
            title: 'Жизненный цикл пода',
            text: 'Pending (ждёт места/образ) → Running (запущен, если все контейнеры живы) → Succeeded/Failed (терминальный) + фазы повторных попыток: CrashLoopBackOff, ImagePullBackOff, ErrImagePull. Фазы видны в kubectl get pods.',
            code: 'kubectl get pods -o wide\\nkubectl describe pod app-5c8d9f6b7c-x2m4k   # СЕКРЕТНЫЙ ФАЙЛ: события, причины, образы',
            tip: 'kubectl describe pod — половина диагностики: там события (Зачем под не стартует?), последний State (OOMKilled? ExitCode?), а внизу Event-цепочка.',
          },
          {
            title: 'Перезапуски: RestartPolicy и причины',
            text: 'По умолчанию Always: kubelet перезапускает упавший контейнер внутри пода (pod сам остаётся жить, растёт RESTARTS). Посмотреть лог прошлого запуска: kubectl logs --previous. Частые перезапуски = копать ExitCode и события.',
            code: 'kubectl logs app-5c8d9f6b7c-x2m4k --previous   # лог прошлого запуска\\nkubectl get pods | grep -c 0/1',
          },
        ],
      },
      {
        heading: 'Контроллеры: кто управляет подами',
        intro: 'Поды руками не трогают — ими управляют контроллеры, которые следят за желаемым числом реплик.',
        items: [
          {
            title: 'Deployment: стандарт сервисов',
            text: 'Deployment описывает образ, реплики, стратегию обновления (RollingUpdate: постепенная замена, maxUnavailable/maxSurge) и создаёт ReplicaSet (наблюдатель за числом подов). Откат: kubectl rollout undo. Историю накатов хранит сам.',
            code: 'kubectl rollout status deployment/app\\nkubectl rollout history deployment/app\\nkubectl rollout undo deployment/app   # откат на прошлый revision',
          },
          {
            title: 'Остальная зоология',
            text: 'StatefulSet — стабильные имена и хранилища для БД (db-0, db-1), DaemonSet — под на КАЖДОЙ ноде (node-exporter, логи агентов), Job/CronJob — разовые задачи, Secret/ConfigMap объекты — данные. Выбор контроллера диктует поведение при перезапуске.',
          },
          {
            title: 'StatefulSet: почему «не как Deployment»',
            text: 'БД в Deployment — потеря данных: под пересоздаётся с новым именем и хранилищем. StatefulSet держит стабильные имена (db-0..N), ордер старта и собственный volume на под. Правило дежурного: увидел mysql в Deployment — насторожись.',
          },
        ],
      },
      {
        heading: 'Сеть: Service, Ingress, DNS',
        intro: 'Кластер сам раздаёт IP каждому поду, но они меняются. Для стабильного доступа — Service и Ingress.',
        items: [
          {
            title: 'Service: стабильный адрес',
            text: 'Service — абстракция доступа: ClusterIP (внутренний адрес кластера), NodePort (порт на каждой ноде: 30000-32767), LoadBalancer (внешний балансировщик облака). Селектор ловит поды по labels. Балансировка между подами — kube-proxy.',
            code: 'apiVersion: v1\\nkind: Service\\nmetadata:\\n  name: app\\nspec:\\n  selector:\\n    app: web\\n  ports:\\n    - port: 80\\n      targetPort: 3000\\nkubectl get svc | grep app',
          },
          {
            title: 'Внутренний DNS',
            text: 'Каждый сервис резолвится как <имя>.<namespace>.svc.cluster.local. Внутри кластера обращайтесь по имени сервиса — IP меняются, dns-имя нет. Проверка из пода: nslookup/dig с trial-пода (kubectl run).',
            code: 'kubectl run dns-test --rm -it --image=busybox -- nslookup app.default\\n# как видит под: cat /etc/resolv.conf',
          },
          {
            title: 'Ingress: внешний маршрутизатор',
            text: 'Ingress — маршрутизация HTTP извне в сервисы по hostname/пути: www.example.com/api → backend-prod. Реализует ingress-controller (ingress-nginx, HAProxy). TLS-сертификаты — через Ingress TLS-блок.',
            code: 'apiVersion: networking.k8s.io/v1\\nkind: Ingress\\nmetadata:\\n  name: api-ingress\\nspec:\\n  rules:\\n    - host: api.example.com\\n      http:\\n        paths:\\n          - path: /\\n            pathType: Prefix\\n            backend:\\n              service:\\n                name: app\\n                port:\\n                  number: 80',
          },
        ],
      },
      {
        heading: 'Конфигурация: ConfigMap и Secrets',
        intro: 'Данные и конфиг живут отдельно от кода — так меняются без пересборки образов.',
        items: [
          {
            title: 'ConfigMap',
            text: 'Хранит конфиги (файлы, ключ=значение). Инъекция: env из configMapKeyRef, или mount как файлы. Отсутствующий ConfigMap = поды не стартуют с mount-ошибкой в событиях (распространённая причина CrashLoop!).',
            code: 'apiVersion: v1\\nkind: ConfigMap\\nmetadata:\\n  name: app-config\\ndata:\\n  app.yml: |\\n    log_level: info\\n    db_timeout: 3\\n# использование:\\n# envFrom: [{configMapRef: {name: app-config}}]\\n# volumeMounts: [{name: cfg, mountPath: /etc/app}]',
          },
          {
            title: 'Secrets',
            text: 'Тот же механизм для секретов: base64 в манифесте (не шифрование! просто кодирование). Храните через внешние системы (ExternalSecrets, Vault) или sealed-secrets. Secret в events/describe не светится — это плюс.',
            tipKind: 'warning',
            tip: 'kubectl get secret -o yaml покажет base64: секрет в кластере — не панацея. Идеал: секреты не живут в git вовсе (ExternalSecrets/Vault).',
          },
          {
            title: 'Если ConfigMap не обновился',
            text: 'env-инъекция применяется только при пересоздании пода (rollout restart). Монтированные файлы — при перезапуске контейнера. Классический вопрос «изменил ConfigMap, а приложение старое» → kubectl rollout restart deployment/app.',
            code: 'kubectl rollout restart deployment/app   # поды пересоздадутся с новым конфигом',
          },
        ],
      },
      {
        heading: 'Ресурсы: requests, limits и OOMKilled',
        intro: 'Кластер делит CPU/память по-честному только при заполненных манифестах. Пустые лимиты = сервис-сосед может умереть от вашего пода.',
        items: [
          {
            title: 'requests vs limits',
            text: 'requests — чего жаждет под (scheduler использует для размещения), limits — потолок (kubelet enforce через cgroups). CPU пропускают (throttle) при превышении лимита; память НЕ пропускают: превышение = OOMKilled — контейнер убивают.',
            code: 'resources:\\n  requests:\\n    cpu: 250m\\n    memory: 512Mi\\n  limits:\\n    cpu: 500m\\n    memory: 1Gi',
            tip: 'OOMKilled в статусе пода — память. Трафик почти всегда: утечка в приложении или заниженный limit. Поднимать лимит «до бесконечности» — лечить симптом.',
          },
          {
            title: 'QoS-классы',
            text: 'Кластер судит по requests/limits: Guaranteed (requests == limits — приоритет выживания), Burstable (requests < limits), BestEffort (пусто — убьют первым при нехватке памяти). Для критичных сервисов ставьте Guaranteed.',
            code: 'kubectl get pod app-x -o jsonpath=\'{.status.qosClass}\'\\n# Guaranteed | Burstable | BestEffort',
          },
          {
            title: 'Pods hung: Pending',
            text: '«Все поды Pending» — scheduler не нашёл места: смотрите события (Unschedulable: insufficient cpu/memory), taints на нодах, requests в манифесте. Не ищите на других нодах «руками» — это планировщик, его сообщения и есть диагноз.',
            code: 'kubectl describe pod app-x | grep -A5 Events\\nkubectl describe node worker-1 | grep -A8 "Allocated resources"',
          },
        ],
      },
      {
        heading: 'Probes: liveness, readiness, startup',
        intro: 'Кластер должен знать, когда под «жив» и когда «готов принимать трафик». Про-поверки — то, что крутит kubelet.',
        items: [
          {
            title: 'liveness vs readiness',
            text: 'livenessProbe — перезапуск подa при падении (смерть сервиса). readinessProbe — временное выведение из ротации (например, прогревается кэш, хотя процесс жив). Упал readiness — под жив, но трафик не идёт: пользователи «в ступоре» при живом процессе!',
            code: 'livenessProbe:\\n  httpGet:\\n    path: /health\\n    port: 8080\\n  initialDelaySeconds: 5\\n  periodSeconds: 10\\nreadinessProbe:\\n  httpGet:\\n    path: /ready\\n    port: 8080',
            tip: '«Поды Running, здоровые, но 502» — классика: readiness упал, а liveness не настроен. Смотрите kubectl describe → Conditions → Ready=false и читайте readinessProbe.',
          },
          {
            title: 'startupProbe: спаситель медленных стартов',
            text: 'Для приложений, прогревающихся 1-2 минуты (JVM!): startupProbe защищает от цикла «liveness убил до готовности». Касается больших сервисов на старте.',
          },
          {
            title: 'Как проверить probe вручную',
            text: 'Цели probes — URL изнутри контейнера. Воспроизведите вручную: kubectl exec -it <pod> -- curl -sf http://localhost:8080/health. Не отвечает изнутри — probe и падает; ответил — probe настроен криво.',
          },
        ],
      },
      {
        heading: 'kubectl: главные команды',
        intro: 'Весь инструментарий дежурного в 10 командах.',
        items: [
          {
            title: 'Отчёт по кластеру',
            text: 'kubectl get nodes (ноды и статус), get pods -A (все поды во всех namespace, -o wide — IP и нода), get svc, get ingress, get events (сортировкой по времени). Цветовая индикация: Pending/CrashLoop/ImagePull — сразу видно больное.',
            code: 'kubectl get pods -A -o wide\\nkubectl get events --sort-by=.lastTimestamp | tail -15\\nkubectl get nodes -o wide',
          },
          {
            title: 'Глубокое погружение',
            text: 'describe (события и детали), logs/--previous (логи подов), exec (оболочка внутри), top nodes/pods (применение ресурсов), edit (быстрая правка манифеста в vi), apply/delete (применение/удаление), rollout (деплои и откаты).',
            code: 'kubectl describe pod app-x | tail -30\\nkubectl logs -f deployment/app\\nkubectl top pods -A',
          },
        ],
      },
      {
        heading: 'Рецепт: расследование CrashLoopBackOff',
        ordered: true,
        intro: 'Под перезапускается по кругу — самый частый k8s-инцидент. Алгоритм Елены из K8s Core.',
        items: [
          {
            title: 'Зафиксировать фазу и состояние',
            text: 'kubectl get pods: статус 0/1 CrashLoopBackOff; kubectl describe pod <name> → последний State (ExitCode, OOMKilled) + Events (причины нестарта: mount error, image pull, probe fail).',
            code: 'kubectl get pods -A | grep -v Running\\nkubectl describe pod <name> | tail -40',
          },
          {
            title: 'Логи: первый и прошлый запуск',
            text: 'kubectl logs <pod> (текущий) и kubectl logs --previous (упавший). Стек-трейс читайте от ПЕРВОЙ причины (верх), не от последней строки. Пустые логи = процесс не успел стартовать или не пишет в stdout.',
            code: 'kubectl logs <pod> --previous\\nkubectl logs <pod> --tail=100 --timestamps',
          },
          {
            title: 'Три классические причины',
            text: '1) Отсутствующий ConfigMap/Secret (events: MountVolume... failed, container will not be started). 2) Кривая команда/путь в image (errors на исполнении). 3) OOMKilled — лимит памяти. Также: readiness/liveness-фейл после старта (startup медленный).',
          },
          {
            title: 'Проверяем здоровье изнутри',
            text: 'kubectl exec -it <pod> -- sh: проверить руками команду точки входа, наличие файлов, подключения. Сравните с тем, что в манифесте: образ, env, mounts.',
          },
          {
            title: 'Лечим манифест, а не под',
            text: 'Правка: kubectl edit deployment / правка YAML в репо + apply. Помнить: ручное «под пересоздан» — не лечение; контроллер всё равно вернёт желаемое состояние. Диагноз улетел в постмортем.',
          },
        ],
      },
    ],
  },
  {
    id: 'observability-peak',
    title: 'Мониторинг и Observability',
    icon: '📊',
    zone: 'Observability Peak',
    color: '#c084fc',
    summary:
      'Без наблюдения система слепа: вы не узнаете об инциденте до крика пользователей. Наблюдаемость (observability) — метрики Prometheus, запросы PromQL, дашборды Grafana, логи Loki и алерты Alertmanager. Здесь разбираем и три столпа, и конкретные запросы.',
    tags: ['Метрики', 'PromQL', 'Grafana', 'Loki/LogQL', 'Алерты', 'SLO'],
    sections: [
      {
        heading: 'Три столпа наблюдаемости',
        intro: 'Понятие №1 в индустрии. Знайте различия — и поймёте, почему в инциденте смотрят именно метрики, а не логи.',
        items: [
          {
            title: 'Метрики (Prometheus)',
            text: 'Числа во времени: количество запросов, задержки, загрузка CPU. Сжимаемы и хранятся долго (TSDB). Отвечают на вопрос «ЧТО происходит?» — быстро: RPS упал → инцидент найден за секунды.',
          },
          {
            title: 'Логи (Loki/ELK)',
            text: 'События и сообщения: стектрейсы, ошибки, request-детали. Полные, но тяжёлые в хранении. Отвечают на «ПОЧЕМУ?» — после того как метрики указали на сервис, логи раскрывают причину.',
          },
          {
            title: 'Трейсы (Tempo/Jaeger)',
            text: 'Прохождение одного запроса по всем сервисам: где он застревал (время в каждом hop). Отвечают на «ГДЕ именно?» при распределённых вызовах. Связка распределённого трафика без трейсинга — детективный сериал без улик.',
          },
          {
            title: 'Корреляция — король',
            text: 'Лучший инструмент дежурного — единая точка входа: Grafana с метриками около кнопки «логи по этому сервису», ссылки на трейс из алерта. Настройте корреляцию заранее — в инциденте сэкономите 10 минут на каждом переходе.',
          },
        ],
      },
      {
        heading: 'Метрики и их типы',
        intro: 'Prometheus хранит временные ряды: метрика + набор подписей-лейблов. Понимание типов — база для написания PromQL.',
        items: [
          {
            title: 'Четыре типа метрик',
            text: 'Counter — накопительный счётчик, только растёт (http_requests_total). Gauge — значение, которое колеблется (температура, очередь). Histogram — распределение наблюдений по бакетам (время запросов, размеры). Summary — похоже на гистограмму, но квант или исчисляется на клиенте.',
            code: '# counter: запросы к nginx\\nhttp_requests_total{job="nginx", status="200"}\\n# gauge: температура ЦП\\nnode_cpu_seconds_total{mode="idle"}\\n# histogram: время ответов\\nhttp_request_duration_seconds_bucket{le="0.1"}',
          },
          {
            title: 'Labels: правая рука и главный враг',
            text: 'Ряд = имя метрики + набор labels. Выгодно: фильтруем по сервису/региону/коду. Опасно: label со случайными значениями (request_id, user_id, pod-имя при множестве подов) плодит тысячи рядов — TSDB захлёбывается, запросы тормозят, дашборды «горят». Это называется высокое cardinальность.',
            tipKind: 'warning',
            tip: 'Кардинальность бездны: label со 100k значений = 100k рядов на одну метрику. Увидели «слоу мониторинг» — ищите мусорные labels в экспортерах и приложениях.',
          },
          {
            title: 'Как считать в метриках правильно',
            text: 'Счётчики всегда оборачиваются в rate()/increase() на интервале. Сырое значение counter на дашборде — почти всегда ошибка (оно бесконечно растёт). Правильно: rate(http_requests_total[5m]) — запросов в секунду за окно 5 минут.',
            code: 'rate(http_requests_total[5m])\\nincrease(http_requests_total[1h])   # сколько было за час',
          },
          {
            title: 'up и классика первого взгляда',
            text: 'Метрика up{job=...,instance=...} — 1 если таргет отдал метрики, 0 если нет. up == 0 — самый быстрый детектор мёртвых целей. Запрос, который стоит в начале любой диагностики: что вообще стреляет.',
            code: 'up == 0\\ncount by (job) (up == 0)   # сколько целей умерло по сервисам',
          },
        ],
      },
      {
        heading: 'Prometheus: как он собирает данные',
        intro: 'Понять архитектуру — значит научиться отвечать на «почему нет метрик».',
        items: [
          {
            title: 'Pull-модель',
            text: 'Prometheus САМ ходит на /metrics каждой цели (job), по расписанию scrape_interval. Цели задаются в конфиге (static_configs) или обнаруживаются автоматически (discovery: k8s, consul, ec2). График добычи смотрим в Targets UI по job.',
            code: 'scrape_configs:\\n  - job_name: node\\n    static_configs:\\n      - targets: ["10.0.1.2:9100", "10.0.1.3:9100"]\\n# K8s: kubernetes_sd_configs забирают поды с портами из аннотаций',
          },
          {
            title: 'Нет метрик? Три пункта',
            text: '1) Доступен ли таргет по HTTP: curl http://10.0.1.2:9100/metrics. 2) Видит ли его конфиг (targets → state в UI Prometheus). 3) Резолвится ли имя (DNS) и открыт ли порт. Быстрее проходит «от метрики к источнику», чем «от теории к метрике».',
            code: 'curl -sf http://10.0.1.2:9100/metrics | head\\n# График targets: http://prometheus:9090/targets',
          },
          {
            title: 'Хранение и ретенция',
            text: 'TSDB пишет в собственный каталог, ретенция по умолчанию 15 дней (--storage.tsdb.retention.time). Для длинного хранения — Thanos/другие стойки. Забудьте «а почему у нас только 2 недели истории» — это настройка, а не баг.',
          },
        ],
      },
      {
        heading: 'PromQL: язык запросов',
        intro: 'Главный навык на Obs Peak: написать запрос, который отвечает именно на ваш вопрос. Не заучивайте — поймите примитивы.',
        items: [
          {
            title: 'Селекторы и фильтры',
            text: 'metric{label="value"} — выбор ряда. Фильтры: =, !=, =~ (регэксп), !~. Примеры: http_requests_total{status=~"5.."} — все 5xx. Множественные лейблы соединяются запятой. Пустые фигурные скобки можно опускать.',
            code: 'http_requests_total{job="api", status!="200"}\\nnode_filesystem_avail_bytes{fstype=~"ext4|xfs"}',
          },
          {
            title: 'Агрегации: sum by / avg by',
            text: 'sum by (job) (expr) — суммируем по выбранным лейблам; avg by, max by, count by — аналогично. По умолчанию (без by) — сумма по всем лейблам (итог). Типичная ошибка новичка: запрос вернул 1000 рядов вместо одного — забыть by().',
            code: 'sum by (job) (rate(http_requests_total[5m]))\\navg by (instance) (node_load1)\\ncount by (severity) (alerting_rule{} or vector(0))',
          },
          {
            title: 'rate vs irate vs increase',
            text: 'rate(x[5m]) — усреднённая скорость за окно (стабильна, для алертов). irate(x[5m]) — мгновенная скорость на последних двух точках (резкая, для графиков с пиками). increase(x[5m]) — суммарный прирост за окно. Для «почему кругом spike» — irate.',
            code: 'rate(http_requests_total[5m])\\nirate(http_requests_total[5m])\\nincrease(errors_total[1h])',
          },
          {
            title: 'histogram_quantile: p99 своими руками',
            text: 'По гистограмме (bucket-рядам) считаем квантили: запросы «99% помещаются в X». Классика: p99 API-задержки. Формула всегда с sum by (le) внутри.',
            code: 'histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))\\n# p50/p95/p99 в одну панель через та же формула с разными процентилями',
          },
          {
            title: 'Ещё немного функций',
            text: 'topk(5, expr) — топ-5 худших; avg_over_time(expr[1h]) — среднее за окно; absent(metric) — 1 если метрика пропала (сигнал «тишины» — алерт на пропажу); label_replace — переименовать лейблы; clamp_min — срезать. Для ответа «нет данных» используйте отсутствие и absent().',
            code: 'topk(5, rate(http_requests_total[5m]))\\navg_over_time(node_memory_MemFree_bytes[30m])\\nabsent(up{job="node"})',
          },
        ],
      },
      {
        heading: 'Grafana: дашборды и панели',
        intro: 'Grafana — витрина метрик: запросы PromQL становятся графиками, у каждого сервиса свой раздел.',
        items: [
          {
            title: 'Структура: датасорс → панель → дашборд',
            text: 'Datasource (Prometheus, Loki), панель (запрос + тип: график времени, таблица, stats, stat), дашборд (набор панелей с переменными). Переменные ($service, $instance) превращают дашборд в инструмент из многих страниц: переключили сервис — пересмотрели всё.',
            code: '// переменная:\nlabel_values(http_requests_total, job)\\n// панель с переменной:\\nsum by (instance) (rate(http_requests_total{job=\"$service\"}[5m]))',
          },
          {
            title: 'Типы панелей',
            text: 'Time series — график по времени. Stat — одно большое число (RPS, SLA). Gauge — спидометр. Table — таблица. Heatmap — гистограмма по времени (p99 визуально). Bar gauge — сравнение. Правильный тип панели = ответ на вопрос без объяснений.',
          },
          {
            title: 'Правила дашбординга',
            text: 'Один вопрос — одна панель. Подписи с единицами измерения. Алерт-аннотации на графике (где что упало). «Дашборд без единиц — демо-стэнд» (максимально полезно: просмотр 30 секунд должен дать диагноз).',
          },
        ],
      },
      {
        heading: 'Loki и LogQL: логи в масштабе',
        intro: 'Прометей считает, Loki хранит. Связка: метрики сказали «когда», Loki — «почему».',
        items: [
          {
            title: 'Как устроен Loki',
            text: 'Логи обогащаются лейблами (job, pod, namespace) — их немного, но на каждый «чей-то лог» идёт поиск. Запросы пишутся в LogQL — язык, похожий на PromQL для логов. Отличие от Elastic: Loki не индексирует содержимое, только лейблы (дешевле хранить, но фильтр по тексту дороже).',
          },
          {
            title: 'Базовые запросы LogQL',
            text: '{лейблы} — выборка потоков. Фильтры: |= "строка" (содержит), |~ "regex", != "исключить". Отчёт: |= "ERROR" | json — распарсить JSON-логи, фильтровать по полю (| json field=error, следующий фильтр уровня).',
            code: '{job="nginx"} |= "ERROR" | json | level != "debug"\\n{namespace="prod"} |~ "TimeoutException|Connection reset"\\n{job="app"} | logfmt | duration_ms > 1000',
          },
          {
            title: 'Метрики из логов',
            text: 'Логи можно «превращать» в метрики на лету: count_over_time({job="nginx"} |= "502" [5m]) — количество 502 за окно. Полезно, когда нужная метрика не выставляется, а живёт только в логах.',
            code: 'sum by (namespace) (count_over_time({namespace=~"prod.*"} |= "OOMKilled" [10m]))',
          },
          {
            title: 'Связка метрика → лог',
            text: 'Алерт по метрике должен вести к логам: аннотация с LogQL-ссылкой по сервису/инстансу. Классический workflow: алерт → метрика → лог → трейс → фикс.',
          },
        ],
      },
      {
        heading: 'Алерты и Alertmanager',
        intro: 'График не позвонит вам ночью — алерт должен. Здесь про культуру и механику.',
        items: [
          {
            title: 'Как создаётся алерт',
            text: 'Правило в Prometheus: expr (условие), for (продолжительность до срабатывания), labels/annotations (контекст для человека). Иннициалы: for упорядочивает вспышки; annotations должны содержать «что делать» — ссылки на runbook.',
            code: 'groups:\\n  - name: api\\n    rules:\\n      - alert: ApiHighErrorRate\\n        expr: sum by (job) (rate(http_requests_total{status=~"5.."}[5m])) / sum by (job) (rate(http_requests_total[5m])) > 0.05\\n        for: 5m\\n        labels:\\n          severity: page\\n        annotations:\\n          summary: "API 5xx {{ $value | humanizePercentage }}"\\n          runbook: "https://ops.example.com/runbook/502"',
          },
          {
            title: 'Alertmanager: маршрутизация',
            text: 'Принимает алерты и решает, кому слать: маршруты по labels (severity: page → телефон, warning → slack), grouping (объединение пачек одинаковых), ингибирование (при severity=page замолкают нижние), silence (административная тишина на легальный период) из UI/amtool.',
            code: 'route:\\n  group_by: ["alertname", "job"]\\n  group_wait: 30s\\n  group_interval: 5m\\n  repeat_interval: 4h\\n  routes:\\n    - matchers: [severity = page]\\n      receiver: page\\nreceivers:\\n  - name: page\\n    webhook_configs:\\n      - url: http://opsbot:8080/hooks/pager',
          },
          {
            title: 'Культура алертов: меньше стрью, больше смысла',
            text: 'Правило «алерт должен вести к действию»: paging только для того, что требует вмешательства человека (P1/P2). Остальное — тихие предупреждения. Алерт, на который никто не реагирует, умирает: либо fix, либо silence, но не «никогда не смотрим».',
          },
        ],
      },
      {
        heading: 'SLO/SLI/SLA и Golden Signals',
        intro: 'Язык бизнеса и дежурных: чтобы понимать, когда сервис «достаточно хорош», нужны числовые договорённости.',
        items: [
          {
            title: 'Термины',
            text: 'SLI — измеряемый показатель (например, доля успешных запросов). SLO — целевой порог SLI (99.9% за 30 дней). SLA — договор с клиентом (юридически). SLO — ваша внутренняя честная цель, SLA — публичное обещание.',
          },
          {
            title: 'Error budget',
            text: 'Разница 100% − SLO = запас ошибок. При 99.9% за 30 дней допустимо ~43 минуты простоя. Пока budget не исчерпан — релизы можно выкатывать; исчерпан — стоп-линия и восстановление приоритезируется. (Звучит банально, но это целая философия Google SRE.)',
            code: '// SLO-запрос: доля 5xx/всех за 30 дней\\n1 - (sum(rate(http_requests_total{status=~"5.."}[30d])) / sum(rate(http_requests_total[30d])))\\n// чем больше 1-smth, тем ближе ошибки к красной зоне',
          },
          {
            title: 'Golden Signals',
            text: 'Четыре главных сигнала сервиса: Latency (задержка, p50/p95/p99), Traffic (RPS), Errors (доля ошибок), Saturation (занятость ресурса: CPU, очередь, пороги). Дашборд «здоровье» из них — универсальная стартовая страница для любого сервиса.',
          },
        ],
      },
    ],
  },
  {
    id: 'cloud-valley',
    title: 'Cloud & Infrastructure as Code',
    icon: '☁️',
    zone: 'Cloud Valley & IaC',
    color: '#f472b6',
    summary:
      'Инфраструктура как код (IaC) — описание серверов, сетей и баз в репозитории, а не в консоли облака. Terraform строит облако из чертежей, Ansible настраивает серверы. Консоль облака — враг идемпотентности: ручные правки ломают state — вот почему это тема дежурных.',
    tags: ['Облака', 'Terraform', 'State', 'Ansible', 'Playbooks', 'Идемпотентность'],
    sections: [
      {
        heading: 'Облака и модели',
        intro: 'Без контекста «что такое облако» половина терминов IaC будет пустой. Кратко — но основательно.',
        items: [
          {
            title: 'Что такое облако',
            text: 'Чужое оборудование по подписке: вычислительные мощности, сети, хранилища, базы как API. Провайдеры: AWS, GCP, Azure, Yandex Cloud и др. Внутри: регионы (география), зоны доступности (availability zones, AZ) — физически отдельные дата-центры.',
          },
          {
            title: 'Модели обслуживания',
            text: 'IaaS — виртуальные машины, сети, диски (полный контроль, сами всё настраиваете). PaaS — платформа: деплой кода, а платформа рулит запуском (App Engine, Render, Fly). SaaS — готовое приложение (Slack, Grafana Cloud). Для IaC чаще всего работаем с IaaS + управляемым всем.',
          },
          {
            title: 'Ресурсы облака — единые API',
            text: 'Сервер = instance, сеть = VPC/subnets/security groups, хранилище = S3/object storage, база = managed DB. У каждого ресурса есть ИД (ID) и состояние. Идея IaC: этот ID и состояние описываются файлами, а не памятью инженера.',
          },
        ],
      },
      {
        heading: 'Что такое IaC и почему без него ад',
        intro: '«Настрою сам на сервере» — приемлемо для стенда в 2 машины и невыносимо для 200. Всё ниже — почему.',
        items: [
          {
            title: 'Декларативное vs императивное',
            text: 'Императив: «выполни по шагам: создай VM, настрой сеть...». Декларатив: «вот ЖЕЛАЕМОЕ состояние — ресурс вот такой». Terraform декларативен: вы описали конечный образ, он сам вычислил шаги до него и применил. Перезапуск ничего не ломает — результат одинаков.',
            code: '# terraform: объявили, а не «выполнили»\\nresource "aws_instance" "web" {\\n  ami           = "ami-0c55b159cbfafe1f0"\\n  instance_type = "t3.micro"\\n}\\n# terraform apply сам: создал → настроил → подтвердил',
          },
          {
            title: 'Идемпотентность',
            text: 'Идемпотентная операция — повторное применение даёт тот же результат (stdout один и тот же: никаких «второй раз — двойная база»). Это фундамент: пайплайны, откаты, восстановление после сбоев воспроизводятся без «ручного». Всё, что делает IaC, должно быть идемпотентно.',
            tip: 'Проверочный вопрос дежурного: запущу это дважды — будет то же самое? Если нет — код не идемпотентен: он ваш будущий инцидент.',
          },
          {
            title: 'GitOps и review',
            text: 'Инфраструктура — в git: PR, ревью, теги, откат те же, что у кода. «Кто удалил security group?» отвечается git log, а не допросами. CI применяет IaC автоматически (или по approve — безопаснее).',
          },
        ],
      },
      {
        heading: 'Terraform: жизнь ресурса',
        intro: 'Сердце IaC. Разберём стандартный цикл: init → plan → apply, и state — «мозг» Terraform.',
        items: [
          {
            title: 'init → plan → apply → destroy',
            text: 'init — скачать провайдеров и модули. plan — вычислить дифф между кодом и реальностью (БЕЗ изменений!). apply — применить план. destroy — удалить всё. План — самый важный шаг: вы всегда знаете, что terraform «сломает», до того как он это сделает.',
            code: 'terraform init\\nterraform plan -out=tfplan\\nterraform apply tfplan\\nterraform destroy   # осторожно — это реальные ресурсы!',
            tipKind: 'warning',
            tip: 'plan покажет «delete/replace» ресурса — это потенциальный даунтайм. Читайте дифф целиком, особенно значки [destroy]/[create-before-destroy]: они стоят денег и нервов.',
          },
          {
            title: 'State: «мозг» Terraform',
            text: 'tfstate хранит маппинг: код-ресурс ↔ ID в облаке. Локальный state = tfstate файл рядом. Открытие без state: terraform «не узнает» существующие ресурсы (создаст заново — или упадёт на duplicate). Отсюда правило: state — источник истины и его нельзя терять.',
            code: 'terraform state list\\nterraform state show aws_instance.web',
          },
          {
            title: 'Remote state и блокировки',
            text: 'State в облаке: S3 (бакет) + DynamoDB (lock). Зачем: 1) не теряется с ноутбука, 2) блокировка — два инженера не примут apply одновременно (иначе расхождение!). Локальный state + два инженера = будущая авария.',
            code: 'backend "s3" {\\n  bucket         = "my-tf-state"\\n  key            = "prod/network.tfstate"\\n  region         = "eu-central-1"\\n  dynamodb_table = "tf-locks"\\n  encrypt        = true\\n}',
            tipKind: 'warning',
            tip: 'Параллельные apply без блокировки — два процесса пишут state, второй перезаписывает первый, половина ресурсов «несуществующая». Блокировка — не роскошь.',
          },
          {
            title: 'Что делает apply «больно»',
            text: '«Re-creation» ресурса по причине изменения name/аргументов (некоторые атрибуты неизменяемы: name инстанса, security group name). «Drift» — ручная правка в консоли делает state неполным (разъехались код и реальность). Для управления: terraform import / state mv / state rm.',
            code: 'terraform import aws_instance.web i-1234567890\\nterraform state mv aws_instance.web aws_instance.web2\\nterraform state rm aws_instance.old   # перестать управлять ресурсом (не удаляет его!)',
          },
        ],
      },
      {
        heading: 'Modules и переменные',
        intro: 'Пишем инфраструктуру без повторов — модули и переменные делают код чистым и переиспользуемым.',
        items: [
          {
            title: 'Переменные и outputs',
            text: 'input-переменные (variables.tf) — параметры: регион, размеры, окружение. output — вывести значения (IP, ID) для использования снаружи или в других модулях. tfvars-файлы — значения по окружениям (dev.tfvars, prod.tfvars).',
            code: 'variable "instance_type" {\\n  default = "t3.micro"\\n  description = "Тип виртуальной машины"\\n}\\n\\noutput "web_ip" {\\n  value = aws_instance.web.public_ip\\n}\\n# terraform apply -var-file=prod.tfvars',
          },
          {
            title: 'Модули: библиотека инфраструктуры',
            text: 'Модуль — папка с terraform-кодом (main.tf, variables, outputs), вызывается с параметрами. Один раз написали vpc-module, используем в каждом окружении. Источник — локальная папка, git, registry. Чем меньше дубликация, тем меньше расходящихся правок.',
            code: 'module "vpc" {\\n  source = "terraform-aws-modules/vpc/aws"\\n  version = "5.0.0"\\n  name = "prod"\\n  cidr = "10.0.0.0/16"\\n\\n  azs             = ["eu-central-1a", "eu-central-1b"]\\n  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]\\n  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]\\n}',
          },
          {
            title: 'for_each и count',
            text: 'Массовое создание ресурсов: count — по числу (индекс), for_each — по map/set (численные имена красноречивее). Правильно используемый for_each убирает тонны копипасты и связанных дрейфов.',
            code: 'resource "aws_security_group_rule" "ingress" {\\n  for_each = toset([\"80\", \"443\", \"5432\"])\\n  type      = "ingress"\\n  from_port = each.value\\n  to_port   = each.value\\n  ...\\n}',
          },
        ],
      },
      {
        heading: 'Ansible: настройка без агентов',
        intro: 'Terraform создаёт облако, Ansible настраивает серверы: пакеты, файлы, юниты, пользователи.',
        items: [
          {
            title: 'Безагентная модель',
            text: 'Ansible подключается по SSH и выполняет задачи на лету (push). Не нужно ставить демона на каждой машине — только Python. Инвентарь — список хостов и групп: inventory.yaml. Проверка связи: ansible all -m ping.',
            code: '# inventory.yml\\n[webservers]\\nweb1 ansible_host=10.0.1.2\\nweb2 ansible_host=10.0.1.3\\n\\n[databases]\\ndb1 ansible_host=10.0.1.4\\n# запуск: ansible -i inventory.yml webservers -m ping',
          },
          {
            title: 'Playbook: сценарий действий',
            text: 'Playbook — YAML: игра (play) = на какие хосты, какие модули (tasks). Модули — идемпотентные «функции»: package, service, copy, template, command. Декларативно: state=present (желаемое), а не «выполни apt-get».',
            code: '---\\n- name: Настроить веб-сервер\\n  hosts: webservers\\n  become: true\\n  tasks:\\n    - name: Установить nginx\\n      ansible.builtin.package:\\n        name: nginx\\n        state: present\\n    - name: Запустить сервис\\n      ansible.builtin.service:\\n        name: nginx\\n        state: started\\n        enabled: true\\n    - name: Скопировать конфиг\\n      ansible.builtin.template:\\n        src: nginx.conf.j2\\n        dest: /etc/nginx/nginx.conf\\n      notify: reload nginx\\n  handlers:\\n    - name: reload nginx\\n      ansible.builtin.service:\\n        name: nginx\\n        state: reloaded',
          },
          {
            title: 'Handlers и их магия',
            text: 'Handler срабатывает только если задача реально изменила состояние (changed) — не на каждый прогон. Типично: «скопировал конфиг → перезагрузил сервис». Без handler будете перезапускать сервис на каждом прогоне (плохо для проде).',
          },
          {
            title: 'Check mode и dry-run',
            text: 'ansible-playbook --check --diff — показать, что СБУДЕТСЯ, ничего не меняя. Обязательный ритуал перед плейбуком на боевых: ловите неожиданные изменения заранее.',
            code: 'ansible-playbook -i inventory.yml site.yml --check --diff',
          },
        ],
      },
      {
        heading: 'State drift и типовые ошибки',
        intro: 'Главная боль IaC-дежурного: реальность разошлась с кодом. Вот типика и как с ней жить.',
        items: [
          {
            title: 'Что такое drift',
            text: 'Drift — когда ресурсы в облаке отличаются от описания в коде (ручная правка консоли, чужой скрипт, авто-масштабирование легаси). Симптомы: plan показывает изменения «которых не делали», ресурсы «замечены» в state хотя в коде нет.',
          },
          {
            title: 'Почему drift опасен',
            text: '1) apply внезапно пересоздаст ресурс с правильным кодом — даунтайм, потому что ручная правка потеряется. 2) Идемпотентность ломается: повторные прогоны вариативны. 3) Аудит: команда не верит инфраструктуре.',
          },
          {
            title: 'Как бороться',
            text: 'import — захватить существующий ресурс в управление (не создавать копию!). refresh (устарел в новых версиях — работает сам при plan). Автоматические проверки drift (driftctl/или plan в CI). И главное — правило: «в консоль не ходим, всё через PR».',
            code: 'terraform import aws_security_group.web sg-0f3a1b2c\\nterraform plan   # теперь код и реальность совпадают, план пустой',
          },
          {
            title: 'Ошибки-напарники',
            text: 'Потерянный state при смене бэкенда (пропустили миграцию). create_before_destroy без необходимости (двойной ресурс во время apply). Разные версии Terraform у команды (state-форматы эволюционируют). Подпись: «plan у всех разный» — выравнивайте версии.',
          },
        ],
      },
    ],
  },
  {
    id: 'incident-war-room',
    title: 'Инциденты и Траблшутинг',
    icon: '🚨',
    zone: 'Incident War Room',
    color: '#f87171',
    summary:
      'Война-комната — сердце дежурства: аварии, тайминги, эскалации, постмортемы. Здесь не про команды — про методику: как расследовать инцидент, кому звонить, когда эскалировать и как превращать аварию в улучшение системы, а не в охоту на виновных.',
    tags: ['Процессы', 'Эскалация', 'Runbook', 'Постмортем', 'P1/P2', 'Методика'],
    sections: [
      {
        heading: 'Что такое инцидент',
        intro: 'Не всякая проблема — инцидент. Чёткое определение помогает не дёргаться на мелочи и не пропустить большое.',
        items: [
          {
            title: 'Инцидент = влияние на пользователей/бизнес',
            text: 'Определение: нарушение доступности, целостности или производительности сервиса, которое заметили извне. Упал упавший тестовый под — не инцидент (никто не заметил). Упал прод-API — инцидент. Определение важно: запускает процессы (эскалации, коммуникация, постмортем).',
          },
          {
            title: 'Severity: P1–P4',
            text: 'P1 — прод полностью не работает (даунтайм, потеря данных). P2 — сервис деградирует, есть workaround (медленно, частично). P3 — локальная проблема без влияния (один зоопарк). P4 — косметика. Severity определяет реакцию: кому звонить, когда ждать, какой уровень поста.',
            code: 'P1: 5xx > 50%, даунтайм API, потеря данных\\nP2: латентность x10, деградация, но не даун\\nP3: мелкий баг, не влияет на пользователей\\nP4: косметика и будущие улучшения',
          },
          {
            title: 'Что запускается при инциденте',
            text: 'Канал связи (чат/видео), статус-трекер (тикет с таймлайном), эскалационные цепочки (кто кому звонит), ротация ролей (Commander/лечение), позднее — постмортем. Плохо, когда все эти процессы «на словах»: проговаривайте заранее, а не в дымовой завесе.',
          },
        ],
      },
      {
        heading: 'Жизненный цикл инцидента',
        intro: 'Семь фаз — как у проектов, только быстрая. Каждая фаза имеет свой смысл и выход.',
        items: [
          {
            title: '1. Детект',
            text: 'Алерты мониторинга, жалобы пользователей, «что-то ведёт себя странно». Чем раньше — тем дешевле. Детект забыт? = «мы узнали от клиента». Правило: сначала алерт-сеть, потом всё остальное.',
          },
          {
            title: '2. Триаж: а это правда инцидент?',
            text: '30 секунд на оценку: что пострадало, как широко, как долго, есть ли быстрый фикс. Это отличает опытного дежурного: не хватается за всё, а сначала картину. Не распознали → раздули маленькое.',
          },
          {
            title: '3. Mitigation: сначала стабилизируй',
            text: 'Главная инстинктивная ошибка — «лечить корень» под огнём. Сначала вернуть сервис любым способом: restart, откат деплоя, failover на резерв, отключить сломанную фичу. Root cause — когда огонь потушен.',
            tip: 'Восстановил — НЕ закрывай инцидент сразу: состояние может снова деградировать. Дайте системе «подышать» и наблюдать.',
          },
          {
            title: '4. Root cause: 5 Why',
            text: 'Пять «почему» вглубь: «упал API» → «потому что БД умерла» → «потому что диск заполнен» → «потому что лог-файл разросся» → «потому что нет ротации логов». Корень — конфиг ротации, а не «API». Root cause всегда дальше первого симптома.',
          },
          {
            title: '5. Prevention & Postmortem',
            text: 'Из инцидента рождаются действия: алерт на ротацию логов, лимит размера лога, runbook по восстановлению БД. Каждое действие — с владельцем и сроком, иначе постмортем — бумажка. Декларируйте: «мы не ищем виноватых, мы ищем систему, которая позволила аварии пройти» (blame-free).',
          },
        ],
      },
      {
        heading: 'Роли в инциденте',
        intro: 'Два-три человека в аварии без ролей = хаос: все лечат, никто не координирует, никто не говорит акционерам.',
        items: [
          {
            title: 'Incident Commander (IC)',
            text: 'Один человек: владеет процессом. Не лечит сам, а назначает исполнителей, следит за таймингом, решает эскалировать или нет. Смена IC — только при эскалации up. У командира одна задача — держать процесс, а не клавиатуру.',
          },
          {
            title: 'Scribe / Таймкипер',
            text: 'Фиксирует таймлайн: 14:02 — алерт, 14:05 — диагноз диск, 14:12 — чистка. Таймлайн потом превращается в постмортем — без него восстановление «как-то так» ничего не даёт.',
            tip: 'Пишем таймлайн, даже когда кажется «и так всё ясно». Постмортем без фактов — художественная литература.',
          },
          {
            title: 'Communication Lead',
            text: 'Информирует заинтересованных: внутренний чат (по 5-минутному расписанию or при изменениях), тикет, статус-старницы, руководителя. Внешние коммюнике (клиенты) — только по регламенту компании, не на ходу.',
          },
        ],
      },
      {
        heading: 'Эскалация: когда и кому',
        intro: 'Эскалация — не признание слабости, а управление риском. Поздняя эскалация — типичная ошибка junior.',
        items: [
          {
            title: 'Правила эскалации',
            text: 'Истекло время (15–30 мин) — эскалируйте, даже если «ещё чуть-чуть». Операция затронула данные/деньги/престиж — эскалируйте сразу (выполнение должно решаться на уровне, который может решить). Не знаете, кто нужен? Эскалируйте техническому лиду/старшему дежурному — найдут.',
          },
          {
            title: '80/20: где проходить границу',
            text: 'Вы работали 20 минут, у вас всё ещё только гипотезы, а влияние растёт — это момент эскалации. Опыт дежурного зреет именно в этой точке: вовремя переданный инцидент ведёт к быстрому фиксу без «геройства».',
          },
        ],
      },
      {
        heading: 'Runbook: аварийное руководство',
        intro: 'Проверенный сценарий действий на каждый типовой случай. Лучший runbook — тот, по которому стажёр чинит инцидент без паники.',
        items: [
          {
            title: 'Структура runbook',
            text: 'Симптом (как распознать): 502 на всех страницах. Диагностика: nginx error.log, ss, curl. Шаги устранения: по порядку с командами. Проверка: что должно стать ок. Откат: если не помогло. Эскалация: кому звонить.',
          },
          {
            title: 'Почему runbook — живой документ',
            text: 'После каждого инцидента сверьте: «шаги из runbook привели бы к этому диагностическому пути?». Нет — допишите. Runbook, не обновлённый за год, — это страшная сказка: доверены, а он врёт.',
          },
          {
            title: 'Что писать в первые 5 минут',
            text: 'Хук: «Что за ошибка?» → «Где смотреть» → «Первые 3 команды». Шаблон: статус сервиса (systemctl/docker ps), логи (journalctl/tail), метрики (df/top). Первые 5 минут = то, что спасает руки новичка.',
          },
        ],
      },
      {
        heading: 'Постмортем: культура без обвинений',
        intro: 'Финальный аккорд инцидента: разбор, действия, обучение. Идеология Google SRE — blame-free.',
        items: [
          {
            title: 'Зачем и для кого',
            text: 'Не для наказания — для обучения и предотвращения. Читается командой: «что не так с системой, что одну ошибку не поймали». Каждый P1/P2 — постмортем в течение недели.',
          },
          {
            title: 'Структура постмортема',
            text: 'Резюме, таймлайн (факты!), влияние (SLA, бюджет ошибок), root cause (5 Why), действия (с владельцами и сроками), «что сработало хорошо» / «что улучшить». Действия без даты — пожелания.',
          },
          {
            title: '5 правил blame-free',
            text: '1) Ищем систему, не людей. 2) Не «кто виноват», а «какая грань системы позволила». 3) Действия на систему: алерты, лимиты, автоматизация. 4) Никаких «будь внимательнее» в плане действий. 5) Учим на примере, а не показательно караем.',
          },
          {
            title: 'Из постмортема — в алерты',
            text: 'В идеале каждый инцидент рождает хотя бы один новый алерт, который бы поймал его раньше. «Мониторинг бы не заметил это» — не фраза, а пункт плана действий.',
          },
        ],
      },
      {
        heading: 'Рецепт: диск 100% на сервере',
        ordered: true,
        intro: 'Самый частый P1 по статистике. За 10 минут — от алерта до пользователя снова в онлайне.',
        items: [
          {
            title: 'Подтвердить и оценить',
            text: 'df -h (какая ФС полна), df -i (вдруг inode). Закрепить влияние: что пишет на этот диск (логи, БД, кэш)? Таймер: что быстрее — чистить или увеличить диск (в облаке часто проще!).',
            code: 'df -h\\ndf -i\\nmount | grep -E " /$|/var "',
          },
          {
            title: 'Найти едока',
            text: 'Спуск по дереву: du -sh * | sort -rh | head в корне ФС, затем в каждом подкаталоге. Искать виновника рекордно: логи (ротация!), docker overlay, MySQL binlog (куда растёт!), корзины бэкапов, полный /tmp.',
            code: 'cd / && du -sh * 2>/dev/null | sort -rh | head -10',
          },
          {
            title: 'Быстрая стабилизация',
            text: 'Удаляем/чистим временное: логи старше N дней (find ... -mtime +7 -delete), truncate открытых лог-файлов, prune пакетный кэш, docker system prune. БД: rotate binlog (PURGE BINARY LOGS) — с осторожностью и по регламенту.',
            code: 'find /var/log -type f -name "*.log" -mtime +7 -delete\\ntruncate -s 0 /var/log/nginx/access.log   # не перезапуская nginx\\ndocker system prune -a --volumes   # ТОЛЬКО если сверено!',
          },
          {
            title: 'Не дать повториться',
            text: 'Включить ротацию (logrotate для логов, ограничения размера для БД), алерт на 80% (не 99%!), тег-алиас для «быстрого роста диска». Постмортем: «что переполнилось, почему не словили на 80%».',
            code: '/etc/logrotate.d/app:\\n/var/log/app/*.log {\\n  daily\\n  rotate 14\\n  compress\\n  missingok\\n  notifempty\\n}',
          },
        ],
      },
      {
        heading: 'Рецепт: OOMKilled / нехватка памяти',
        ordered: true,
        items: [
          {
            title: 'Симптомы и подтверждение',
            text: 'Сервис умирает при нагрузке: в k8s статус OOMKilled, на хосте dmesg «Out of memory: Kill process», замораживание/перезапуск подов. free -h: swap использует, buff/cache пуст, памяти ноль.',
            code: 'dmesg | grep -i oom | tail -5\\nkubectl describe pod <pod> | grep -A3 "Last State"',
          },
          {
            title: 'Кто съел память',
            text: 'ps aux --sort=-%mem | head (по процессам), для k8s — kubectl top pods/nodes, правки один большой процесс или сумма кучи средних. Не забыть «тихого едока»: JVM-хип, Redis с maxmemory, MySQL buffer pool.',
          },
          {
            title: 'Лечение',
            text: 'Срочно: перезапуск (не лечит, но возвращает), увеличение лимита/размера VM (в правильном направлении только если это реальный спрос). Корень: утечка (обнаружить heap/вотчинг), правильные requests/limits (не «потолок в небо»), swap-настройка.',
          },
          {
            title: 'Профилактика',
            text: 'Алерт на использование памяти по percent (не по абсолюту), мониторинг RSS/Ж-памяти по контейнерам, нагрузочные тесты до релиза, оверквотинг не «на глаз».',
          },
        ],
      },
      {
        heading: 'Рецепт: «всё медленно» без явной аварии',
        ordered: true,
        intro: 'Самый коварный дежурный сценарий: сервис «жив», но пользователи пишут «тормозит». Диагностика — как у «тормозит», но с акцентом на задержки.',
        items: [
          {
            title: 'Измерить, не угадывать',
            text: 'Где тормозит: внешнее (curl тайминги снаружи), сетевое (tcp в пути), серверное (метрики: CPU/IO/память), прикладное (задержка внутри запроса). Измерения говорят, а не «мне кажется».',
            code: 'curl -o /dev/null -s -w "dns=%{time_namelookup} conn=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer} total=%{time_total}\\n" https://api.example.com/',
          },
          {
            title: 'Ttfb — ключевая метрика',
            text: 'Время до первого байта (time_starttransfer) — главный делитель медленных вебов: ttfb велик → бэкенд/приложение медленно (смотрите логи, p99, очередь). ttfb мал, а total велик → отдача тела (сеть/CDN/большой payload).',
          },
          {
            title: 'А по распределению, а не по среднему',
            text: 'Средние скрывают критику: p99 важен. Один запрос на 30 секунд держит пользователя, среднее = 1.2 сек. Смотрите перцентили, гистограммы и график p99 по сервисам — там истина.',
            code: 'histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))',
          },
          {
            title: 'Классические виновники «медленно»',
            text: '1) БД-запросы без индексов (long query log будет в логах). 2) Блокировки и lock contention. 3) Swapping (память на пределе). 4) Сеть: подозрительные NAT/сертификаты/MTU. 5) Праздничный трафик без масштабирования. Замер → гипотеза → подтверждение логами/метриками — и только потом действие.',
          },
        ],
      },
    ],
  },
];