export interface WarpDest {
  zoneId: string;
  name: string;
  icon: string;
  x: number;
  y: number;
}

export const WARP_DESTS: WarpDest[] = [
  { zoneId: 'linux-suburbs', name: 'Центр города', icon: '🐧', x: 10 * 32, y: 22 * 32 },
  { zoneId: 'git-bridge', name: 'Git Bridge', icon: '🌉', x: 20 * 32, y: 14 * 32 },
  { zoneId: 'docker-yard', name: 'Docker Yard', icon: '🐳', x: 8 * 32, y: 5 * 32 },
  { zoneId: 'network-crossroads', name: 'Network Crossroads', icon: '🌐', x: 30 * 32, y: 23 * 32 },
  { zoneId: 'k8s-core', name: 'K8s Core', icon: '☸️', x: 20 * 32, y: 4 * 32 },
  { zoneId: 'observability-peak', name: 'Observability Peak', icon: '📊', x: 33 * 32, y: 6 * 32 },
  { zoneId: 'cloud-valley', name: 'Cloud Valley', icon: '☁️', x: 35 * 32, y: 10 * 32 },
  { zoneId: 'incident-war-room', name: 'War Room', icon: '🚨', x: 33 * 32, y: 8 * 32 },
  { zoneId: 'pipeline-plaza', name: 'Pipeline Plaza', icon: '⚙️', x: 56 * 32, y: 2 * 32 },
  { zoneId: 'secops-bastion', name: 'SecOps Bastion', icon: '🔐', x: 46 * 32, y: 3 * 32 },
  { zoneId: 'storage-quay', name: 'Storage Quay', icon: '💾', x: 50 * 32, y: 27 * 32 },
  { zoneId: 'edge-refinery', name: 'Edge Refinery', icon: '🌐', x: 56 * 32, y: 16 * 32 },
];

export const WARP_STATION = {
  id: 'warp-hub',
  name: 'Телепорт-хаб ЦКП',
  x: 18 * 32,
  y: 18 * 32,
};