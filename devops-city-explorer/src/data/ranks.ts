export interface RankDef {
  id: string;
  name: string;
  icon: string;
  minQuests: number;
  desc: string;
}

export const RANKS: RankDef[] = [
  { id: 'junior', name: 'Стажёр DevOps', icon: '🌱', minQuests: 0, desc: 'Начало пути: первые квесты и знакомство с городом' },
  { id: 'engineer', name: 'DevOps Инженер', icon: '🛠️', minQuests: 2, desc: 'Классические задачи: контейнеры, сеть, CI/CD' },
  { id: 'senior', name: 'Senior DevOps', icon: '⚙️', minQuests: 5, desc: 'Сложные инциденты и распределённые системы' },
  { id: 'lead', name: 'Lead DevOps', icon: '🏗️', minQuests: 8, desc: 'Архитектура релизов и управление инцидентами' },
  { id: 'commander', name: 'Incident Commander', icon: '🚀', minQuests: 10, desc: 'Все зоны открыты, все боссы повержены' },
];

export function getRankByQuests(completedQuests: number): RankDef {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (completedQuests >= r.minQuests) rank = r;
  }
  return rank;
}

export function getNextRank(current: RankDef): RankDef | undefined {
  const idx = RANKS.findIndex(r => r.id === current.id);
  return RANKS[idx + 1];
}