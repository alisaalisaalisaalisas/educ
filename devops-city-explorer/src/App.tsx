import React, { useEffect, useState, useCallback, useRef } from 'react';
import { GameBridge, InteractionEvent, PlayerState } from './game/GameBridge';
import { gameState, GameState, CITY_ZONES } from './game/state';
import { HUD } from './components/HUD';
import { DialogueBox } from './components/DialogueBox';
import { QuestModal } from './components/QuestModal';
import { Journal } from './components/Journal';
import { HelpModal } from './components/HelpModal';
import { RecruiterModal } from './components/RecruiterModal';
import { LibraryModal } from './components/LibraryModal';
import { Toast, ToastMessage } from './components/Toast';

import { QUESTS, QuestData } from './data/quests';
import { NPC_QUESTS } from './data/npcs';
import { TERMINAL_ZONE_QUESTS } from './data/zones';
import { ShopItem } from './data/merchants';
import { MinigameDef, MINIGAMES, MINIGAME_LOCATION } from './data/minigames';
import { SignDef, SIGNS } from './data/signs';
import type { WarpDest } from './data/warps';

import { ShopModal } from './components/ShopModal';
import { WarpModal } from './components/WarpModal';
import { MinigameModal } from './components/MinigameModal';
import { SignModal } from './components/SignModal';

type Screen = 'game' | 'dialogue' | 'quest' | 'journal' | 'help' | 'recruiter' | 'library' | 'shop' | 'warp' | 'minigame' | 'sign';

export const App: React.FC = () => {
  const [state, setState] = useState<GameState>(gameState.get());
  const [screen, setScreen] = useState<Screen>('game');
  const [playerState, setPlayerState] = useState<PlayerState>({
    x: 0, y: 0, currentZone: 'linux-suburbs', nearInteractive: false,
  });
  const [activeDialogue, setActiveDialogue] = useState<any>(null);
  const [activeQuest, setActiveQuest] = useState<QuestData | null>(null);
  const [shopZone, setShopZone] = useState<string>('network-crossroads');
  const [activeMinigame, setActiveMinigame] = useState<MinigameDef | null>(null);
  const [activeSign, setActiveSign] = useState<SignDef | null>(null);
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

  // Disable Phaser keyboard input when any modal/screen is open (so WASD doesn't interfere with typing)
  useEffect(() => {
    bridgeRef.current?.setInputEnabled(screen === 'game');
  }, [screen]);

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
      const questId = TERMINAL_ZONE_QUESTS[terminalZone];
      if (questId && QUESTS[questId]) {
        setActiveQuest(QUESTS[questId]);
        setScreen('quest');
      }
    }

    if (event.type === 'library') {
      setScreen('library');
    }

    if (event.type === 'shop') {
      setShopZone((event.data?.zone as string) ?? 'network-crossroads');
      setScreen('shop');
    }

    if (event.type === 'warp') {
      setScreen('warp');
    }

    if (event.type === 'minigame') {
      const mg = MINIGAMES[event.id];
      if (mg) {
        setActiveMinigame(mg);
        setScreen('minigame');
      }
    }

    if (event.type === 'sign') {
      const sign = SIGNS[event.id];
      if (sign) {
        setActiveSign(sign);
        setScreen('sign');
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
    const earned = gameState.syncAchievements();

    let unlockMessage = '';
    if (newlyUnlockedZones.length > 0) {
      unlockMessage = ` • 🔓 Открыта новая зона: ${newlyUnlockedZones.join(', ')}!`;
    }
    if (earned.length > 0) {
      unlockMessage += ` • 🏅 Новое достижение: ${earned.join(', ')}!`;
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
    setActiveMinigame(null);
    setActiveSign(null);
  }, []);

const handleBuy = useCallback((item: ShopItem) => {
    const st = gameState.get();
    if (st.credits < item.price) return;
    gameState.update({ credits: st.credits - item.price });
    let text = `🛒 Куплено: ${item.name} (-${item.price} ⚡)`;
    if (item.effect === 'sla+1') {
      gameState.update({ sla: Math.min(100, parseFloat((st.sla + 1).toFixed(2))) });
      text += ' • SLA +1%!';
    } else if (item.effect === 'unlock-random') {
      const locked = CITY_ZONES.map(z => z.id).filter(z => !st.unlockedZones.includes(z));
      if (locked.length > 0) {
        const pick = locked[Math.floor(Math.random() * locked.length)];
        gameState.unlockZone(pick);
        text += ` • 🔓 Район открыт: ${pick}!`;
      } else {
        text += ' • Все районы уже открыты!';
      }
    } else if (item.effect === 'next-quest+20') {
      gameState.update({ pendingQuestBonus: (st.pendingQuestBonus || 0) + 20 });
      text += ' • +20 ⚡ к следующему квесту!';
    } else if (item.effect === 'insure') {
      gameState.update({ sla: Math.min(100, parseFloat((st.sla + 0.5).toFixed(2))) });
      text += ' • SLA +0.5%!';
    } else if (item.effect === 'perk') {
      gameState.update({ sla: Math.min(100, parseFloat((st.sla + 0.15).toFixed(2))) });
      text += ' • SLA +0.15%!';
    }
    setToast({ id: Date.now().toString(), text, type: 'success' });
    const earned = gameState.syncAchievements();
    if (earned.length > 0) {
      setToast({
        id: Date.now().toString(),
        text: `🏅 Новое достижение: ${earned.join(', ')}!`,
        type: 'success',
      });
    }
  }, []);

  const handleWarp = useCallback((dest: WarpDest) => {
    bridgeRef.current?.teleport(dest.x, dest.y);
    setToast({
      id: Date.now().toString(),
      text: `🚀 Телепорт: ${dest.name}`,
      type: 'info',
    });
    setScreen('game');
  }, []);

  const handleMinigameFinish = useCallback((score: number, perfect: boolean) => {
    if (!activeMinigame) return;
    const reward = score * activeMinigame.rewardBase;
    const st = gameState.get();
    gameState.update({ credits: st.credits + reward });
    setToast({
      id: Date.now().toString(),
      text: `🕹️ Перехвачено ${score}/${activeMinigame.rounds}! +${reward} ⚡${perfect ? ' • PERFECT!' : ''}`,
      type: perfect ? 'success' : 'info',
    });
    const earned = gameState.syncAchievements();
    if (earned.length > 0) {
      setToast({
        id: Date.now().toString(),
        text: `🏅 Новое достижение: ${earned.join(', ')}!`,
        type: 'success',
      });
    }
    setScreen('game');
    setActiveMinigame(null);
  }, [activeMinigame]);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const isCurrentZoneUnlocked = gameState.isZoneUnlocked(playerState.currentZone);
  const currentObjective = gameState.getCurrentObjective();
  const rank = gameState.getRank();
  const nextRank = gameState.getNextRank();

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
          rank={rank}
          rankProgress={gameState.getCompletedQuestCount()}
          nextRankQuests={nextRank?.minQuests}
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

        {screen === 'shop' && (
          <ShopModal
            zone={shopZone}
            credits={state.credits}
            onBuy={handleBuy}
            onClose={handleCloseModal}
          />
        )}

        {screen === 'warp' && (
          <WarpModal
            unlockedZones={state.unlockedZones}
            currentZone={playerState.currentZone}
            onWarp={handleWarp}
            onClose={handleCloseModal}
          />
        )}

        {screen === 'minigame' && activeMinigame && (
          <MinigameModal
            game={activeMinigame}
            onFinish={handleMinigameFinish}
            onClose={handleCloseModal}
          />
        )}

        {screen === 'sign' && activeSign && (
          <SignModal
            sign={activeSign}
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

        {screen === 'library' && (
          <LibraryModal
            onClose={handleCloseModal}
          />
        )}

        <Toast message={toast} onDismiss={() => setToast(null)} />
      </div>
    </div>
  );
};
