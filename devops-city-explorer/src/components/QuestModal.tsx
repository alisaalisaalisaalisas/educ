import React, { useState, useCallback } from 'react';

interface ValidationRule {
  pattern: string;
  message: string;
}

interface QuestChallenge {
  type: string;
  language: string;
  initialCode: string;
  validation: ValidationRule[];
  hints: string[];
  solutionExample: string;
}

interface QuestReward {
  slaBonus: number;
  credits: number;
  badge: string;
}

interface QuestData {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  reward: QuestReward;
  document: {
    title: string;
    theory: string;
  };
  challenge: QuestChallenge;
}

interface QuestModalProps {
  quest: QuestData;
  onComplete: (questId: string, reward: QuestReward) => void;
  onClose: () => void;
}

interface ValidationResult {
  passed: boolean;
  message: string;
}

export const QuestModal: React.FC<QuestModalProps> = ({ quest, onComplete, onClose }) => {
  const [code, setCode] = useState(quest.challenge.initialCode);
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [solved, setSolved] = useState(false);

  const validate = useCallback(() => {
    const validationResults = quest.challenge.validation.map((rule) => {
      const regex = new RegExp(rule.pattern, 'im');
      return {
        passed: regex.test(code),
        message: rule.message,
      };
    });
    setResults(validationResults);

    if (validationResults.every(r => r.passed)) {
      setSolved(true);
    }
  }, [code, quest.challenge.validation]);

  const revealHint = () => {
    setShowHints(true);
    setHintIndex(prev => Math.min(prev + 1, quest.challenge.hints.length));
  };

  const renderTheory = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('###')) {
        return <h3 key={i}>{line.replace(/^###\s*/, '')}</h3>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i}><strong>{line.replace(/\*\*/g, '')}</strong></p>;
      }
      if (line.startsWith('- ')) {
        return null; // collected below
      }
      if (line.trim() === '') return null;
      const formatted = line.replace(/`([^`]+)`/g, '<code>$1</code>');
      return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
    }).filter(Boolean);
  };

  const renderListItems = (text: string) => {
    const items = text.split('\n').filter(l => l.startsWith('- '));
    if (items.length === 0) return null;
    return (
      <ul>
        {items.map((item, i) => {
          const content = item.replace(/^-\s*/, '').replace(/`([^`]+)`/g, '<code>$1</code>');
          return <li key={i} dangerouslySetInnerHTML={{ __html: content }} />;
        })}
      </ul>
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      setCode(code.substring(0, start) + '  ' + code.substring(end));
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="quest-overlay">
      <div className="quest-modal">
        <div className="quest-modal__header">
          <div className="quest-modal__title-group">
            <span className="quest-modal__category">{quest.category} • {quest.difficulty}</span>
            <span className="quest-modal__title">{quest.title}</span>
          </div>
          <button className="quest-modal__close" onClick={onClose} title="Закрыть">✕</button>
        </div>

        <div className="quest-modal__body">
          {solved ? (
            <div className="quest-success">
              <div className="quest-success__icon">🏆</div>
              <div className="quest-success__title">Квест выполнен!</div>
              <div className="quest-success__rewards">
                <span>📊 SLA +{quest.reward.slaBonus}%</span>
                <span>⚡ +{quest.reward.credits}</span>
                <span>🏅 {quest.reward.badge}</span>
              </div>
              <button
                className="quest-success__continue"
                onClick={() => onComplete(quest.id, quest.reward)}
              >
                Продолжить ▸
              </button>
            </div>
          ) : (
            <>
              <div className="quest-theory">
                {renderTheory(quest.document.theory)}
                {renderListItems(quest.document.theory)}
              </div>

              <div className="quest-editor">
                <div className="quest-editor__label">
                  Редактор
                  <span className="quest-editor__language">{quest.challenge.language}</span>
                </div>
                <textarea
                  className="quest-editor__textarea"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  spellCheck={false}
                />
              </div>

              {results.length > 0 && (
                <div className="quest-validation">
                  {results.map((r, i) => (
                    <div key={i} className={`validation-result validation-result--${r.passed ? 'pass' : 'fail'}`}>
                      <span className="validation-result__icon">{r.passed ? '✓' : '✗'}</span>
                      <span>{r.message}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="quest-hints">
                <button className="quest-hints__toggle" onClick={revealHint}>
                  💡 {showHints ? 'Ещё подсказку' : 'Показать подсказку'} ({hintIndex}/{quest.challenge.hints.length})
                </button>
                {showHints && hintIndex > 0 && (
                  <ul className="quest-hints__list">
                    {quest.challenge.hints.slice(0, hintIndex).map((hint, i) => (
                      <li key={i} className="quest-hints__item">💡 {hint}</li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>

        {!solved && (
          <div className="quest-modal__footer">
            <div className="quest-modal__reward">
              <span className="quest-modal__reward-item">🏅 {quest.reward.badge}</span>
              <span className="quest-modal__reward-item">⚡ +{quest.reward.credits}</span>
            </div>
            <button className="quest-modal__submit" onClick={validate}>
              Проверить решение ▸
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
