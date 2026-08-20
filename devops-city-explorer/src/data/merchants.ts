export interface ShopItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  icon: string;
  effect: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'potion-stamina',
    name: 'Стабилизатор SLA',
    desc: 'Восстанавливает SLA на 1.0% (разовый бонус к инцидентам)',
    price: 50,
    icon: '🛠️',
    effect: 'sla+1',
  },
  {
    id: 'token-refresh',
    name: 'Токен быстрой развёртки',
    desc: 'Открывает случайный недоступный ещё район (одноразово)',
    price: 150,
    icon: '🔑',
    effect: 'unlock-random',
  },
  {
    id: 'coffee-case',
    name: 'Case кофе для команды',
    desc: 'До +20 Compute Credits к следующему завершённому квесту',
    price: 80,
    icon: '☕',
    effect: 'next-quest+20',
  },
  {
    id: 'backup-drive',
    name: 'Резервный диск 4TB',
    desc: 'Страховка: воскрешает после «падения» сервера без потери SLA',
    price: 200,
    icon: '💽',
    effect: 'insure',
  },
  {
    id: 'monitor-4k',
    name: 'Монитор 4K (4 шт.)',
    desc: 'Постоянный +0.15% SLA при работе в любом дата-центре',
    price: 90,
    icon: '🖥️',
    effect: 'perk',
  },
];

export const SHOP_ZONES: Record<string, string[]> = {
  'network-crossroads': ['potion-stamina', 'token-refresh', 'monitor-4k'],
  'pipeline-plaza': ['coffee-case', 'backup-drive', 'token-refresh'],
};