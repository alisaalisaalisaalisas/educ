import Phaser from 'phaser';

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 640;
export const TILE_SIZE = 32;
export const MAP_WIDTH_TILES = 64;
export const MAP_HEIGHT_TILES = 36;

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-canvas',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  backgroundColor: '#0a0e1a',
};
