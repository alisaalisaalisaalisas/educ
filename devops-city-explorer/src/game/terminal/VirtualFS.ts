export interface FSNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  permissions?: string;
  owner?: string;
  size?: number;
  children?: Record<string, FSNode>;
}

export class VirtualFS {
  private root: FSNode;
  private currentPath: string = '/home/devops';

  constructor(initialFiles?: Record<string, string>) {
    this.root = this.createDefaultHierarchy();
    if (initialFiles) {
      for (const [path, content] of Object.entries(initialFiles)) {
        this.writeFile(path, content);
      }
    }
  }

  private createDefaultHierarchy(): FSNode {
    return {
      name: '',
      type: 'directory',
      children: {
        home: {
          name: 'home',
          type: 'directory',
          children: {
            devops: {
              name: 'devops',
              type: 'directory',
              children: {
                'notes.txt': {
                  name: 'notes.txt',
                  type: 'file',
                  permissions: '-rw-r--r--',
                  owner: 'devops',
                  size: 245,
                  content: 'DevOps On-Call Checklist:\n1. Check alerts in Alertmanager\n2. Inspect Nginx error logs\n3. Check dmesg for OOM Killer (code 137)\n4. Verify pod status with kubectl get pods\n',
                },
                'fix_deploy.sh': {
                  name: 'fix_deploy.sh',
                  type: 'file',
                  permissions: '-rwxr-xr-x',
                  owner: 'devops',
                  size: 120,
                  content: '#!/bin/bash\necho "Running self-healing routine..."\nsystemctl restart backend-app\n',
                },
              },
            },
          },
        },
        var: {
          name: 'var',
          type: 'directory',
          children: {
            log: {
              name: 'log',
              type: 'directory',
              children: {
                nginx: {
                  name: 'nginx',
                  type: 'directory',
                  children: {
                    'error.log': {
                      name: 'error.log',
                      type: 'file',
                      permissions: '-rw-r-----',
                      owner: 'www-data',
                      size: 4096,
                      content: `2026/08/19 03:14:02 [error] 1420#1420: *8491 connect() failed (111: Connection refused) while connecting to upstream, client: 192.168.1.104, server: api.devops.city, request: "POST /v1/auth HTTP/1.1", upstream: "http://127.0.0.1:8080/v1/auth"
2026/08/19 03:14:05 [error] 1420#1420: *8492 connect() failed (111: Connection refused) while connecting to upstream, client: 192.168.1.105, server: api.devops.city, request: "GET /health HTTP/1.1", upstream: "http://127.0.0.1:8080/health"
2026/08/19 03:14:10 [warn] 1420#1420: *8493 [lua] circuit_breaker.lua:42: backend upstream 127.0.0.1:8080 marked as UNHEALTHY (5 consecutive failures)
2026/08/19 03:14:15 [error] 1420#1420: *8494 no live upstreams while connecting to upstream, client: 192.168.1.110, server: api.devops.city, request: "GET /metrics HTTP/1.1", upstream: "http://backend_cluster"`,
                    },
                    'access.log': {
                      name: 'access.log',
                      type: 'file',
                      permissions: '-rw-r--r--',
                      owner: 'www-data',
                      size: 8192,
                      content: `192.168.1.104 - - [19/Aug/2026:03:14:02 +0000] "POST /v1/auth HTTP/1.1" 502 157 "-" "Mozilla/5.0" 0.002
192.168.1.105 - - [19/Aug/2026:03:14:05 +0000] "GET /health HTTP/1.1" 502 157 "-" "Prometheus/2.45" 0.001
192.168.1.110 - - [19/Aug/2026:03:14:15 +0000] "GET /metrics HTTP/1.1" 502 157 "-" "Prometheus/2.45" 0.000`,
                    },
                  },
                },
                'syslog': {
                  name: 'syslog',
                  type: 'file',
                  permissions: '-rw-r-----',
                  owner: 'syslog',
                  size: 2048,
                  content: `Aug 19 03:13:58 k8s-worker-01 kernel: [ 4812.910] backend-app invoked oom-killer: gfp_mask=0x100cca(GFP_HIGHUSER_MOVABLE), order=0, oom_score_adj=998
Aug 19 03:13:58 k8s-worker-01 kernel: [ 4812.912] Out of memory: Killed process 8140 (node) total-vm:2097152kB, anon-rss:512400kB, file-rss:0kB, shmem-rss:0kB
Aug 19 03:13:59 k8s-worker-01 systemd[1]: backend-app.service: Main process exited, code=killed, status=9/KILL
Aug 19 03:13:59 k8s-worker-01 systemd[1]: backend-app.service: Failed with result 'oom-kill'.`,
                },
              },
            },
          },
        },
        etc: {
          name: 'etc',
          type: 'directory',
          children: {
            nginx: {
              name: 'nginx',
              type: 'directory',
              children: {
                'nginx.conf': {
                  name: 'nginx.conf',
                  type: 'file',
                  permissions: '-rw-r--r--',
                  owner: 'root',
                  size: 512,
                  content: `events { worker_connections 1024; }
http {
  upstream backend_api {
    server 127.0.0.1:8080;
  }
  server {
    listen 80;
    server_name api.devops.city;
    location / {
      proxy_pass http://backend_api;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }
  }
}`,
                },
              },
            },
            'hosts': {
              name: 'hosts',
              type: 'file',
              permissions: '-rw-r--r--',
              owner: 'root',
              size: 150,
              content: '127.0.0.1 localhost\n127.0.1.1 k8s-worker-01\n10.244.0.5 auth-service\n10.244.0.6 postgres-master\n',
            },
          },
        },
        proc: {
          name: 'proc',
          type: 'directory',
          children: {
            '1024': {
              name: '1024',
              type: 'directory',
              children: {
                fd: {
                  name: 'fd',
                  type: 'directory',
                  children: {
                    '4': {
                      name: '4',
                      type: 'file',
                      permissions: 'lrwx------',
                      owner: 'root',
                      size: 3824918234,
                      content: '[binary stream: 3.8GB deleted access.log]',
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
  }

  getCurrentPath(): string {
    return this.currentPath;
  }

  setCurrentPath(newPath: string): boolean {
    const resolved = this.resolvePath(newPath);
    const node = this.getNode(resolved);
    if (node && node.type === 'directory') {
      this.currentPath = resolved;
      return true;
    }
    return false;
  }

  resolvePath(path: string): string {
    if (!path.startsWith('/')) {
      path = this.currentPath === '/' ? `/${path}` : `${this.currentPath}/${path}`;
    }
    const parts = path.split('/').filter(Boolean);
    const resolved: string[] = [];

    for (const part of parts) {
      if (part === '.') continue;
      if (part === '..') {
        resolved.pop();
      } else {
        resolved.push(part);
      }
    }
    return '/' + resolved.join('/');
  }

  getNode(path: string): FSNode | null {
    const resolved = this.resolvePath(path);
    if (resolved === '/') return this.root;

    const parts = resolved.split('/').filter(Boolean);
    let current: FSNode = this.root;

    for (const part of parts) {
      if (!current.children || !current.children[part]) {
        return null;
      }
      current = current.children[part];
    }
    return current;
  }

  listDirectory(path?: string): FSNode[] | null {
    const targetPath = path ? this.resolvePath(path) : this.currentPath;
    const node = this.getNode(targetPath);
    if (!node || node.type !== 'directory' || !node.children) return null;
    return Object.values(node.children);
  }

  readFile(path: string): string | null {
    const node = this.getNode(path);
    if (!node || node.type !== 'file') return null;
    return node.content ?? '';
  }

  writeFile(path: string, content: string): boolean {
    const resolved = this.resolvePath(path);
    const parts = resolved.split('/').filter(Boolean);
    const fileName = parts.pop();
    if (!fileName) return false;

    const dirPath = '/' + parts.join('/');
    const dirNode = this.getNode(dirPath);
    if (!dirNode || dirNode.type !== 'directory') return false;

    if (!dirNode.children) dirNode.children = {};

    dirNode.children[fileName] = {
      name: fileName,
      type: 'file',
      permissions: '-rw-r--r--',
      owner: 'devops',
      size: content.length,
      content,
    };
    return true;
  }

  truncateFile(path: string): boolean {
    const node = this.getNode(path);
    if (node && node.type === 'file') {
      node.content = '';
      node.size = 0;
      return true;
    }
    return false;
  }
}
