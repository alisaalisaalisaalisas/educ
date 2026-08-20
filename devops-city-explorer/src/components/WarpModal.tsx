import React from 'react';
import { WARP_DESTS, WarpDest } from '../data/warps';

interface WarpModalProps {
  unlockedZones: string[];
  currentZone: string;
  onWarp: (dest: WarpDest) => void;
  onClose: () => void;
}

export const WarpModal: React.FC<WarpModalProps> = ({ unlockedZones, currentZone, onWarp, onClose }) => {
  const dests = WARP_DESTS.filter(d => unlockedZones.includes(d.zoneId));

  return (
    <div className="quest-overlay">
      <div className="quest-modal quest-modal--wide warp-modal">
        <div className="quest-modal__header">
          <div className="quest-modal__title-group">
            <span className="quest-modal__category">🚀 Teleport Hub</span>
            <span className="quest-modal__title">Выберите пункт назначения</span>
          </div>
          <button className="quest-modal__close" onClick={onClose} title="Закрыть">✕</button>
        </div>
        <div className="warp-modal__grid">
          {dests.map(dest => (
            <button
              key={dest.zoneId}
              className={`warp-modal__dest ${dest.zoneId === currentZone ? 'warp-modal__dest--current' : ''}`}
              onClick={() => onWarp(dest)}
              disabled={dest.zoneId === currentZone}
            >
              <span className="warp-modal__dest-icon">{dest.icon}</span>
              <span className="warp-modal__dest-name">{dest.name}</span>
              {dest.zoneId === currentZone && <span className="warp-modal__dest-here">вы здесь</span>}
            </button>
          ))}
        </div>
        <div className="shop-modal__credits">
          Доступны только открытые районы. Открывайте новые — через квесты!
        </div>
        <div className="quest-modal__footer">
          <button className="quest-modal__submit" onClick={onClose}>Закрыть ▸</button>
        </div>
      </div>
    </div>
  );
};