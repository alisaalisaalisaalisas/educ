import React, { useState, useEffect, useCallback } from 'react';

interface DialogueData {
  avatar?: string;
  name?: string;
  npc?: string;
  lines?: string[];
  text?: string;
}

interface DialogueBoxProps {
  dialogue: DialogueData;
  onComplete: () => void;
  onClose: () => void;
}

const AVATAR_EMOJI: Record<string, string> = {
  vasya: '👨💻',
  elena: '👮♀️',
  boris: '🧙♂️',
  matvey: '🧢',
  matvey_smile: '🧢',
  daria: '👩💻',
  daria_focused: '👩💻',
  igor: '🔭',
  igor_glasses: '🔭',
  siren: '🚨',
  siren_alert: '🚨',
  arthur: '☁️',
};

const ROLE_LABELS: Record<string, string> = {
  vasya: 'Junior Developer',
  elena: 'SRE / Security Auditor',
  boris: 'Senior Sysadmin',
  matvey: 'Git & CI/CD Lead',
  matvey_smile: 'Git & CI/CD Lead',
  daria: 'NetOps Engineer',
  daria_focused: 'NetOps Engineer',
  igor: 'Observability SRE',
  igor_glasses: 'Observability SRE',
  siren: 'Incident Commander',
  siren_alert: 'Incident Commander',
  arthur: 'Cloud & IaC Architect',
};

export const DialogueBox: React.FC<DialogueBoxProps> = ({ dialogue, onComplete, onClose }) => {
  // Normalize dialogue lines
  const lines: string[] = React.useMemo(() => {
    if (dialogue.lines && Array.isArray(dialogue.lines) && dialogue.lines.length > 0) {
      return dialogue.lines;
    }
    if (dialogue.text) {
      // Split long text by sentences or punctuation for comfortable RPG dialogue reading
      const parts = dialogue.text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g);
      if (parts && parts.length > 0) {
        return parts.map(p => p.trim()).filter(Boolean);
      }
      return [dialogue.text];
    }
    return ['Привет! Готов приступить к заданию?'];
  }, [dialogue]);

  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const currentLine = lines[lineIndex] || '';
  const displayedText = currentLine.slice(0, charIndex);
  const isLastLine = lineIndex >= lines.length - 1;

  const avatarKey = (dialogue.avatar || 'vasya').toLowerCase();
  const speakerName = dialogue.name || dialogue.npc || 'Инженер';
  const roleLabel = ROLE_LABELS[avatarKey] || 'DevOps Specialist';
  const avatarEmoji = AVATAR_EMOJI[avatarKey] || '🤖';

  useEffect(() => {
    setLineIndex(0);
    setCharIndex(0);
    setIsTyping(true);
  }, [dialogue]);

  useEffect(() => {
    if (!isTyping) return;
    if (charIndex >= currentLine.length) {
      setIsTyping(false);
      return;
    }
    const timer = setTimeout(() => {
      setCharIndex(prev => prev + 1);
    }, 20);
    return () => clearTimeout(timer);
  }, [charIndex, currentLine, isTyping]);

  const handleAdvance = useCallback(() => {
    if (isTyping) {
      setCharIndex(currentLine.length);
      setIsTyping(false);
      return;
    }
    if (isLastLine) {
      onComplete();
    } else {
      setLineIndex(prev => prev + 1);
      setCharIndex(0);
      setIsTyping(true);
    }
  }, [isTyping, isLastLine, currentLine, onComplete]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        handleAdvance();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleAdvance, onClose]);

  return (
    <div className="dialogue-overlay" onClick={handleAdvance}>
      <div className="dialogue-box" onClick={e => e.stopPropagation()}>
        <div className="dialogue-box__header">
          <div className="dialogue-box__avatar">
            {avatarEmoji}
          </div>
          <div>
            <div className="dialogue-box__name">{speakerName}</div>
            <div className="dialogue-box__role">{roleLabel}</div>
          </div>
        </div>
        <div className="dialogue-box__text">
          {displayedText}
          {isTyping && <span className="typing-cursor" />}
        </div>
        <div className="dialogue-box__actions">
          <button className="dialogue-box__btn dialogue-box__btn--secondary" onClick={onClose}>
            Закрыть [Esc]
          </button>
          <button className="dialogue-box__btn dialogue-box__btn--primary" onClick={handleAdvance}>
            {isTyping ? 'Пропустить' : isLastLine ? 'Начать задание ▸' : 'Далее ▸'}
          </button>
        </div>
      </div>
    </div>
  );
};
