import React, { useState } from 'react';
import { GameState, CITY_ZONES } from '../game/state';

interface JournalProps {
  gameState: GameState;
  onClose: () => void;
}

type TabType = 'quests' | 'zones' | 'badges';

const STATUS_ICONS: Record<string, string> = {
  completed: '✓',
  available: '◉',
  'in-progress': '▸',
  locked: '🔒',
};

const QUEST_TITLES: Record<string, string> = {
  'quest-linux-01': 'Найди утечку ресурсов',
  'quest-docker-01': 'Оптимизация гигантского Dockerfile',
  'quest-k8s-01': 'CrashLoopBackOff: Расследование',
};

const QUEST_ZONES: Record<string, string> = {
  'quest-linux-01': '🐧 Linux Suburbs',
  'quest-docker-01': '🐳 Docker Yard',
  'quest-k8s-01': '☸️ K8s Core District',
};

export const Journal: React.FC<JournalProps> = ({ gameState, onClose }) => {
  const [tab, setTab] = useState<TabType>('quests');

  const quests = Object.values(gameState.questProgress);
  const completedCount = quests.filter(q => q.status === 'completed').length;
  const unlockedZonesCount = gameState.unlockedZones.length;

  return (
    <div className="journal-overlay" onClick={onClose}>
      <div className="journal" onClick={e => e.stopPropagation()}>
        <div className="journal__header">
          <div className="journal__title">
            <span>📖 DevOps Journal</span>
          </div>
          <button className="quest-modal__close" onClick={onClose} title="Закрыть [Esc]">✕</button>
        </div>
        
        <div className="journal__body">
          <div className="journal__tabs">
            <button
              className={`journal__tab ${tab === 'quests' ? 'journal__tab--active' : ''}`}
              onClick={() => setTab('quests')}
            >
              Квесты ({completedCount}/{quests.length})
            </button>
            <button
              className={`journal__tab ${tab === 'zones' ? 'journal__tab--active' : ''}`}
              onClick={() => setTab('zones')}
            >
              🗺️ Карта зон ({unlockedZonesCount}/{CITY_ZONES.length})
            </button>
            <button
              className={`journal__tab ${tab === 'badges' ? 'journal__tab--active' : ''}`}
              onClick={() => setTab('badges')}
            >
              Бейджи ({gameState.badges.length})
            </button>
          </div>

          {/* Quests Tab */}
          {tab === 'quests' && (
            <div className="journal__quest-list">
              {quests.map(q => (
                <div key={q.questId} className="journal__quest-item">
                  <div className={`journal__quest-status journal__quest-status--${q.status}`}>
                    {STATUS_ICONS[q.status] || '?'}
                  </div>
                  <div className="journal__quest-info">
                    <div className="journal__quest-title">
                      {QUEST_TITLES[q.questId] || q.questId}
                    </div>
                    <div className="journal__quest-zone">
                      {QUEST_ZONES[q.questId] || 'Unknown Zone'}
                      {q.status === 'completed' && ' • ✓ Выполнено'}
                      {q.status === 'locked' && ' • 🔒 Требуется открыть зону'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Zones Tab */}
          {tab === 'zones' && (
            <div className="journal__zones-list">
              {CITY_ZONES.map(zone => {
                const isUnlocked = gameState.unlockedZones.includes(zone.id);
                return (
                  <div
                    key={zone.id}
                    className={`journal__zone-card ${isUnlocked ? 'journal__zone-card--unlocked' : 'journal__zone-card--locked'}`}
                  >
                    <div className="journal__zone-icon">{zone.icon}</div>
                    <div className="journal__zone-info">
                      <div className="journal__zone-header">
                        <span className="journal__zone-name">{zone.name}</span>
                        <span className={`journal__zone-badge ${isUnlocked ? 'journal__zone-badge--unlocked' : 'journal__zone-badge--locked'}`}>
                          {isUnlocked ? '🔓 Открыто' : '🔒 Заблокировано'}
                        </span>
                      </div>
                      <p className="journal__zone-desc">{zone.description}</p>
                      {!isUnlocked && zone.requiredBadgeName && (
                        <div className="journal__zone-req">
                          🔒 <strong>Условие:</strong> {zone.requiredBadgeName}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Badges Tab */}
          {tab === 'badges' && (
            gameState.badges.length > 0 ? (
              <div className="journal__badge-grid">
                {gameState.badges.map(b => (
                  <div key={b.id} className="journal__badge">
                    <div className="journal__badge-icon">🏅</div>
                    <div className="journal__badge-name">{b.name}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="journal__empty">
                Пока нет заработанных бейджей.<br />
                Завершайте квесты у NPC, чтобы получить награды и открыть закрытые районы города!
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
