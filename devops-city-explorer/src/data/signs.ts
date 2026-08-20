export interface SignDef {
  id: string;
  title: string;
  icon: string;
  color: string;
  lines: string[];
}

export const SIGNS: Record<string, SignDef> = {
  'sign-pipeline': {
    id: 'sign-pipeline',
    title: 'PIPELINE PLAZA',
    icon: '⚙️',
    color: '#22d3ee',
    lines: [
      'Центр сборки артефактов. Каждая стадия — как кирпич в стене релиза.',
      'Помните: checkout → test → build → scan → publish.',
      'Генадий выдаст задание по порядку стадий пайплайна.',
    ],
  },
  'sign-secops': {
    id: 'sign-secops',
    title: 'SECOPS BASTION',
    icon: '🔐',
    color: '#f472b6',
    lines: [
      'Безопасность — это процесс, а не чекбокс.',
      'Секреты — в secrets manager, TLS 1.0 — в утиль.',
      'Катя проверит, усвоил ли ты базовые правила харденинга.',
    ],
  },
  'sign-storage': {
    id: 'sign-storage',
    title: 'STORAGE QUAY',
    icon: '💾',
    color: '#a78bfa',
    lines: [
      'Причал хранения данных: бэкапы, диски, миграции.',
      'Бэкап, который нельзя восстановить, — не бэкап.',
      'Светлана и Никита ждут специалиста по данным.',
    ],
  },
  'sign-edge': {
    id: 'sign-edge',
    title: 'EDGE REFINERY',
    icon: '🌐',
    color: '#fb923c',
    lines: [
      'Пограничная оптимизация: CDN, кэши, rate-limiting, гео-балансировка.',
      'Статику — кэшировать на год, HTML — на минуты.',
      'Тоха ищет инженера, который поднимет hit-ratio кэша.',
    ],
  },
  'sign-warhub': {
    id: 'sign-warhub',
    title: 'ТЕЛЕПОРТ-ХАБ',
    icon: '🚀',
    color: '#22d3ee',
    lines: [
      'Быстрое перемещение между открытыми районами города.',
      'Доступны только те районы, которые уже открыты.',
      'Нажмите [E] у станции, чтобы выбрать пункт назначения.',
    ],
  },
};

export const SIGNS_LOCATION: Record<string, [number, number, string]> = {
  'sign-pipeline': [58 * 32 + 16, 7 * 32 + 16, 'sign-icon'],
  'sign-secops': [51 * 32 + 16, 8 * 32 + 16, 'sign-icon'],
  'sign-storage': [53 * 32 + 16, 25 * 32 + 16, 'sign-icon'],
  'sign-edge': [52 * 32 + 16, 21 * 32 + 16, 'sign-icon'],
  'sign-warhub': [18 * 32, 20 * 32, 'sign-icon'],
};