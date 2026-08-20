export interface NpcDef {
  id: string;
  displayName: string;
  zone: string;
  questId: string;
}

export const NPCS: Record<string, NpcDef> = {
  vasya: { id: 'vasya', displayName: 'Вася [Dev]', zone: 'docker-yard', questId: 'quest-docker-01' },
  elena: { id: 'elena', displayName: 'Елена [SRE]', zone: 'k8s-core', questId: 'quest-k8s-01' },
  boris: { id: 'boris', displayName: 'Борис [Sys]', zone: 'linux-suburbs', questId: 'quest-linux-01' },
  matvey: { id: 'matvey', displayName: 'Матвей [Git]', zone: 'git-bridge', questId: 'quest-git-01' },
  daria: { id: 'daria', displayName: 'Дарья [NetOps]', zone: 'network-crossroads', questId: 'quest-network-01' },
  igor: { id: 'igor', displayName: 'Игорь [Obs]', zone: 'observability-peak', questId: 'quest-obs-01' },
  artem: { id: 'artem', displayName: 'Артём [IaC/Cloud]', zone: 'cloud-valley', questId: 'quest-terraform-01' },
  siren: { id: 'siren', displayName: '🚨 Сирена [WarRoom]', zone: 'incident-war-room', questId: 'quest-warroom-01' },
  genadiy: { id: 'genadiy', displayName: 'Генадий [Pipeline]', zone: 'pipeline-plaza', questId: 'quest-pipeline-01' },
  katya: { id: 'katya', displayName: 'Катя [SecOps]', zone: 'secops-bastion', questId: 'quest-secops-01' },
  svetlana: { id: 'svetlana', displayName: 'Светлана [DBA]', zone: 'storage-quay', questId: 'quest-storage-01' },
  nikita: { id: 'nikita', displayName: 'Никита [DBA]', zone: 'storage-quay', questId: 'quest-storage-02' },
  toha: { id: 'toha', displayName: 'Тоха [Edge]', zone: 'edge-refinery', questId: 'quest-edge-01' },
  boss2: { id: 'boss2', displayName: '🤖 БОСС 2 [DB Outage]', zone: 'incident-war-room', questId: 'quest-boss2-01' },
};

export const NPC_QUESTS: Record<string, string> = Object.fromEntries(
  Object.values(NPCS).map(npc => [npc.id, npc.questId]),
);