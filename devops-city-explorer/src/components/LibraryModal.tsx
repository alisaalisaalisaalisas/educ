import React, { useEffect, useMemo, useState } from 'react';
import { LIBRARY_TOPICS, LibraryItem, LibraryTopic } from '../data/library';
import type { ReactNode } from 'react';

interface LibraryModalProps {
  onClose: () => void;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={`${keyPrefix}-${i}`}>{part.slice(1, -1)}</code>;
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>;
    }
    return <span key={`${keyPrefix}-${i}`}>{part}</span>;
  });
}

interface CodeBlockProps {
  code: string;
  index: number;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, index }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="lib-code">
      <button className={`lib-code__bar ${copied ? 'lib-code__bar--copied' : ''}`} onClick={handleCopy}>
        <span className="lib-code__dots">
          <i className="lib-code__dot lib-code__dot--red" />
          <i className="lib-code__dot lib-code__dot--yellow" />
          <i className="lib-code__dot lib-code__dot--green" />
        </span>
        <span className="lib-code__title">terminal://lib/{index + 1}</span>
        <span className="lib-code__copy">{copied ? '✓ Скопировано' : '⧉ Копировать'}</span>
      </button>
      <pre className="lib-code__pre"><code>{code}</code></pre>
    </div>
  );
};

const LibraryItemView: React.FC<{ item: LibraryItem; index: number; step?: number }> = ({ item, index, step }) => (
  <div className="lib-item">
    {item.title && (
      <div className="lib-item__title">{renderInline(item.title, `t${index}`)}</div>
    )}
    <p className="lib-item__text">{renderInline(item.text, `p${index}`)}</p>
    {item.code && <CodeBlock code={item.code} index={index} />}
    {item.tip && (
      <div className={`lib-tip ${item.tipKind === 'warning' ? 'lib-tip--warning' : ''}`}>
        <span className="lib-tip__icon">{item.tipKind === 'warning' ? '⚠️' : '💡'}</span>
        <p>{renderInline(item.tip, `tip${index}`)}</p>
      </div>
    )}
  </div>
);

const TopicArticle: React.FC<{ topic: LibraryTopic }> = ({ topic }) => (
  <article className="lib-article" style={{ ['--topic-color' as any]: topic.color }}>
    <div className="lib-hero">
      <div className="lib-hero__tile" style={{ background: topic.color }}>
        <span>{topic.icon}</span>
      </div>
      <div className="lib-hero__info">
        <span className="lib-hero__zone" style={{ color: topic.color }}>{topic.zone}</span>
        <h3 className="lib-hero__title">{topic.title}</h3>
        <p className="lib-hero__summary">{topic.summary}</p>
        <div className="lib-hero__tags">
          {topic.tags.map(tag => (
            <span key={tag} className="lib-hero__tag" style={{ borderColor: topic.color, color: topic.color }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>

    {topic.sections.map((section, si) => (
      <section key={section.heading} className="lib-section">
        <h4 className="lib-section__heading">
          <span className="lib-section__marker" style={{ background: topic.color }} />
          {section.heading}
          <span className="lib-section__count">{section.items.length}</span>
        </h4>
        {section.intro && <p className="lib-section__intro">{renderInline(section.intro, `intro${si}`)}</p>}
        {section.ordered ? (
          <ol className="lib-list lib-list--steps">
            {section.items.map((item, i) => (
              <li key={i} className="lib-step">
                <span className="lib-step__num" style={{ background: topic.color }}>{i + 1}</span>
                <div className="lib-step__body">
                  <div className="lib-item">
                    {item.title && <div className="lib-item__title">{renderInline(item.title, `st${i}`)}</div>}
                    <p className="lib-item__text">{renderInline(item.text, `sp${i}`)}</p>
                    {item.code && <CodeBlock code={item.code} index={i} />}
                    {item.tip && (
                      <div className={`lib-tip ${item.tipKind === 'warning' ? 'lib-tip--warning' : ''}`}>
                        <span className="lib-tip__icon">{item.tipKind === 'warning' ? '⚠️' : '💡'}</span>
                        <p>{renderInline(item.tip, `stp${i}`)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="lib-list">
            {section.items.map((item, i) => (
              <LibraryItemView key={i} item={item} index={i} />
            ))}
          </div>
        )}
      </section>
    ))}
  </article>
);

export const LibraryModal: React.FC<LibraryModalProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LIBRARY_TOPICS;
    return LIBRARY_TOPICS.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.zone.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.toLowerCase().includes(q)) ||
      t.sections.some(s =>
        s.heading.toLowerCase().includes(q) ||
        s.items.some(it => it.text.toLowerCase().includes(q) || (it.title?.toLowerCase().includes(q) ?? false))
      )
    );
  }, [query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const topic = filtered[activeIndex];
  const topicCount = LIBRARY_TOPICS.length;
  const sectionCount = LIBRARY_TOPICS.reduce((acc, t) => acc + t.sections.length, 0);
  const itemCount = LIBRARY_TOPICS.reduce(
    (acc, t) => acc + t.sections.reduce((a, s) => a + s.items.length, 0),
    0
  );

  const go = (delta: number) => {
    setActiveIndex(prev => {
      const next = prev + delta;
      if (next < 0 || next >= filtered.length) return prev;
      return next;
    });
  };

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        go(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        go(-1);
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [onClose, filtered.length]);

  useEffect(() => {
    const article = document.querySelector('.lib-article');
    if (article) article.scrollTop = 0;
  }, [activeIndex]);

  return (
    <div className="library-overlay" onClick={onClose}>
      <div className="library-modal" onClick={e => e.stopPropagation()}>
        <div className="library-modal__header">
          <div className="library-modal__title-group">
            <span className="library-modal__tag">📚 База знаний города</span>
            <h2 className="library-modal__title">Библиотека DevOps City Explorer</h2>
          </div>
          <button className="quest-modal__close" onClick={onClose} title="Закрыть (Esc)">✕</button>
        </div>

        <div className="library-modal__body">
          <aside className="library-sidebar">
            <div className="lib-search">
              <span className="lib-search__icon">🔍</span>
              <input
                className="lib-search__input"
                placeholder="Поиск: OOM, PromQL, reverse proxy..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {query && (
                <button className="lib-search__clear" onClick={() => setQuery('')}>✕</button>
              )}
            </div>

            <nav className="lib-toc">
              {filtered.map((t, i) => (
                <button
                  key={t.id}
                  className={`lib-toc__btn ${i === activeIndex ? 'lib-toc__btn--active' : ''}`}
                  style={i === activeIndex ? { borderColor: t.color, color: t.color } : undefined}
                  onClick={() => setActiveIndex(i)}
                >
                  <span className="lib-toc__icon">{t.icon}</span>
                  <span className="lib-toc__meta">
                    <span className="lib-toc__label">{t.title}</span>
                    <span className="lib-toc__zone">{t.zone} · {t.sections.length} разд.</span>
                  </span>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="lib-toc__empty">
                  Ничего не найдено по запросу «{query}»
                </div>
              )}
            </nav>

            <div className="lib-sidebar__footer">
              <div className="lib-sidebar__stat"><strong>{topicCount}</strong> тем</div>
              <div className="lib-sidebar__stat"><strong>{sectionCount}</strong> разделов</div>
              <div className="lib-sidebar__stat"><strong>{itemCount}</strong> материалов</div>
            </div>
          </aside>

          {topic ? (
            <>
              <TopicArticle topic={topic} />
              <div className="lib-modal__footer">
                <button
                  className="lib-nav"
                  onClick={() => go(-1)}
                  disabled={activeIndex === 0}
                >
                  ◀ Назад
                </button>
                <span className="lib-modal__note">
                  {activeIndex + 1} / {filtered.length} · {topic.zone}
                </span>
                <button
                  className="lib-nav"
                  onClick={() => go(1)}
                  disabled={activeIndex === filtered.length - 1}
                >
                  Далее ▶
                </button>
              </div>
            </>
          ) : (
            <div className="lib-article lib-article--empty">
              <p>Попробуйте изменить запрос — например «502», «OOM», «PromQL».</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};