export interface MinigameDef {
  id: string;
  title: string;
  instructions: string;
  rounds: number;
  windowMs: number;
  speed: number;
  rewardBase: number;
}

export const MINIGAMES: Record<string, MinigameDef> = {
  'packet-catch': {
    id: 'packet-catch',
    title: 'Перехват пакетов',
    instructions: 'Нажимайте [Пробел] / кнопку, когда бегунок внутри зелёной зоны. 5 раундов.',
    rounds: 5,
    windowMs: 90,
    speed: 4.2,
    rewardBase: 25,
  },
  'uptime-jump': {
    id: 'uptime-jump',
    title: 'Скачок аптайма',
    instructions: 'Поймайте момент и остановите шкалу на 100% аптайма. Точность решает всё.',
    rounds: 3,
    windowMs: 55,
    speed: 3.4,
    rewardBase: 40,
  },
};

export const MINIGAME_LOCATION: Record<string, string> = {
  'packet-catch': 'network-crossroads',
  'uptime-jump': 'incident-war-room',
};