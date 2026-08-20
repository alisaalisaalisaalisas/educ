import React from 'react';
import { SignDef } from '../data/signs';

interface SignModalProps {
  sign: SignDef;
  onClose: () => void;
}

export const SignModal: React.FC<SignModalProps> = ({ sign, onClose }) => {
  return (
    <div className="quest-overlay">
      <div className="quest-modal sign-modal">
        <div className="quest-modal__header">
          <div className="quest-modal__title-group">
            <span className="quest-modal__category" style={{ color: sign.color }}>
              {sign.icon} {sign.title}
            </span>
            <span className="quest-modal__title">Информационный щит</span>
          </div>
          <button className="quest-modal__close" onClick={onClose} title="Закрыть">✕</button>
        </div>
        <div className="sign-modal__body">
          {sign.lines.map((line, i) => (
            <p key={i} className="sign-modal__line">{line}</p>
          ))}
        </div>
        <div className="quest-modal__footer">
          <button className="quest-modal__submit" onClick={onClose}>Понятно ▸</button>
        </div>
      </div>
    </div>
  );
};