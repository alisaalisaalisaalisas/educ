import { VirtualFS } from './VirtualFS';

export interface CommandResult {
  output: string;
  exitCode: number;
  newPath?: string;
  clear?: boolean;
}

export class MockShell {
  private fs: VirtualFS;
  private servicesState: Record<string, 'active (running)' | 'failed (dead)' | 'inactive'> = {
    'backend-app': 'failed (dead)',
    'nginx': 'active (running)',
    'postgresql': 'active (running)',
    'node-exporter': 'active (running)',
  };

  private podStates: Record<string, { status: string; restarts: number; age: string; node: string }> = {
    'auth-service-7bb8c94d9-x8q2z': { status: 'CrashLoopBackOff', restarts: 7, age: '18m', node: 'worker-01' },
    'postgres-statefulset-0': { status: 'Running', restarts: 0, age: '4d2h', node: 'worker-02' },
    'redis-cache-5c7499695d-m4pl9': { status: 'Running', restarts: 0, age: '2d10h', node: 'worker-01' },
    'nginx-ingress-controller-4kl2m': { status: 'Running', restarts: 0, age: '14d', node: 'worker-01' },
  };

  constructor(fs?: VirtualFS) {
    this.fs = fs || new VirtualFS();
  }

  getFS(): VirtualFS {
    return this.fs;
  }

  getPrompt(): string {
    const current = this.fs.getCurrentPath();
    const short = current.replace('/home/devops', '~');
    return `devops@k8s-node:${short}$ `;
  }

  execute(commandLine: string): CommandResult {
    const trimmed = commandLine.trim();
    if (!trimmed) return { output: '', exitCode: 0 };

    if (trimmed === 'clear') {
      return { output: '', exitCode: 0, clear: true };
    }

    // Pipe handling (e.g. cat /var/log/syslog | grep oom | tail -n 2)
    if (trimmed.includes('|')) {
      return this.executePipeline(trimmed);
    }

    return this.executeSingleCommand(trimmed);
  }

  private executePipeline(pipeline: string): CommandResult {
    const segments = pipeline.split('|').map(s => s.trim());
    let currentInput = '';
    let lastExit = 0;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const result = this.executeSingleCommand(seg, currentInput);
      if (result.exitCode !== 0 && i === 0 && !result.output) {
        return result;
      }
      currentInput = result.output;
      lastExit = result.exitCode;
    }

    return { output: currentInput, exitCode: lastExit };
  }

  private executeSingleCommand(cmdStr: string, pipedInput?: string): CommandResult {
    const tokens = cmdStr.match(/(?:[^\s"]+|"[^"]*")+/g)?.map(t => t.replace(/^"|"$/g, '')) || [];
    if (tokens.length === 0) return { output: '', exitCode: 0 };

    const cmd = tokens[0];
    const args = tokens.slice(1);

    switch (cmd) {
      case 'help':
        return {
          output: `Available commands in DevOps City Shell:
  Files & Nav:  ls, cd, pwd, cat, head, tail, grep, chmod, truncate, rm
  System/Diag:  ps aux, top, systemctl, df -h, free -m, dmesg, uptime
  Network:      curl, ss, netstat, ping
  Kubernetes:   kubectl (get pods, describe pod, logs)
  Git:          git (status, log, diff, branch)
  Utilities:    clear, echo, help, whoami
  Features:     Pipes (|) are fully supported! (e.g. dmesg | grep -i oom)`,
          exitCode: 0,
        };

      case 'pwd':
        return { output: this.fs.getCurrentPath(), exitCode: 0 };

      case 'whoami':
        return { output: 'devops', exitCode: 0 };

      case 'uptime':
        return { output: ' 03:15:22 up 14 days,  4:20,  2 users,  load average: 8.45, 6.12, 3.80', exitCode: 0 };

      case 'echo':
        return { output: args.join(' '), exitCode: 0 };

      case 'cd': {
        const target = args[0] || '/home/devops';
        const ok = this.fs.setCurrentPath(target);
        if (!ok) {
          return { output: `cd: no such file or directory: ${target}`, exitCode: 1 };
        }
        return { output: '', exitCode: 0, newPath: this.fs.getCurrentPath() };
      }

      case 'ls': {
        const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
        const showLong = args.includes('-l') || args.includes('-la') || args.includes('-al');
        const pathArg = args.find(a => !a.startsWith('-'));

        const nodes = this.fs.listDirectory(pathArg);
        if (nodes === null) {
          return { output: `ls: cannot access '${pathArg}': No such file or directory`, exitCode: 2 };
        }

        if (showLong) {
          const lines = nodes.map(n => {
            const isDir = n.type === 'directory';
            const perm = n.permissions || (isDir ? 'drwxr-xr-x' : '-rw-r--r--');
            const owner = n.owner || 'devops';
            const size = (n.size || 4096).toString().padStart(6, ' ');
            return `${perm} 1 ${owner} staff ${size} Aug 19 03:15 ${n.name}${isDir ? '/' : ''}`;
          });
          return { output: `total ${nodes.length * 4}\n` + lines.join('\n'), exitCode: 0 };
        }

        return { output: nodes.map(n => n.name + (n.type === 'directory' ? '/' : '')).join('  '), exitCode: 0 };
      }

      case 'cat': {
        if (pipedInput !== undefined && args.length === 0) {
          return { output: pipedInput, exitCode: 0 };
        }
        const file = args[0];
        if (!file) return { output: 'cat: missing file operand', exitCode: 1 };
        const content = this.fs.readFile(file);
        if (content === null) {
          return { output: `cat: ${file}: No such file or directory`, exitCode: 1 };
        }
        return { output: content, exitCode: 0 };
      }

      case 'head': {
        let linesCount = 10;
        let fileIndex = 0;
        if (args[0] === '-n' && args[1]) {
          linesCount = parseInt(args[1], 10) || 10;
          fileIndex = 2;
        }
        let sourceText = pipedInput;
        if (args[fileIndex]) {
          const c = this.fs.readFile(args[fileIndex]);
          if (c === null) return { output: `head: cannot open '${args[fileIndex]}'`, exitCode: 1 };
          sourceText = c;
        }
        if (sourceText === undefined) return { output: 'head: no input', exitCode: 1 };
        return { output: sourceText.split('\n').slice(0, linesCount).join('\n'), exitCode: 0 };
      }

      case 'tail': {
        let linesCount = 10;
        let fileIndex = 0;
        if (args[0] === '-n' && args[1]) {
          linesCount = parseInt(args[1], 10) || 10;
          fileIndex = 2;
        }
        let sourceText = pipedInput;
        if (args[fileIndex]) {
          const c = this.fs.readFile(args[fileIndex]);
          if (c === null) return { output: `tail: cannot open '${args[fileIndex]}'`, exitCode: 1 };
          sourceText = c;
        }
        if (sourceText === undefined) return { output: 'tail: no input', exitCode: 1 };
        const allLines = sourceText.split('\n');
        return { output: allLines.slice(Math.max(0, allLines.length - linesCount)).join('\n'), exitCode: 0 };
      }

      case 'grep': {
        const caseInsensitive = args.includes('-i');
        const nonFlagArgs = args.filter(a => !a.startsWith('-'));
        const pattern = nonFlagArgs[0];
        const filePath = nonFlagArgs[1];

        if (!pattern) return { output: 'grep: missing search pattern', exitCode: 2 };

        let source = pipedInput;
        if (filePath) {
          const fileContent = this.fs.readFile(filePath);
          if (fileContent === null) return { output: `grep: ${filePath}: No such file or directory`, exitCode: 2 };
          source = fileContent;
        }

        if (source === undefined) return { output: '', exitCode: 1 };

        const regex = new RegExp(pattern, caseInsensitive ? 'i' : '');
        const matching = source.split('\n').filter(line => regex.test(line));
        return {
          output: matching.join('\n'),
          exitCode: matching.length > 0 ? 0 : 1,
        };
      }

      case 'dmesg': {
        const output = `[ 4810.104] TCP: request_sock_TCP: Possible SYN flooding on port 80. Sending cookies.
[ 4812.910] backend-app invoked oom-killer: gfp_mask=0x100cca(GFP_HIGHUSER_MOVABLE), order=0, oom_score_adj=998
[ 4812.911] CPU: 2 PID: 8140 Comm: node Not tainted 6.5.0-35-generic #36-Ubuntu
[ 4812.912] Out of memory: Killed process 8140 (node) total-vm:2097152kB, anon-rss:512400kB, file-rss:0kB
[ 4812.915] oom_reaper: reaped process 8140 (node), now anon-rss:0kB, file-rss:0kB
[ 4813.002] systemd[1]: backend-app.service: Main process exited, code=killed, status=9/KILL`;
        return { output, exitCode: 0 };
      }

      case 'ps': {
        const output = `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1 168420 11400 ?        Ss   Aug05   0:14 /sbin/init
root       412  0.2  0.3  72100 24100 ?        S    Aug05   1:42 /lib/systemd/systemd-journald
www-data  1420  1.4  0.8 142100 48200 ?        S    03:10   0:08 nginx: worker process
postgres  2041  0.8  2.4 380400 156000 ?       S    Aug05   8:19 postgres: master process
devops    8912  0.0  0.0  14500  3200 pts/0    R+   03:15   0:00 ps aux`;
        return { output, exitCode: 0 };
      }

      case 'top': {
        const output = `top - 03:15:40 up 14 days,  4:20,  2 users,  load average: 8.45, 6.12, 3.80
Tasks: 142 total,   2 running, 140 sleeping,   0 stopped,   0 zombie
%Cpu(s): 12.4 us,  6.8 sy,  0.0 ni, 74.2 id,  6.4 wa,  0.0 hi,  0.2 si
MiB Mem :   7960.4 total,    812.2 free,   6410.8 used,    737.4 buff/cache
MiB Swap:   2048.0 total,    410.0 free,   1638.0 used.   1140.6 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 1420 www-data  20   0  142100  48200   8120 S  18.4   0.6   0:08.14 nginx
 2041 postgres  20   0  380400 156000  42100 S   8.2   2.0   8:19.45 postgres
 8910 devops    20   0   48120  14200   6100 R   4.1   0.2   0:01.02 top`;
        return { output, exitCode: 0 };
      }

      case 'df': {
        const output = `Filesystem      Size  Used Avail Use% Mounted on
udev            3.9G     0  3.9G   0% /dev
tmpfs           797M  1.8M  795M   1% /run
/dev/sda1        40G   38G  1.8G  96% /
/dev/sdb1       100G   24G   71G  26% /data
/dev/sda15      124M   12M  112M  10% /boot/efi`;
        return { output, exitCode: 0 };
      }

      case 'free': {
        const output = `               total        used        free      shared  buff/cache   available
Mem:            7960        6410         812         148         737        1140
Swap:           2048        1638         410`;
        return { output, exitCode: 0 };
      }

      case 'systemctl': {
        const action = args[0];
        const service = args[1]?.replace('.service', '');

        if (!action || !service) {
          return { output: 'systemctl: missing action or service name (e.g. systemctl status backend-app)', exitCode: 1 };
        }

        if (action === 'status') {
          const st = this.servicesState[service] || 'unknown';
          const isRunning = st.startsWith('active');
          return {
            output: `● ${service}.service - High-Performance Backend Service
   Loaded: loaded (/etc/systemd/system/${service}.service; enabled; vendor preset: enabled)
   Active: ${st} since Wed 2026-08-19 03:13:59 UTC; 2min ago
  Process: 8140 ExecStart=/usr/bin/node /app/server.js (code=killed, signal=KILL)
 Main PID: 8140 (code=killed, signal=KILL)`,
            exitCode: isRunning ? 0 : 3,
          };
        }

        if (action === 'restart' || action === 'start') {
          this.servicesState[service] = 'active (running)';
          return { output: `[OK] Service '${service}' successfully restarted and healthy.`, exitCode: 0 };
        }

        if (action === 'stop') {
          this.servicesState[service] = 'inactive';
          return { output: `[OK] Service '${service}' stopped.`, exitCode: 0 };
        }

        return { output: `systemctl: unsupported action '${action}'`, exitCode: 1 };
      }

      case 'curl': {
        const url = args.find(a => !a.startsWith('-')) || '';
        const isHead = args.includes('-I') || args.includes('-i');

        if (!url) return { output: 'curl: no URL specified', exitCode: 2 };

        if (url.includes(':8080') || url.includes('/health')) {
          if (this.servicesState['backend-app'] === 'active (running)') {
            return {
              output: isHead
                ? `HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nDate: Wed, 19 Aug 2026 03:16:00 GMT\r\n\r\n{"status":"healthy","uptime":42}`
                : `{"status":"healthy","uptime":42,"version":"v1.4.2"}`,
              exitCode: 0,
            };
          }
          return { output: 'curl: (7) Failed to connect to 127.0.0.1 port 8080: Connection refused', exitCode: 7 };
        }

        if (url.includes('api.devops.city')) {
          if (this.servicesState['backend-app'] === 'active (running)') {
            return { output: `HTTP/1.1 200 OK\nServer: nginx/1.24.0\n{"data":"welcome_to_devops_city"}`, exitCode: 0 };
          }
          return { output: `HTTP/1.1 502 Bad Gateway\nServer: nginx/1.24.0\n<html><center><h1>502 Bad Gateway</h1></center></html>`, exitCode: 0 };
        }

        return { output: `HTTP/1.1 200 OK\n{"message":"pong"}`, exitCode: 0 };
      }

      case 'lsof': {
        const output = `COMMAND   PID USER   FD   TYPE DEVICE  SIZE/OFF   NODE NAME
nginx    1024 root    4w   REG    8,1 3824918234    142 /var/log/nginx/access.log (deleted)
postgres 2041 postgres 3u  IPv4  24912       0t0    TCP *:5432 (LISTEN)
node     8140 devops   1w   REG    8,1    142018    812 /app/logs/out.log`;
        return { output, exitCode: 0 };
      }

      case 'ss':
      case 'netstat': {
        const output = `Netid State  Recv-Q Send-Q  Local Address:Port   Peer Address:Port Process
tcp   LISTEN 0      128           0.0.0.0:80          0.0.0.0:*     users:(("nginx",pid=1420,fd=6))
tcp   LISTEN 0      128           0.0.0.0:443         0.0.0.0:*     users:(("nginx",pid=1420,fd=7))
tcp   LISTEN 0      100           0.0.0.0:5432        0.0.0.0:*     users:(("postgres",pid=2041,fd=3))
tcp   LISTEN 0      128           0.0.0.0:9100        0.0.0.0:*     users:(("node_exporter",pid=3102,fd=3))`;
        return { output, exitCode: 0 };
      }

      case 'kubectl': {
        const sub = args[0];
        const res = args[1];

        if (sub === 'get' && (res === 'pods' || res === 'pod')) {
          const lines = ['NAME                             READY   STATUS             RESTARTS   AGE     NODE'];
          for (const [name, p] of Object.entries(this.podStates)) {
            lines.push(`${name.padEnd(32)} 0/1     ${p.status.padEnd(18)} ${p.restarts.toString().padEnd(10)} ${p.age.padEnd(7)} ${p.node}`);
          }
          return { output: lines.join('\n'), exitCode: 0 };
        }

        if (sub === 'describe' && (res === 'pod' || res === 'pods')) {
          const podName = args[2] || 'auth-service-7bb8c94d9-x8q2z';
          return {
            output: `Name:         ${podName}
Namespace:    production
Node:         worker-01/192.168.1.104
Status:       Running
Containers:
  auth-service:
    Image:          registry.devops.city/apps/auth:v2.1.0
    State:          Waiting
      Reason:       CrashLoopBackOff
    Last State:     Terminated
      Reason:       OOMKilled
      Exit Code:    137
    Limits:
      cpu:     500m
      memory:  256Mi
    Requests:
      cpu:     100m
      memory:  128Mi
Events:
  Type     Reason     Age                  From               Message
  ----     ------     ----                 ----               -------
  Warning  BackOff    2m (x8 over 18m)     kubelet, worker-01 Back-off restarting failed container
  Warning  OOMKilled  3m                   kubelet, worker-01 Container auth-service exceeded memory limit (256Mi)`,
            exitCode: 0,
          };
        }

        if (sub === 'logs') {
          return {
            output: `2026-08-19 03:13:55 [INFO] Initializing Auth Microservice v2.1.0...
2026-08-19 03:13:56 [INFO] Connected to PostgreSQL pool (max_size: 50)
2026-08-19 03:13:57 [WARN] Memory consumption spike: 248MB / 256MB limit (96.8%)
2026-08-19 03:13:58 [FATAL] JavaScript heap out of memory / Allocation failed - process terminated.`,
            exitCode: 0,
          };
        }

        return { output: `kubectl: unknown command '${args.join(' ')}'`, exitCode: 1 };
      }

      case 'chmod': {
        const perms = args[0];
        const target = args[1];
        if (!perms || !target) return { output: 'chmod: missing operand', exitCode: 1 };
        const node = this.fs.getNode(target);
        if (!node) return { output: `chmod: cannot access '${target}': No such file or directory`, exitCode: 1 };
        node.permissions = perms.startsWith('-') ? perms : `-rwxr-xr-x`;
        return { output: '', exitCode: 0 };
      }

      case 'truncate': {
        const file = args[args.length - 1];
        if (!file) return { output: 'truncate: missing file operand', exitCode: 1 };
        const ok = this.fs.truncateFile(file);
        if (!ok) return { output: `truncate: cannot open '${file}': No such file or directory`, exitCode: 1 };
        return { output: '', exitCode: 0 };
      }

      default:
        return { output: `${cmd}: command not found. Type 'help' for available commands.`, exitCode: 127 };
    }
  }
}
