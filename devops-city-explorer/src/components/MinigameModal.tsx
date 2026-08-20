import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MinigameDef } from '../data/minigames';

interface MinigameModalProps {
  game: MinigameDef;
  onFinish: (score: number, perfect: boolean) => void;
  onClose: () => void;
}

const TRACK_W = 440;

export const MinigameModal: React.FC<MinigameModalProps> = ({ game, onFinish, onClose }) => {
  const [round, setRound] = useState(1);
  const [marker, setMarker] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [over, setOver] = useState(false);
  const [lastShift, setLastShift] = useState(0);
  const directionRef = useRef(1);

  const windowSize = (game.windowMs / 1000) * game.speed;

  useEffect(() => {
    if (over) return;
    const interval = setInterval(() => {
      setMarker(prev => {
        let next = prev + game.speed * directionRef.current;
        if (next > TRACK_W - 20) { next = TRACK_W - 20; directionRef.current = -1; }
        if (next < 0) { next = 0; directionRef.current = 1; }
        return next;
      });
    }, 16);
    return () => clearInterval(interval);
  }, [over, game.speed]);

  const center = TRACK_W / 2;
  const success = marker >= center - windowSize && marker <= center + windowSize;

  const fire = useCallback(() => {
    if (over) return;
    setLastShift(Math.abs(marker - center));
    const hit = success;
    const nextResults = [...results, hit];
    setResults(nextResults);
    if (round >= game.rounds) {
      setOver(true);
      setTimeout(() => {
        const score = nextResults.filter(Boolean).length;
        onFinish(score, score === game.rounds);
      }, 700);
    } else {
      setRound(r => r + 1);
    }
  }, [marker, center, success, over, round, results, game.rounds, onFinish]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        fire();
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [fire, onClose]);

  const perfectCount = results.filter(Boolean).length;

  return (
    <div className="quest-overlay">
      <div className="quest-modal minigame-modal" onClick={e => e.stopPropagation()}>
        <div className="quest-modal__header">
          <div className="quest-modal__title-group">
            <span className="quest-modal__category">🕹️ {game.title}</span>
            <span className="quest-modal__title">Раунд {round}/{game.rounds}</span>
          </div>
          <button className="quest-modal__close" onClick={onClose} title="Закрыть">✕</button>
        </div>
        <div className="minigame-modal__instructions">{game.instructions}</div>

        {over ? (
          <div className="quest-success">
            <div className="quest-success__icon">{perfectCount === game.rounds ? '🏆' : '📡'}</div>
            <div className="quest-success__title">
              {perfectCount === game.rounds ? 'Идеальный перехват!' : 'Сессия завершена'}
            </div>
            <div className="quest-success__rewards">
              <span>✅ Поймано: {perfectCount}/{game.rounds}</span>
              <span>⚡ Награда: +{perfectCount * game.rewardBase} Credits</span>
            </div>
          </div>
        ) : (
          <>
            <div className="minigame-modal__track"
              style={{ width: TRACK_W }}>
              <div className="minigame-modal__target" style={{
                left: center - windowSize,
                width: windowSize * 2,
              }} />
              <div className="minigame-modal__marker" style={{ left: marker }} />
            </div>

            {lastShift > 0 && (
              <div className={`minigame-modal__feedback ${success ? 'minigame-modal__feedback--hit' : 'minigame-modal__feedback--miss'}`}>
                {success ? '✓ Перехвачено!' : '✗ Мимо шириной ' + Math.round(lastShift) + 'px'}
              </div>
            )}

            <div className="minigame-modal__stats">
              {results.map((r, i) => (
                <span key={i} className={r ? 'minigame-modal__dot--good' : 'minigame-modal__dot--bad'}>
                  {r ? '✓' : '✗'}
                </span>
              ))}
            </div>

            <div className="quest-modal__footer">
              <span className="quest-modal__reward-item">Нажмите [Пробел] или кнопку для остановки</span>
              <button className="quest-modal__submit" onClick={fire}>Поймать пакет ▸</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};