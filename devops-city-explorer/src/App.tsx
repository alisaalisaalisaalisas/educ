import React, { useEffect, useState, useCallback, useRef } from 'react';
import { GameBridge, InteractionEvent, PlayerState } from './game/GameBridge';
import { gameState, GameState } from './game/state';
import { HUD } from './components/HUD';
import { DialogueBox } from './components/DialogueBox';
import { QuestModal } from './components/QuestModal';
import { Journal } from './components/Journal';
import { HelpModal } from './components/HelpModal';
import { RecruiterModal } from './components/RecruiterModal';
import { Toast, ToastMessage } from './components/Toast';

import questDocker01 from './data/quests/quest-docker-01.json';
import questLinux01 from './data/quests/quest-linux-01.json';
import questK8s01 from './data/quests/quest-k8s-01.json';

const QUESTS: Record<string, any> = {
  'quest-docker-01': questDocker01,
  'quest-linux-01': questLinux01,
  'quest-k8s-01': questK8s01,
};

const NPC_QUESTS: Record<string, string> = {
  vasya: 'quest-docker-01',
  elena: 'quest-k8s-01',
  boris: 'quest-linux-01',
};

type Screen = 'game' | 'dialogue' | 'quest' | 'journal' | 'help' | 'recruiter';

export const App: React.FC = () => {
  const [state, setState] = useState<GameState>(gameState.get());
  const [screen, setScreen] = useState<Screen>('game');
  const [playerState, setPlayerState] = useState<PlayerState>({
    x: 0, y: 0, currentZone: 'linux-suburbs', nearInteractive: false,
  });
  const [activeDialogue, setActiveDialogue] = useState<any>(null);
  const [activeQuest, setActiveQuest] = useState<any>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const bridgeRef = useRef<GameBridge | null>(null);

  // Subscribe to game state changes
  useEffect(() => {
    const unsub = gameState.subscribe(setState);
    return unsub;
  }, []);

  // Show onboarding help modal on first visit
  useEffect(() => {
    const current = gameState.get();
    if (!current.hasSeenOnboarding) {
      setScreen('help');
      gameState.update({ hasSeenOnboarding: true });
    }
  }, []);

  // Keyboard shortcut listener for F1 (Help) and Esc
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setScreen(prev => prev === 'help' ? 'game' : 'help');
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Initialize Phaser Game Bridge
  useEffect(() => {
    const bridge = new GameBridge();
    bridgeRef.current = bridge;
    bridge.start('game-canvas');

    bridge.onPlayerState((ps) => {
      setPlayerState(ps);
      gameState.update({ currentZone: ps.currentZone });
    });

    bridge.onInteraction((event: InteractionEvent) => {
      handleInteraction(event);
    });

    return () => bridge.destroy();
  }, []);

  const handleInteraction = useCallback((event: InteractionEvent) => {
    if (screen !== 'game') return;

    if (event.type === 'npc') {
      const npcId = event.id;
      const questId = NPC_QUESTS[npcId];
      if (questId && QUESTS[questId]) {
        const quest = QUESTS[questId];
        setActiveDialogue(quest.dialogue);
        setActiveQuest(quest);
        setScreen('dialogue');
      }
    }

    if (event.type === 'terminal') {
      const terminalZone = event.data?.zone as string;
      const zoneQuests: Record<string, string> = {
        'linux-suburbs': 'quest-linux-01',
        'docker-yard': 'quest-docker-01',
        'k8s-core': 'quest-k8s-01',
      };
      const questId = zoneQuests[terminalZone];
      if (questId && QUESTS[questId]) {
        setActiveQuest(QUESTS[questId]);
        setScreen('quest');
      }
    }

    if (event.type === 'zone-enter') {
      const zoneId = event.data.zone as string;
      const isUnlocked = gameState.isZoneUnlocked(zoneId);
      setToast({
        id: Date.now().toString(),
        text: `${isUnlocked ? '🔓' : '🔒'} Вы вошли в зону: ${zoneId}`,
        type: isUnlocked ? 'info' : 'error',
      });
    }
  }, [screen]);

  const handleDialogueComplete = useCallback(() => {
    if (activeQuest) {
      setScreen('quest');
    } else {
      setScreen('game');
    }
    setActiveDialogue(null);
  }, [activeQuest]);

  const handleQuestComplete = useCallback((questId: string, reward: any) => {
    const { newlyUnlockedZones } = gameState.completeQuest(questId, reward);
    gameState.addJournalEntry(questId);

    let unlockMessage = '';
    if (newlyUnlockedZones.length > 0) {
      unlockMessage = ` • 🔓 Открыта новая зона: ${newlyUnlockedZones.join(', ')}!`;
    }

    setToast({
      id: Date.now().toString(),
      text: `🏆 Квест выполнен! +${reward.credits} Credits | 🏅 ${reward.badge}${unlockMessage}`,
      type: 'success',
    });

    setScreen('game');
    setActiveQuest(null);
  }, []);

  const handleCloseModal = useCallback(() => {
    setScreen('game');
    setActiveDialogue(null);
    setActiveQuest(null);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const isCurrentZoneUnlocked = gameState.isZoneUnlocked(playerState.currentZone);
  const currentObjective = gameState.getCurrentObjective();

  return (
    <div className="app">
      <div className="game-wrapper">
        <div id="game-canvas" />

        <HUD
          sla={state.sla}
          credits={state.credits}
          currentZone={playerState.currentZone}
          isCurrentZoneUnlocked={isCurrentZoneUnlocked}
          objective={currentObjective}
          nearInteractive={playerState.nearInteractive}
          onOpenJournal={() => setScreen('journal')}
          onOpenHelp={() => setScreen('help')}
          onOpenRecruiter={() => setScreen('recruiter')}
          onToggleFullscreen={handleToggleFullscreen}
        />

        {screen === 'dialogue' && activeDialogue && (
          <DialogueBox
            dialogue={activeDialogue}
            onComplete={handleDialogueComplete}
            onClose={handleCloseModal}
          />
        )}

        {screen === 'quest' && activeQuest && (
          <QuestModal
            quest={activeQuest}
            onComplete={handleQuestComplete}
            onClose={handleCloseModal}
          />
        )}

        {screen === 'journal' && (
          <Journal
            gameState={state}
            onClose={handleCloseModal}
          />
        )}

        {screen === 'help' && (
          <HelpModal
            onClose={handleCloseModal}
          />
        )}

        {screen === 'recruiter' && (
          <RecruiterModal
            gameState={state}
            onClose={handleCloseModal}
          />
        )}

        <Toast message={toast} onDismiss={() => setToast(null)} />
      </div>
    </div>
  );
};
