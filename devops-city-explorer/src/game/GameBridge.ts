import Phaser from 'phaser';
import { gameConfig } from './config';
import { BootScene } from './scenes/BootScene';
import { CityScene } from './scenes/CityScene';

export type InteractionEvent = {
  type: 'npc' | 'terminal' | 'door' | 'zone-enter' | 'library' | 'shop' | 'warp' | 'minigame' | 'sign';
  id: string;
  data: Record<string, unknown>;
};

export type PlayerState = {
  x: number;
  y: number;
  currentZone: string;
  nearInteractive: boolean;
};

type GameEventCallback = (event: InteractionEvent) => void;
type PlayerStateCallback = (state: PlayerState) => void;

export class GameBridge {
  private game: Phaser.Game | null = null;
  private interactionCallbacks: GameEventCallback[] = [];
  private playerStateCallbacks: PlayerStateCallback[] = [];
  private lastZone = '';

  start(containerId: string) {
    if (this.game) return;
    
    // Clear any previous canvas inside container (e.g. from HMR or StrictMode)
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
    }

    const config = {
      ...gameConfig,
      parent: containerId,
      scene: [BootScene, CityScene],
    };
    this.game = new Phaser.Game(config);

    this.game.events.on('interaction', (event: InteractionEvent) => {
      this.interactionCallbacks.forEach(cb => cb(event));
    });

    this.game.events.on('playerState', (state: PlayerState) => {
      if (state.currentZone !== this.lastZone) {
        this.lastZone = state.currentZone;
        this.interactionCallbacks.forEach(cb => cb({
          type: 'zone-enter',
          id: state.currentZone,
          data: { zone: state.currentZone },
        }));
      }
      this.playerStateCallbacks.forEach(cb => cb(state));
    });
  }

  onInteraction(callback: GameEventCallback) {
    this.interactionCallbacks.push(callback);
    return () => {
      this.interactionCallbacks = this.interactionCallbacks.filter(cb => cb !== callback);
    };
  }

  onPlayerState(callback: PlayerStateCallback) {
    this.playerStateCallbacks.push(callback);
    return () => {
      this.playerStateCallbacks = this.playerStateCallbacks.filter(cb => cb !== callback);
    };
  }

  setInputEnabled(enabled: boolean) {
    if (this.game && this.game.input && this.game.input.keyboard) {
      this.game.input.keyboard.enabled = enabled;
    }
  }

  teleport(x: number, y: number) {
    if (this.game) {
      this.game.events.emit('teleport', { x, y });
    }
  }

  destroy() {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
    this.interactionCallbacks = [];
    this.playerStateCallbacks = [];
  }
}
