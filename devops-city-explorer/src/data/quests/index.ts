import type { QuestData } from './types';

export * from './types';

const questModules = import.meta.glob('./quest-*.json', { eager: true }) as Record<string, unknown>;

const byId: Record<string, QuestData> = {};
const byZone: Record<string, QuestData[]> = {};

for (const [, raw] of Object.entries(questModules)) {
  const quest = ((raw as { default?: QuestData }).default ?? raw) as QuestData;
  if (!quest?.id || !quest?.zone) continue;
  if (byId[quest.id]) continue;
  byId[quest.id] = quest;
  (byZone[quest.zone] ??= []).push(quest);
}

export const QUESTS: Record<string, QuestData> = byId;

export function getQuestById(id: string): QuestData | undefined {
  return byId[id];
}

export function getQuestsForZone(zoneId: string): QuestData[] {
  return byZone[zoneId] ?? [];
}