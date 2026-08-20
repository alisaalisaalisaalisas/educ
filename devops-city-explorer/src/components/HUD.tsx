import React from 'react';
import { CITY_ZONES } from '../game/state';
import { ZONE_LABELS } from '../data/zones';
import { RankDef } from '../data/ranks';

interface HUDProps {
  sla: number;
  credits: number;
  currentZone: string;
  isCurrentZoneUnlocked: boolean;
  objective: string;
  nearInteractive: boolean;
  rank: RankDef;
  rankProgress: number;
  nextRankQuests?: number;
  onOpenJournal: () => void;
  onOpenHelp: () => void;
  onOpenRecruiter: () => void;
  onToggleFullscreen: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  sla,
  credits,
  currentZone,
  isCurrentZoneUnlocked,
  objective,
  nearInteractive,
  rank,
  rankProgress,
  nextRankQuests,
  onOpenJournal,
  onOpenHelp,
  onOpenRecruiter,
  onToggleFullscreen,
}) => {
  const slaClass = sla >= 99.9 ? 'good' : sla >= 99 ? 'warning' : 'critical';
  const slaColor = sla >= 99.9 ? 'var(--accent-green)' : sla >= 99 ? 'var(--accent-amber)' : 'var(--accent-red)';

  const zoneInfo = CITY_ZONES.find(z => z.id === currentZone);

  return (
    <>
      <header className="hud">
        {/* Left: SLA & Credits & Zone */}
        <div className="hud-left">
          <div className="sla-meter" title="Показатель доступности системы (ваше здоровье в игре)">
            <div className="sla-meter__label">System Uptime / SLA</div>
            <div className={`sla-meter__value sla-meter__value--${slaClass}`}>
              {sla.toFixed(2)}%
            </div>
            <div className="sla-meter__bar">
              <div
                className="sla-meter__bar-fill"
                style={{ width: `${sla}%`, background: slaColor }}
              />
            </div>
          </div>

          <div className="credits-display" title="Compute Credits: начисляются за выполненные квесты">
            <span className="credits-display__icon">⚡</span>
            <span className="credits-display__value">{credits}</span>
          </div>

          <div
            className="rank-chip"
            title={`Ваш ранг: ${rank.name}. ${nextRankQuests !== undefined ? `До следующего ранга — ещё ${Math.max(0, nextRankQuests - rankProgress)} квестов.` : 'Вы достигли максимального ранга!'}`}
          >
            <span className="rank-chip__icon">{rank.icon}</span>
            <span className="rank-chip__name">{rank.name}</span>
            {nextRankQuests !== undefined && (
              <span className="rank-chip__progress">{Math.min(rankProgress, nextRankQuests)}/{nextRankQuests}</span>
            )}
          </div>

          <div className="zone-indicator" title={zoneInfo?.description || currentZone}>
            <span className="zone-indicator__status">
              {isCurrentZoneUnlocked ? '🔓' : '🔒'}
            </span>
            <span className="zone-indicator__name">
              {ZONE_LABELS[currentZone] || currentZone}
            </span>
          </div>
        </div>

        {/* Center: Objective / Goal Tracker */}
        <div className="hud-center">
          <div className="objective-widget" title="Ваша текущая задача в городе">
            <span className="objective-widget__icon">🎯</span>
            <div className="objective-widget__content">
              <span className="objective-widget__label">Текущая цель:</span>
              <span className="objective-widget__text">{objective}</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="hud-right">
          <button
            className="hud-btn hud-btn--recruiter"
            onClick={onOpenRecruiter}
            title="Матрица навыков и готовые решения для рекрутеров и техлидов"
          >
            <span className="hud-btn__icon">👔</span>
            <span className="hud-btn__text">Рекрутеру</span>
          </button>

          <button
            className="hud-btn"
            onClick={onOpenHelp}
            title="Справка по управлению и механикам игры (F1)"
          >
            <span className="hud-btn__icon">❓</span>
            <span className="hud-btn__text">Обучение</span>
          </button>

          <button
            className="hud-btn"
            onClick={onOpenJournal}
            title="Дневник инженера: список квестов, бейджи и карта зон"
          >
            <span className="hud-btn__icon">📖</span>
            <span className="hud-btn__text">Дневник</span>
          </button>

          <button
            className="hud-btn hud-btn--icon-only"
            onClick={onToggleFullscreen}
            title="Полноэкранный режим"
          >
            <span className="hud-btn__icon">⛶</span>
          </button>
        </div>
      </header>

      {/* Proximity Interaction Prompt */}
      {nearInteractive && (
        <div className="interaction-prompt">
          <div className="interaction-prompt__content">
            <span className="interaction-prompt__key">E</span>
            <span className="interaction-prompt__text">Взаимодействовать</span>
          </div>
        </div>
      )}
    </>
  );
};
