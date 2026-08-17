import React from 'react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="help-overlay" onClick={onClose}>
      <div className="help-modal" onClick={e => e.stopPropagation()}>
        <div className="help-modal__header">
          <div className="help-modal__title-group">
            <span className="help-modal__tag">🚀 Справочник инженера</span>
            <h2 className="help-modal__title">DevOps City Explorer: Руководство</h2>
          </div>
          <button className="quest-modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="help-modal__body">
          {/* Controls section */}
          <div className="help-section">
            <h3 className="help-section__title">🕹️ Управление</h3>
            <div className="help-controls-grid">
              <div className="help-control-item">
                <div className="key-badges">
                  <span className="key-badge">W</span>
                  <span className="key-badge">A</span>
                  <span className="key-badge">S</span>
                  <span className="key-badge">D</span>
                  <span className="key-divider">или</span>
                  <span className="key-badge">↑</span>
                  <span className="key-badge">←</span>
                  <span className="key-badge">↓</span>
                  <span className="key-badge">→</span>
                </div>
                <div className="help-control-label">Перемещение персонажа по городу</div>
              </div>

              <div className="help-control-item">
                <div className="key-badges">
                  <span className="key-badge key-badge--highlight">E</span>
                </div>
                <div className="help-control-label">Взаимодействие с NPC, терминалами и шлюзами</div>
              </div>

              <div className="help-control-item">
                <div className="key-badges">
                  <span className="key-badge">Esc</span>
                </div>
                <div className="help-control-label">Закрыть текущее модальное окно или диалог</div>
              </div>
            </div>
          </div>

          {/* Core HUD mechanics */}
          <div className="help-section">
            <h3 className="help-section__title">📊 Механики и Интерфейс</h3>
            <div className="help-cards-grid">
              <div className="help-card">
                <div className="help-card__header">
                  <span className="help-card__icon">📈</span>
                  <strong>System Uptime / SLA (Здоровье)</strong>
                </div>
                <p>
                  Ваш главный инженерный показатель. Стартует со <strong>99.99%</strong>. 
                  При верных решениях растет до 100%, повышая ваш ранг.
                </p>
              </div>

              <div className="help-card">
                <div className="help-card__header">
                  <span className="help-card__icon">⚡</span>
                  <strong>Compute Credits (Валюта)</strong>
                </div>
                <p>
                  Начисляются за успешное решение квестов и оптимизацию манифестов.
                </p>
              </div>

              <div className="help-card">
                <div className="help-card__header">
                  <span className="help-card__icon">🔒</span>
                  <strong>Шлюзы закрытых зон</strong>
                </div>
                <p>
                  Северные районы (K8s Core, Observability Peak) закрыты лазерными барьерами. 
                  Решайте квесты в открытых зонах, чтобы получить бейджи допуска!
                </p>
              </div>

              <div className="help-card">
                <div className="help-card__header">
                  <span className="help-card__icon">📖</span>
                  <strong>DevOps Journal (Дневник)</strong>
                </div>
                <p>
                  Хранит список выполненных задач, заработанные бейджи и карту доступности зон города.
                </p>
              </div>
            </div>
          </div>

          {/* Quick tips */}
          <div className="help-section">
            <h3 className="help-section__title">💡 Советы новичку</h3>
            <ul className="help-tips-list">
              <li>
                🎯 <strong>Следите за виджетом цели</strong> в центре верхней панели — он подскажет, к какому NPC идти прямо сейчас.
              </li>
              <li>
                🔍 <strong>Внимательно читайте теорию</strong> внутри каждого квеста перед написанием кода.
              </li>
              <li>
                💡 Если застряли — нажмите кнопку <strong>«💡 Показать подсказку»</strong> в редакторе квеста.
              </li>
              <li>
                👔 Для рекрутеров и тимлидов предусмотрена кнопка <strong>«👔 Режим Рекрутера»</strong> для мгновенного обзора всех решений.
              </li>
            </ul>
          </div>
        </div>

        <div className="help-modal__footer">
          <button className="help-modal__btn" onClick={onClose}>
            Вперёд в город! ▸
          </button>
        </div>
      </div>
    </div>
  );
};
