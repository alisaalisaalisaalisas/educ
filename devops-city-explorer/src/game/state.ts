import { getRankByQuests, getNextRank, RankDef } from '../data/ranks';
import { ACHIEVEMENTS } from '../data/achievements';

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
    id: 'cloud-valley',
    name: 'Cloud Valley & IaC',
    icon: '☁️',
    description: 'Terraform, Ansible, State Drift, AWS/GCP архитектура, автоматизация',
    requiredBadge: 'Observability Master L1',
    requiredBadgeName: 'Бейдж: Observability Master L1 (квест Игоря в Observability Peak)',
  },
  {
    id: 'incident-war-room',
    name: 'Incident War Room',
    icon: '🚨',
    description: 'Экстренные инциденты и босс-битвы (502 Gateway, OOM Killer)',
    requiredBadge: 'All Quests',
    requiredBadgeName: 'Требуется завершить минимум 3 квеста',
  },
  {
    id: 'pipeline-plaza',
    name: 'Pipeline Plaza',
    icon: '⚙️',
    description: 'CI/CD, Jenkins, pipeline-as-code, артефакты и релизы',
    requiredBadge: 'CI/CD Architect L1',
    requiredBadgeName: 'Бейдж: CI/CD Architect L1 (квест Матвея на Git Bridge)',
  },
  {
    id: 'secops-bastion',
    name: 'SecOps Bastion',
    icon: '🔐',
    description: 'Безопасность: hardening, TLS/SSL, аудит секретов',
    requiredBadge: 'NetOps Specialist L1',
    requiredBadgeName: 'Бейдж: NetOps Specialist L1 (квест Дарьи в Network Crossroads)',
  },
  {
    id: 'storage-quay',
    name: 'Storage Quay',
    icon: '💾',
    description: 'Базы данных, бэкапы, миграции, дисковые пулы',
    requiredBadge: 'K8s Troubleshooter L1',
    requiredBadgeName: 'Бейдж: K8s Troubleshooter L1 (квест Елены в K8s Core)',
  },
  {
    id: 'edge-refinery',
    name: 'Edge Refinery',
    icon: '🌐',
    description: 'Edge/CDN, кэширование, rate-limiting, гео-балансировка',
    requiredBadge: 'Incident Commander L1',
    requiredBadgeName: 'Бейдж: Incident Commander L1 (победа над Боссом 1 в War Room)',
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
  achievements: string[];
  pendingQuestBonus: number;
}

const SAVE_KEY = 'devops-city-explorer-save-v4';
const LEGACY_SAVE_KEY = 'devops-city-explorer-save-v3';

interface UnlockRule {
  zoneId?: string;
  afterQuest?: string;
  minCompletedQuests?: number;
  makeAvailable?: string[];
}

const UNLOCK_RULES: UnlockRule[] = [
  {
    zoneId: 'k8s-core',
    afterQuest: 'quest-docker-01',
    makeAvailable: ['quest-k8s-01', 'quest-k8s-02'],
  },
  {
    zoneId: 'observability-peak',
    afterQuest: 'quest-k8s-01',
    makeAvailable: ['quest-obs-01'],
  },
  {
    zoneId: 'cloud-valley',
    afterQuest: 'quest-obs-01',
    makeAvailable: ['quest-terraform-01', 'quest-ansible-01'],
  },
  {
    zoneId: 'incident-war-room',
    minCompletedQuests: 3,
    makeAvailable: ['quest-warroom-01'],
  },
  {
    // Pipeline Plaza opens after the Git/CI-CD quest on the bridge
    zoneId: 'pipeline-plaza',
    afterQuest: 'quest-git-01',
    makeAvailable: ['quest-pipeline-01'],
  },
  {
    // SecOps Bastion opens after the Nginx/network-security quest
    zoneId: 'secops-bastion',
    afterQuest: 'quest-network-01',
    makeAvailable: ['quest-secops-01'],
  },
  {
    // Storage Quay opens after the first K8s troubleshooting quest
    zoneId: 'storage-quay',
    afterQuest: 'quest-k8s-01',
    makeAvailable: ['quest-storage-01', 'quest-storage-02'],
  },
  {
    // Edge Refinery opens only after the first Boss incident is resolved
    zoneId: 'edge-refinery',
    afterQuest: 'quest-warroom-01',
    makeAvailable: ['quest-edge-01'],
  },
  {
    // Boss 2 unlocks after the first Boss incident is beaten
    afterQuest: 'quest-warroom-01',
    makeAvailable: ['quest-boss2-01'],
  },
];

const defaultState: GameState = {
  sla: 99.99,
  credits: 0,
  currentZone: 'linux-suburbs',
  questProgress: {
    'quest-docker-01': { questId: 'quest-docker-01', status: 'available', attempts: 0 },
    'quest-linux-01': { questId: 'quest-linux-01', status: 'available', attempts: 0 },
    'quest-linux-02': { questId: 'quest-linux-02', status: 'available', attempts: 0 },
    'quest-git-01': { questId: 'quest-git-01', status: 'available', attempts: 0 },
    'quest-network-01': { questId: 'quest-network-01', status: 'available', attempts: 0 },
    'quest-k8s-01': { questId: 'quest-k8s-01', status: 'locked', attempts: 0 },
    'quest-k8s-02': { questId: 'quest-k8s-02', status: 'locked', attempts: 0 },
    'quest-obs-01': { questId: 'quest-obs-01', status: 'locked', attempts: 0 },
    'quest-terraform-01': { questId: 'quest-terraform-01', status: 'locked', attempts: 0 },
    'quest-ansible-01': { questId: 'quest-ansible-01', status: 'locked', attempts: 0 },
    'quest-warroom-01': { questId: 'quest-warroom-01', status: 'locked', attempts: 0 },
    'quest-pipeline-01': { questId: 'quest-pipeline-01', status: 'locked', attempts: 0 },
    'quest-secops-01': { questId: 'quest-secops-01', status: 'locked', attempts: 0 },
    'quest-storage-01': { questId: 'quest-storage-01', status: 'locked', attempts: 0 },
    'quest-storage-02': { questId: 'quest-storage-02', status: 'locked', attempts: 0 },
    'quest-edge-01': { questId: 'quest-edge-01', status: 'locked', attempts: 0 },
    'quest-boss2-01': { questId: 'quest-boss2-01', status: 'locked', attempts: 0 },
  },
  badges: [],
  journalEntries: [],
  unlockedZones: ['linux-suburbs', 'network-crossroads', 'git-bridge', 'docker-yard'],
  hasSeenOnboarding: false,
  totalPlayTime: 0,
  startedAt: Date.now(),
  achievements: [],
  pendingQuestBonus: 0,
};

class GameStateManager {
  private state: GameState;
  private listeners: Array<(state: GameState) => void> = [];

  constructor() {
    this.state = this.load();
    this.applyUnlockCatchUp();
  }

  // Re-apply unlock rules for quests completed before these zones existed,
  // so existing saves are not stuck on outdated progression.
  private applyUnlockCatchUp() {
    const completedCount = Object.values(this.state.questProgress).filter(q => q.status === 'completed').length;
    const hasCompleted = (qid: string) => this.state.questProgress[qid]?.status === 'completed';

    let changed = false;
    for (const rule of UNLOCK_RULES) {
      if (rule.zoneId && this.state.unlockedZones.includes(rule.zoneId)) continue;
      const questDone = !rule.afterQuest || hasCompleted(rule.afterQuest);
      const countMet = rule.minCompletedQuests === undefined || completedCount >= rule.minCompletedQuests;
      if (!questDone || !countMet) continue;
      if (rule.zoneId) this.state.unlockedZones.push(rule.zoneId);
      (rule.makeAvailable ?? []).forEach(qid => {
        const progress = this.state.questProgress[qid];
        if (progress && progress.status === 'locked') progress.status = 'available';
      });
      changed = true;
    }
    if (changed) this.save();
  }

  private static mergeState(defaults: GameState, parsed: Partial<GameState>): GameState {
    return {
      ...defaults,
      ...parsed,
      questProgress: {
        ...defaults.questProgress,
        ...(parsed.questProgress || {}),
      },
      unlockedZones: Array.from(new Set([
        ...defaults.unlockedZones,
        ...(parsed.unlockedZones || []),
      ])),
    };
  }

  private load(): GameState {
    try {
      const raw = localStorage.getItem(SAVE_KEY) ?? localStorage.getItem(LEGACY_SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const merged = GameStateManager.mergeState(defaultState, parsed);
        try {
          localStorage.setItem(SAVE_KEY, JSON.stringify(merged));
        } catch (e) {
          console.warn('Failed to persist migrated save:', e);
        }
        return merged;
      }
    } catch (e) {
      console.warn('Failed to load save:', e);
    }
    return { ...defaultState };
  }

  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
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

  unlockZone(zoneId: string) {
    if (!this.state.unlockedZones.includes(zoneId) && CITY_ZONES.some(z => z.id === zoneId)) {
      this.state.unlockedZones.push(zoneId);
      this.save();
      this.listeners.forEach(fn => fn(this.state));
    }
  }

  getZoneRequirement(zoneId: string): ZoneInfo | undefined {
    return CITY_ZONES.find(z => z.id === zoneId);
  }

  getRank(): RankDef {
    const completedCount = Object.values(this.state.questProgress).filter(q => q.status === 'completed').length;
    return getRankByQuests(completedCount);
  }

  getNextRank(): RankDef | undefined {
    return getNextRank(this.getRank());
  }

  getCompletedQuestCount(): number {
    return Object.values(this.state.questProgress).filter(q => q.status === 'completed').length;
  }

  syncAchievements(): string[] {
    const newlyEarned: string[] = [];
    for (const a of ACHIEVEMENTS) {
      if (this.state.achievements.includes(a.id)) continue;
      if (a.matches(this.state)) {
        this.state.achievements.push(a.id);
        newlyEarned.push(a.id);
      }
    }
    if (newlyEarned.length > 0) {
      this.save();
      this.listeners.forEach(fn => fn(this.state));
    }
    return newlyEarned;
  }

  getCurrentObjective(): string {
    const dockerQuest = this.state.questProgress['quest-docker-01'];
    const linuxQuest = this.state.questProgress['quest-linux-01'];
    const gitQuest = this.state.questProgress['quest-git-01'];
    const netQuest = this.state.questProgress['quest-network-01'];
    const k8sQuest = this.state.questProgress['quest-k8s-01'];
    const obsQuest = this.state.questProgress['quest-obs-01'];
    const tfQuest = this.state.questProgress['quest-terraform-01'];
    const warroomQuest = this.state.questProgress['quest-warroom-01'];
    const boss2Quest = this.state.questProgress['quest-boss2-01'];
    const pipelineQuest = this.state.questProgress['quest-pipeline-01'];
    const secopsQuest = this.state.questProgress['quest-secops-01'];
    const storageQuest = this.state.questProgress['quest-storage-01'];
    const edgeQuest = this.state.questProgress['quest-edge-01'];

    if (dockerQuest?.status !== 'completed') {
      return 'Поговорите с Junior Васей в Docker Yard (Северо-Запад)';
    }
    if (linuxQuest?.status !== 'completed') {
      return 'Помогите сисадмину Борису в Linux Suburbs (Юго-Запад)';
    }
    if (gitQuest?.status !== 'completed') {
      return 'Настройте CI/CD с Матвеем на Git Bridge (Центральный мост)';
    }
    if (netQuest?.status !== 'completed') {
      return 'Почините Reverse Proxy с Дарьей в Network Crossroads (Юго-Восток)';
    }
    if (!this.state.unlockedZones.includes('k8s-core')) {
      return 'Пройдите через шлюз на мосту в K8s Core District';
    }
    if (k8sQuest?.status !== 'completed') {
      return 'Расследуйте CrashLoopBackOff у SRE Елены в K8s Core';
    }
    if (!this.state.unlockedZones.includes('observability-peak')) {
      return 'Поднимитесь на вершину Observability Peak';
    }
    if (obsQuest?.status !== 'completed') {
      return 'Настройте PromQL с Игорем на Observability Peak (Север)';
    }
    if (!this.state.unlockedZones.includes('cloud-valley')) {
      return 'Отправляйтесь в Cloud Valley к Архитектору Артёму';
    }
    if (tfQuest?.status !== 'completed') {
      return 'Настройте IaC & Terraform с Артёмом в Cloud Valley';
    }
    if (!this.state.unlockedZones.includes('incident-war-room')) {
      return 'Спуститесь в бункер Incident War Room для Босс-битвы!';
    }
    if (warroomQuest?.status !== 'completed') {
      return '🚨 БОСС 1: Расследуйте аварию 502/OOM в Incident War Room!';
    }
    if (boss2Quest?.status !== 'completed') {
      return '☠️ БОСС 2: Восстановите БД после полного отказа в Incident War Room!';
    }
    if (!this.state.unlockedZones.includes('pipeline-plaza')) {
      return 'Откройте Pipeline Plaza на северо-востоке (после квеста Матвея)';
    }
    if (pipelineQuest?.status !== 'completed') {
      return 'Соберите пайплайн с Генадием в Pipeline Plaza';
    }
    if (!this.state.unlockedZones.includes('secops-bastion')) {
      return 'Откройте SecOps Bastion на крайнем северо-востоке (после квеста Дарьи)';
    }
    if (secopsQuest?.status !== 'completed') {
      return 'Пройдите харденинг-экзамен у Кати в SecOps Bastion';
    }
    if (!this.state.unlockedZones.includes('storage-quay')) {
      return 'Откройте Storage Quay на крайнем юго-востоке (после квеста Елены)';
    }
    if (storageQuest?.status !== 'completed') {
      return 'Почините бэкапы со Светланой в Storage Quay';
    }
    if (!this.state.unlockedZones.includes('edge-refinery')) {
      return 'Откройте Edge Refinery на восточном берегу (после Босса 1)';
    }
    if (edgeQuest?.status !== 'completed') {
      return 'Почините CDN-кэширование у Тохи в Edge Refinery';
    }
    return '🏆 Все зоны и квесты пройдены! Вы — Lead DevOps & Incident Commander!';
  }

  completeQuest(questId: string, reward: { slaBonus: number; credits: number; badge: string }): { newlyUnlockedZones: string[] } {
    const progress = this.state.questProgress[questId];
    if (progress) {
      progress.status = 'completed';
      progress.completedAt = Date.now();
    }
    this.state.sla = Math.min(100, parseFloat((this.state.sla + reward.slaBonus).toFixed(2)));
    const bonus = this.state.pendingQuestBonus || 0;
    this.state.credits += reward.credits + bonus;
    this.state.pendingQuestBonus = 0;
    if (reward.badge && !this.state.badges.some(b => b.id === reward.badge)) {
      this.state.badges.push({ id: reward.badge, name: reward.badge, earnedAt: Date.now() });
    }

    const newlyUnlockedZones: string[] = [];
    const completedCount = Object.values(this.state.questProgress).filter(q => q.status === 'completed').length;

    for (const rule of UNLOCK_RULES) {
      if (rule.zoneId && this.state.unlockedZones.includes(rule.zoneId)) continue;

      const questTriggered = !rule.afterQuest || questId === rule.afterQuest;
      const countMet = rule.minCompletedQuests === undefined || completedCount >= rule.minCompletedQuests;
      if (!questTriggered || !countMet) continue;

      if (rule.zoneId) {
        this.state.unlockedZones.push(rule.zoneId);
        newlyUnlockedZones.push(rule.zoneId);
      }
      (rule.makeAvailable ?? []).forEach(qid => {
        const progress = this.state.questProgress[qid];
        if (progress) progress.status = 'available';
      });
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
