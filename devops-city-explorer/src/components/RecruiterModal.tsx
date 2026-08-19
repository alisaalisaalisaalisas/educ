import React, { useState } from 'react';
import { GameState } from '../game/state';

interface RecruiterModalProps {
  gameState: GameState;
  onClose: () => void;
}

interface SkillItem {
  name: string;
  category: string;
  level: number;
  tags: string[];
  proofQuest: string;
}

const SKILLS: SkillItem[] = [
  {
    name: 'Docker & Multi-Stage Builds',
    category: 'Containers',
    level: 95,
    tags: ['Dockerfile', 'Multi-Stage', 'Alpine', 'Layer Cache', '.dockerignore'],
    proofQuest: 'Оптимизация Dockerfile (Вася) — сокращение размера образа с 1.8 Гб до 25 Мб',
  },
  {
    name: 'Kubernetes & Workload Troubleshooting',
    category: 'Orchestration',
    level: 90,
    tags: ['Pods', 'Deployments', 'ConfigMap', 'Secrets', 'CrashLoopBackOff', 'Probes'],
    proofQuest: 'CrashLoopBackOff (Елена) — диагностика volumeMounts и инъекция конфигураций',
  },
  {
    name: 'Linux System Administration & Diagnostics',
    category: 'OS Core',
    level: 92,
    tags: ['ps', 'top', 'dmesg', 'systemd', 'Load Average', 'Memory Leaks', 'Bash'],
    proofQuest: 'Диагностика ресурсов (Борис) — выявление OOM процессов и graceful shutdown',
  },
  {
    name: 'CI/CD Pipelines & Automation',
    category: 'Automation',
    level: 88,
    tags: ['GitHub Actions', 'GitLab CI', 'Linting', 'Matrix Builds', 'GitOps'],
    proofQuest: 'Сквозной пайплайн проекта — линтинг YAML, сборка бандла, Docker multi-stage',
  },
  {
    name: 'Observability & Metrics',
    category: 'Monitoring',
    level: 85,
    tags: ['Prometheus', 'PromQL', 'Grafana', 'Alertmanager', 'Loki', 'SLO/SLA'],
    proofQuest: 'SLA Uptime трекер и система метрик в архитектуре игры',
  },
  {
    name: 'Infrastructure as Code',
    category: 'Cloud & IaC',
    level: 82,
    tags: ['Terraform', 'Ansible', 'HCL', 'State Drift', 'VPC', 'Security Groups'],
    proofQuest: 'Спецификация развертывания облачной инфраструктуры',
  },
];

export const RecruiterModal: React.FC<RecruiterModalProps> = ({ gameState, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'Containers', 'Orchestration', 'OS Core', 'Automation', 'Monitoring', 'Cloud & IaC'];
  const filteredSkills = selectedCategory === 'all'
    ? SKILLS
    : SKILLS.filter(s => s.category === selectedCategory);

  const completedQuestsCount = Object.values(gameState.questProgress).filter(q => q.status === 'completed').length;

  return (
    <div className="recruiter-overlay" onClick={onClose}>
      <div className="recruiter-modal" onClick={e => e.stopPropagation()}>
        <div className="recruiter-modal__header">
          <div className="recruiter-modal__title-group">
            <span className="recruiter-modal__badge">👔 Recruiter & Tech Lead Fast-Track</span>
            <h2 className="recruiter-modal__title">DevOps & SRE Skill Matrix</h2>
          </div>
          <button className="quest-modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="recruiter-modal__body">
          {/* Executive Summary */}
          <div className="recruiter-summary-card">
            <div className="recruiter-avatar">💼</div>
            <div className="recruiter-summary-info">
              <h3 className="recruiter-name">DevOps / SRE Engineer Profile</h3>
              <p className="recruiter-bio">
                Интерактивное подтверждение практических инженерных компетенций. Все квесты в игре основаны на реальных 
                продакшен-кейсах (CrashLoopBackOff, OOM Killer, Multi-stage Docker, PromQL).
              </p>
              <div className="recruiter-stats">
                <div className="stat-pill">
                  <span className="stat-pill__num">{completedQuestsCount}/7</span>
                  <span className="stat-pill__label">Квестов пройдено</span>
                </div>
                <div className="stat-pill">
                  <span className="stat-pill__num">{gameState.sla.toFixed(2)}%</span>
                  <span className="stat-pill__label">Текущий SLA</span>
                </div>
                <div className="stat-pill">
                  <span className="stat-pill__num">{gameState.badges.length}</span>
                  <span className="stat-pill__label">Бейджей заработано</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category filter */}
          <div className="recruiter-filters">
            {categories.map(cat => (
              <button
                key={cat}
                className={`recruiter-filter-btn ${selectedCategory === cat ? 'recruiter-filter-btn--active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'all' ? 'Все компетенции' : cat}
              </button>
            ))}
          </div>

          {/* Skill Cards Grid */}
          <div className="recruiter-skills-grid">
            {filteredSkills.map(skill => (
              <div key={skill.name} className="skill-card">
                <div className="skill-card__header">
                  <div>
                    <span className="skill-card__category">{skill.category}</span>
                    <h4 className="skill-card__title">{skill.name}</h4>
                  </div>
                  <div className="skill-card__level">{skill.level}%</div>
                </div>

                <div className="skill-bar">
                  <div className="skill-bar__fill" style={{ width: `${skill.level}%` }} />
                </div>

                <div className="skill-tags">
                  {skill.tags.map(t => (
                    <span key={t} className="skill-tag">{t}</span>
                  ))}
                </div>

                <div className="skill-proof">
                  <span className="skill-proof__icon">🎯</span>
                  <span className="skill-proof__text">{skill.proofQuest}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Project Architecture */}
          <div className="recruiter-arch-card">
            <h4 className="recruiter-arch-title">🏗️ Архитектура проекта DevOps City Explorer</h4>
            <p className="recruiter-arch-text">
              • <strong>Frontend:</strong> React 18 + Vite + TypeScript + Phaser 3 (2D Game Canvas) + Monaco Editor.<br />
              • <strong>Docs-as-Code:</strong> Декларативные YAML/JSON манифесты квестов с регулярными и AST валидаторами.<br />
              • <strong>Zero-Cost Hosting:</strong> Статическая оптимизация для бесплатного размещения на GitHub / Cloudflare Pages.<br />
              • <strong>CI/CD:</strong> GitHub Actions с авто-проверкой манифестов и деплоем.
            </p>
          </div>
        </div>

        <div className="recruiter-modal__footer">
          <div className="recruiter-links">
            <span className="recruiter-link-note">Готов к техническому интервью и решению live-coding задач</span>
          </div>
          <button className="help-modal__btn" onClick={onClose}>
            Вернуться в игру ▸
          </button>
        </div>
      </div>
    </div>
  );
};
