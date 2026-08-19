# 📜 Docs-as-Code Guide: Создание Интерактивных Квестов

> **Руководство разработчика по созданию и расширению обучающего контента в парадигме Docs-as-Code**

---

## 🌟 1. Концепция Docs-as-Code

В **DevOps City Explorer** все задания, теоретические материалы, диалоги NPC и правила валидации хранятся в виде **декларативных JSON/YAML манифестов** в папке `src/data/quests/`.

Это позволяет:
- Добавлять новые темы (Prometheus, Ceph, Istio, Terraform) без изменения кода движка.
- Проверять корректность манифестов в CI/CD пайплайнах с помощью schema-валидаторов.
- Хранить документацию и интерактивные сценарии рядом с кодом приложения.

---

## 📐 2. Спецификация Схемы Квеста (Quest Schema)

Каждый квест представляет собой JSON-документ следующей структуры:

```json
{
  "id": "quest-unique-id",
  "zone": "zone-id",
  "title": "Понятное название задания",
  "category": "Containers | Orchestration | Linux | Automation | Monitoring | Cloud & IaC",
  "difficulty": "Easy | Medium | Hard",
  "reward": {
    "slaBonus": 0.05,
    "credits": 150,
    "badge": "Название полученного бейджа"
  },
  "npc": "npc_identifier",
  "dialogue": {
    "avatar": "npc_avatar_key",
    "name": "Отображаемое имя NPC",
    "lines": [
      "Первая реплика диалога...",
      "Вторая реплика с описанием проблемы..."
    ]
  },
  "document": {
    "title": "Теоретическая статья для DevOps Journal",
    "theory": "Подробный Markdown с объяснением концепций и Best Practices..."
  },
  "challenge": {
    "type": "code-fix | terminal",
    "language": "dockerfile | yaml | bash | hcl | sql",
    "initialCode": "Стартовый код с ошибкой или заглушкой...",
    "validation": [
      {
        "pattern": "RegEx_шаблон_проверки",
        "message": "Сообщение об ошибке, если паттерн не найден"
      }
    ],
    "hints": [
      "Подсказка 1",
      "Подсказка 2"
    ],
    "solutionExample": "Эталонный пример решения"
  }
}
```

---

## 🧩 3. Поддерживаемые Типы Заданий

### 1. `code-fix` (Monaco Editor)
Игрок редактирует конфигурационный файл в редакторе Monaco (с подсветкой синтаксиса YAML, HCL, Dockerfile, Nginx).
- **Применение:** Оптимизация Dockerfile, написание K8s манифестов, настройка Ingress, Terraform-модули.
- **Валидация:** Набор регулярных выражений, проверяющих ключевые директивы конфигурации.

### 2. `terminal` (Xterm.js Mock CLI)
Игрок выполняет диагностические команды в терминале и вводит итоговую команду починки.
- **Применение:** Поиск OOM Killer в `dmesg`, проверка открытых дескрипторов `lsof`, завершение зависших процессов `kill -15`, управление службами через `systemctl`.

---

## 🛠️ 4. Пошаговый алгоритм добавления нового квеста

1. **Создайте манифест квеста:**
   Создайте файл `src/data/quests/quest-<topic>-<num>.json`.

2. **Зарегистрируйте квест в App.tsx:**
   ```typescript
   import questMyTopic from './data/quests/quest-mytopic-01.json';
   
   const QUESTS: Record<string, any> = {
     ...
     'quest-mytopic-01': questMyTopic,
   };
   ```

3. **Свяжите квест с NPC или зоной:**
   В `App.tsx` добавьте запись в `NPC_QUESTS` или `zoneQuests`:
   ```typescript
   const NPC_QUESTS = {
     ...
     my_npc: 'quest-mytopic-01',
   };
   ```

4. **Добавьте квест в состояние прогресса:**
   В `src/game/state.ts` добавьте начальный статус в `defaultState.questProgress`.

5. **Проверьте валидацию:**
   Запустите `npm run build` для проверки типов и структуры JSON.
