import React, { useState, useEffect, useCallback } from 'react';

interface DialogueData {
  avatar: string;
  name: string;
  lines: string[];
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
};

const ROLE_LABELS: Record<string, string> = {
  vasya: 'Junior Developer',
  elena: 'Security Auditor',
  boris: 'Senior Sysadmin',
};

export const DialogueBox: React.FC<DialogueBoxProps> = ({ dialogue, onComplete, onClose }) => {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const currentLine = dialogue.lines[lineIndex] || '';
  const displayedText = currentLine.slice(0, charIndex);
  const isLastLine = lineIndex === dialogue.lines.length - 1;

  useEffect(() => {
    if (!isTyping) return;
    if (charIndex >= currentLine.length) {
      setIsTyping(false);
      return;
    }
    const timer = setTimeout(() => {
      setCharIndex(prev => prev + 1);
    }, 25);
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
            {AVATAR_EMOJI[dialogue.avatar] || '🤖'}
          </div>
          <div>
            <div className="dialogue-box__name">{dialogue.name}</div>
            <div className="dialogue-box__role">
              {ROLE_LABELS[dialogue.avatar] || 'NPC'}
            </div>
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
