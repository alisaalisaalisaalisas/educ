# 🏗️ Архитектурное Руководство: Deep Dive в DevOps City Explorer

> **Технический документ архитектуры гибридного приложения Phaser 3 ↔ React 18 ↔ TypeScript**

---

## 🌟 1. Обзор Архитектуры и Ключевые Принципы

**DevOps City Explorer** — это современная гибридная платформа, объединяющая высокопроизводительный Canvas-рендеринг игрового 2D-мира (Phaser 3) с декларативным реактивным пользовательским интерфейсом (React 18), встроенным терминалом (`xterm.js`) и редактором кода (`Monaco Editor`).

### Архитектурные принципы:
1. **Разделение ответственности (Separation of Concerns):** Игровой движок Phaser отвечает исключительно за отрисовку карты, физику коллизий, спрайты и интерполяцию движения. React отвечает за оверлеи (HUD, модальные окна, терминал, редактор, квесты).
2. **Event-Driven Mediator (GameBridge):** Изолированный двунаправленный мост между React и Canvas-слоем. Phaser не знает о состоянии компонентов React, а React не обращается напрямую к DOM Canvas-элемента.
3. **Zero-Latency Offline State:** Полная поддержка автономной работы без обязательного внешнего бэкенда через реактивный `GameStateManager` и персистентность в `localStorage`.

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                             REACT 18 UI LAYER                          │
 │  ┌──────────────┐ ┌───────────────┐ ┌──────────────┐ ┌──────────────┐  │
 │  │   HUD.tsx    │ │  Journal.tsx  │ │ QuestModal   │ │ RecruiterUI  │  │
 │  └───────┬──────┘ └───────┬───────┘ └──────┬───────┘ └──────┬───────┘  │
 └──────────┼────────────────┼────────────────┼────────────────┼──────────┘
            │                │                │                │
            ▼                ▼                ▼                ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                     GAME BRIDGE (EVENT MEDIATOR)                       │
 │  - Subscriptions: onPlayerState, onInteraction, emitAction             │
 │  - Custom Events: 'player-moved', 'zone-trigger', 'quest-completed'   │
 └──────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                   PHASER 3 ENGINE (CANVAS 2D LAYER)                    │
 │  ┌─────────────────────────┐             ┌──────────────────────────┐  │
 │  │ BootScene (Asset Gen)   │             │ CityScene (World Model)  │  │
 │  │ - Procedural Textures   │ ──────────► │ - Tilemap 40x30 Matrix   │  │
 │  │ - Sprite Generation     │             │ - Arcade Colliders & GID │  │
 │  └─────────────────────────┘             └──────────────────────────┘  │
 └────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 2. Паттерн Bridge (Связка Phaser ↔ React)

В файле `GameBridge.ts` реализован паттерн **Медиатор / Мост**:

```typescript
export class GameBridge {
  private game: Phaser.Game | null = null;
  private interactionListeners: ((e: InteractionEvent) => void)[] = [];
  private playerStateListeners: ((s: PlayerState) => void)[] = [];

  // Запуск игры в контейнере div#game-canvas
  start(containerId: string) { ... }

  // Подписка UI React на события перемещения игрока
  onPlayerState(callback: (state: PlayerState) => void) {
    this.playerStateListeners.push(callback);
  }

  // Оповещение UI об открытии диалога или терминала
  notifyInteraction(event: InteractionEvent) {
    this.interactionListeners.forEach(fn => fn(event));
  }
}
```

### Модель жизненного цикла (Lifecycle):
1. **Mounting:** В `App.tsx` хук `useEffect` инициализирует экземпляр `GameBridge` и монтирует Canvas в DOM.
2. **Tick Sync:** На каждом кадре `CityScene.update()` вычисляет координаты игрока и с частотой ~60 FPS отправляет `PlayerState` подписчикам через `bridge.notifyPlayerState()`.
3. **Trigger Event:** При приближении к NPC или терминалу и нажатии клавиши `E`, Phaser эмитит событие взаимодействия, React переключает экран в модальный режим (`setScreen('dialogue')`), автоматически приостанавливая управление персонажем.

---

## 💾 3. Управление Состоянием (State Manager & Pub/Sub)

В `state.ts` реализован реактивный синглтон `gameState`:

```typescript
export interface GameState {
  sla: number;                                // System Uptime (99.99%)
  credits: number;                            // Награда в Cloud Credits
  currentZone: string;                        // Текущая зона города
  questProgress: Record<string, QuestProgress>;// Статусы заданий
  badges: Badge[];                            // Полученные бейджи
  journalEntries: string[];                   // Записи в инженерном журнале
  unlockedZones: string[];                    // Доступные районы
}
```

### Особенности:
- **Изолированный Pub/Sub:** Любой компонент React или сцена Phaser может вызвать `gameState.subscribe(handler)` и моментально получать снапшоты при изменении прогресса.
- **Декларативное открытие зон:** Завершение квеста (например, `quest-docker-01`) триггерит снятие силового барьера в `k8s-core`, деактивирует лазерную преграду на мосту и переводит статус следующего квеста в `available`.

---

## 📐 4. Модель Рендеринга и Физика Arcade

### Координатная сетка и тайлы:
- Город представляет собой матрицу **40 × 30 тайлов** размером **32 × 32 пикселя** (суммарное разрешение мира: **1280 × 960 px**).
- Дисплей адаптируется под любой экран с помощью конфигурации `scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }`.

### Процедурная генерация спрайтов в рантайме:
Чтобы исключить зависимость от внешних PNG-файлов и обеспечить 100% работу офлайн, `BootScene.ts` генерирует все текстуры процедурно через Phaser `Graphics API`:
- Анимированный персонаж DevOps-инженера с ноутбуком в руках (4 направления движения).
- NPC со значками ролей (Dev, SRE, Sysadmin, NetOps, Cloud Architect).
- Тайлы дорог, травы, серверных стоек, морских контейнеров, реки и светящихся терминалов.

---

## 🛡️ 5. Безопасность и Валидация

1. **Изоляция исполнения кода:** Все квесты валидируются локально с использованием декларативных правил и регулярных выражений без вызова ненадежных внешних `eval()` или `Function()` конструкций.
2. **DOM-изоляция:** Текстовый ввод в Monaco и Xterm изолирован от игрового канваса, предотвращая перехват фокуса и случайные нажатия клавиш движения WASD во время ввода команд.
