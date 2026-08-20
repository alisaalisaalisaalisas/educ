import { GameState } from '../game/state';

export interface AchievementDef {
  id: string;
  name: string;
  icon: string;
  desc: string;
  matches: (state: GameState) => boolean;
}

const completedCount = (state: GameState) =>
  Object.values(state.questProgress).filter(q => q.status === 'completed').length;

const hasCompleted = (state: GameState, id: string) =>
  state.questProgress[id]?.status === 'completed';

const hasBadge = (state: GameState, name: string) =>
  state.badges.some(b => b.name === name);

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-quest',
    name: 'Первый коммит',
    icon: '📝',
    desc: 'Выполнить первый квест в городе',
    matches: s => completedCount(s) >= 1,
  },
  {
    id: 'docker-hero',
    name: 'Контейнеризатор',
    icon: '🐳',
    desc: 'Выполнить все квесты Docker Yard',
    matches: s => hasCompleted(s, 'quest-docker-01'),
  },
  {
    id: 'bridge-master',
    name: 'Мостостроитель',
    icon: '🌉',
    desc: 'Выполнить CI/CD квест на Git Bridge',
    matches: s => hasCompleted(s, 'quest-git-01'),
  },
  {
    id: 'net-wizard',
    name: 'Сетевой маг',
    icon: '🌐',
    desc: 'Выполнить квест Network Crossroads',
    matches: s => hasCompleted(s, 'quest-network-01'),
  },
  {
    id: 'secret-hunter',
    name: 'Охотник за секретами',
    icon: '🔐',
    desc: 'Пройти харденинг в SecOps Bastion',
    matches: s => hasCompleted(s, 'quest-secops-01'),
  },
  {
    id: 'pipeline-mechanic',
    name: 'Механик пайплайнов',
    icon: '⚙️',
    desc: 'Собрать релизный пайплайн в Pipeline Plaza',
    matches: s => hasCompleted(s, 'quest-pipeline-01'),
  },
  {
    id: 'data-savior',
    name: 'Спаситель данных',
    icon: '💾',
    desc: 'Починить бэкапы в Storage Quay',
    matches: s => hasCompleted(s, 'quest-storage-01'),
  },
  {
    id: 'edge-tuner',
    name: 'Настройщик CDN',
    icon: '🌐',
    desc: 'Починить Edge-кэширование в Edge Refinery',
    matches: s => hasCompleted(s, 'quest-edge-01'),
  },
  {
    id: 'boss-slayer',
    name: 'Победитель Босса 1',
    icon: '🥊',
    desc: 'Восстановить БД после отказа (БОСС 1)',
    matches: s => hasCompleted(s, 'quest-warroom-01'),
  },
  {
    id: 'nightmare-survivor',
    name: 'Выживший в Nightmare',
    icon: '☠️',
    desc: 'Одолеть БОССА 2 в Incident War Room',
    matches: s => hasCompleted(s, 'quest-boss2-01'),
  },
  {
    id: 'zone-explorer',
    name: 'Исследователь города',
    icon: '🗺️',
    desc: 'Открыть 6 районов города',
    matches: s => s.unlockedZones.length >= 6,
  },
  {
    id: 'all-zones',
    name: 'Хранитель города',
    icon: '🏙️',
    desc: 'Открыть все районы',
    matches: s => s.unlockedZones.length >= 12,
  },
  {
    id: 'credit-tycoon',
    name: 'Кредитный магнат',
    icon: '💰',
    desc: 'Накопить 500 Compute Credits',
    matches: s => s.credits >= 500,
  },
  {
    id: 'uptime-perfect',
    name: 'Идеальный аптайм',
    icon: '💯',
    desc: 'Достигнуть SLA 100%',
    matches: s => s.sla >= 100,
  },
  {
    id: 'sphere-of-excellence',
    name: 'Мастер всех дисциплин',
    icon: '🏆',
    desc: 'Получить все бейджи зон',
    matches: s =>
      ['Container Optimizer L1', 'K8s Troubleshooter L1', 'PromQL Master L1', 'CI/CD Architect L1', 'NetOps Specialist L1']
        .every(name => hasBadge(s, name)),
  },
];