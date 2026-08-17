export interface QuestProgress {
  questId: string;
  status: 'locked' | 'available' | 'in-progress' | 'completed';
  completedAt?: number;
  attempts: number;
  bestTime?: number;
}

export interface Badge {
  id: string;
  name: string;
  earnedAt: number;
}

export interface ZoneInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
  requiredBadge?: string;
  requiredBadgeName?: string;
}

export const CITY_ZONES: ZoneInfo[] = [
  {
    id: 'linux-suburbs',
    name: 'Linux Suburbs',
    icon: '🐧',
    description: 'Основы ядра Linux, процессы, systemd, память, bash-скрипты',
  },
  {
    id: 'network-crossroads',
    name: 'Network Crossroads',
    icon: '🌐',
    description: 'DNS, TCP/IP, Nginx Reverse Proxy, маршрутизация портов',
  },
  {
    id: 'git-bridge',
    name: 'Git Bridge & CI/CD',
    icon: '🌉',
    description: 'Версионирование, Merge конфликты, GitHub Actions workflows',
  },
  {
    id: 'docker-yard',
    name: 'Docker Yard',
    icon: '🐳',
    description: 'Контейнеры, Dockerfile, multi-stage сборка, оптимизация слоев',
  },
  {
    id: 'k8s-core',
    name: 'K8s Core District',
    icon: '☸️',
    description: 'Поды, Deployments, ConfigMap, CrashLoopBackOff расследование',
    requiredBadge: 'Container Optimizer L1',
    requiredBadgeName: 'Бейдж: Container Optimizer L1 (квест Васи в Docker Yard)',
  },
  {
    id: 'observability-peak',
    name: 'Observability Peak',
    icon: '📊',
    description: 'Prometheus, Grafana, PromQL запросы, логи Loki, алерты',
    requiredBadge: 'K8s Troubleshooter L1',
    requiredBadgeName: 'Бейдж: K8s Troubleshooter L1 (квест Елены в K8s Core)',
  },
  {
    id: 'incident-war-room',
    name: 'Incident War Room',
    icon: '🚨',
    description: 'Экстренные инциденты и босс-битвы (502 Gateway, OOM Killer)',
    requiredBadge: 'All Quests',
    requiredBadgeName: 'Требуется завершить минимум 3 квеста',
  },
];

export interface GameState {
  sla: number;
  credits: number;
  currentZone: string;
  questProgress: Record<string, QuestProgress>;
  badges: Badge[];
  journalEntries: string[];
  unlockedZones: string[];
  hasSeenOnboarding: boolean;
  totalPlayTime: number;
  startedAt: number;
}

const STORAGE_KEY = 'devops-city-explorer-save-v2';

const defaultState: GameState = {
  sla: 99.99,
  credits: 0,
  currentZone: 'linux-suburbs',
  questProgress: {
    'quest-docker-01': { questId: 'quest-docker-01', status: 'available', attempts: 0 },
    'quest-linux-01': { questId: 'quest-linux-01', status: 'available', attempts: 0 },
    'quest-k8s-01': { questId: 'quest-k8s-01', status: 'locked', attempts: 0 },
  },
  badges: [],
  journalEntries: [],
  unlockedZones: ['linux-suburbs', 'network-crossroads', 'git-bridge', 'docker-yard'],
  hasSeenOnboarding: false,
  totalPlayTime: 0,
  startedAt: Date.now(),
};

class GameStateManager {
  private state: GameState;
  private listeners: Array<(state: GameState) => void> = [];

  constructor() {
    this.state = this.load();
  }

  private load(): GameState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultState, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load save:', e);
    }
    return { ...defaultState };
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save:', e);
    }
  }

  get(): GameState {
    return this.state;
  }

  update(partial: Partial<GameState>) {
    this.state = { ...this.state, ...partial };
    this.save();
    this.listeners.forEach(fn => fn(this.state));
  }

  isZoneUnlocked(zoneId: string): boolean {
    return this.state.unlockedZones.includes(zoneId);
  }

  getZoneRequirement(zoneId: string): ZoneInfo | undefined {
    return CITY_ZONES.find(z => z.id === zoneId);
  }

  getCurrentObjective(): string {
    const dockerQuest = this.state.questProgress['quest-docker-01'];
    const linuxQuest = this.state.questProgress['quest-linux-01'];
    const k8sQuest = this.state.questProgress['quest-k8s-01'];

    if (dockerQuest?.status !== 'completed') {
      return 'Поговорите с Junior Васей в Docker Yard (Северо-Запад)';
    }
    if (linuxQuest?.status !== 'completed') {
      return 'Помогите сисадмину Борису в Linux Suburbs (Юго-Запад)';
    }
    if (!this.state.unlockedZones.includes('k8s-core')) {
      return 'Пройдите через шлюз на мосту в K8s Core District';
    }
    if (k8sQuest?.status !== 'completed') {
      return 'Расследуйте CrashLoopBackOff у SRE Елены в K8s Core';
    }
    return 'Все текущие квесты пройдены! Готовы к Спринту 2!';
  }

  completeQuest(questId: string, reward: { slaBonus: number; credits: number; badge: string }): { newlyUnlockedZones: string[] } {
    const progress = this.state.questProgress[questId];
    if (progress) {
      progress.status = 'completed';
      progress.completedAt = Date.now();
    }
    this.state.sla = Math.min(100, parseFloat((this.state.sla + reward.slaBonus).toFixed(2)));
    this.state.credits += reward.credits;
    if (reward.badge && !this.state.badges.some(b => b.id === reward.badge)) {
      this.state.badges.push({ id: reward.badge, name: reward.badge, earnedAt: Date.now() });
    }

    const newlyUnlockedZones: string[] = [];

    // Check unlocking logic
    if (questId === 'quest-docker-01' && !this.state.unlockedZones.includes('k8s-core')) {
      this.state.unlockedZones.push('k8s-core');
      newlyUnlockedZones.push('k8s-core');
      if (this.state.questProgress['quest-k8s-01']) {
        this.state.questProgress['quest-k8s-01'].status = 'available';
      }
    }

    if (questId === 'quest-k8s-01' && !this.state.unlockedZones.includes('observability-peak')) {
      this.state.unlockedZones.push('observability-peak');
      newlyUnlockedZones.push('observability-peak');
    }

    this.save();
    this.listeners.forEach(fn => fn(this.state));

    return { newlyUnlockedZones };
  }

  addJournalEntry(entry: string) {
    if (!this.state.journalEntries.includes(entry)) {
      this.state.journalEntries.push(entry);
      this.save();
      this.listeners.forEach(fn => fn(this.state));
    }
  }

  subscribe(fn: (state: GameState) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  reset() {
    this.state = { ...defaultState, startedAt: Date.now(), hasSeenOnboarding: true };
    this.save();
    this.listeners.forEach(fn => fn(this.state));
  }
}

export const gameState = new GameStateManager();
