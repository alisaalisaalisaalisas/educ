import Phaser from 'phaser';
import { gameState } from '../state';

// Explicit 0-indexed tile constants (matching 32x32 frames in 'tileset' texture with gid=0)
const TILE = {
  ROAD: 0,        // 0: Asphalt Road (Walkable)
  GRASS: 1,       // 1: Lush Meadow Grass (Walkable)
  DATACENTER: 2,  // 2: K8s Datacenter Wall (Solid Obstacle)
  CONTAINER: 3,   // 3: Docker Container Crate (Solid Obstacle)
  WATER: 4,       // 4: Deep Sapphire River (Solid Obstacle)
  BRIDGE: 5,      // 5: Git Bridge Wooden Deck (Walkable)
  TERMINAL: 6,    // 6: Terminal Station Floor (Walkable)
  DOME: 7,        // 7: Observatory Dome Wall (Solid Obstacle)
  FENCE: 8,       // 8: Security Perimeter Fence (Solid Obstacle)
};

interface InteractiveObj {
  x: number;
  y: number;
  type: 'npc' | 'terminal' | 'door' | 'gate';
  id: string;
  sprite: Phaser.GameObjects.Sprite;
  zone: string;
}

export class CityScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private interactKey!: Phaser.Input.Keyboard.Key;
  private interactibles: InteractiveObj[] = [];
  private promptIcon!: Phaser.GameObjects.Sprite;
  private radarUIElements: Phaser.GameObjects.GameObject[] = [];
  
  // Gate physics & visuals
  private gateCollider!: Phaser.Physics.Arcade.Sprite;
  private k8sLaserGraphics!: Phaser.GameObjects.Graphics;
  private gateTagText!: Phaser.GameObjects.Text;
  private leftPylon!: Phaser.GameObjects.Sprite;
  private rightPylon!: Phaser.GameObjects.Sprite;

  // Visual effects
  private questBeacon!: Phaser.GameObjects.Graphics;
  private waterShimmer!: Phaser.GameObjects.Graphics;
  private unsubState?: () => void;
  
  constructor() {
    super({ key: 'CityScene' });
  }

  create() {
    // 1. Generate City Map (40 x 30 tiles = 1280 x 960 px)
    const mapLayer = this.generateMap();
    
    // 2. Setup Interactive Objects & NPCs
    this.setupInteractibles();

    // 3. Security Laser Barrier for K8s Core entrance
    this.setupSecurityGates();

    // 4. Physics world must match the FULL tilemap, not the viewport
    const worldWidth = 40 * 32;  // 1280 px
    const worldHeight = 30 * 32; // 960 px
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // 5. Player Character (Spawn in Linux Suburbs on road at x: 8*32, y: 24*32)
    this.player = this.physics.add.sprite(8 * 32, 24 * 32, 'player-down');
    this.player.setCollideWorldBounds(true);
    this.player.setSize(18, 20);
    this.player.setOffset(7, 8);
    this.player.setDepth(20);

    // Collision with solid tilemap objects and gate collider
    this.physics.add.collider(this.player, mapLayer);
    this.physics.add.collider(this.player, this.gateCollider);

    // 5. Input Setup
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as any;
    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // 6. Main Camera Setup
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    // 7. Proximity Prompt Icon
    this.promptIcon = this.add.sprite(0, 0, 'prompt-e')
      .setVisible(false)
      .setDepth(100);

    // 8. Visual effects layers
    this.waterShimmer = this.add.graphics().setDepth(5);
    this.questBeacon = this.add.graphics().setDepth(14);

    // 9. Minimap (Bottom-Right, Zero Black Bars)
    const minimapW = 160;
    const minimapH = 120;
    const minimapX = this.scale.width - minimapW - 16;  // 784
    const minimapY = this.scale.height - minimapH - 16; // 504

    const minimap = this.cameras.add(minimapX, minimapY, minimapW, minimapH)
      .setZoom(minimapW / worldWidth) // 160 / 1280 = 0.125
      .setName('mini');

    minimap.setBackgroundColor('rgba(10, 14, 26, 0.95)');
    minimap.setBounds(0, 0, worldWidth, worldHeight);
    minimap.centerOn(worldWidth / 2, worldHeight / 2); // (640, 480)

    // Minimap HUD frame overlay (rendered on main camera only)
    const radarFrame = this.add.graphics().setScrollFactor(0).setDepth(99);
    radarFrame.lineStyle(2, 0x22d3ee, 0.9);
    radarFrame.strokeRoundedRect(minimapX - 2, minimapY - 2, minimapW + 4, minimapH + 4, 4);
    radarFrame.fillStyle(0x0a0e1a, 0.9);
    radarFrame.fillRoundedRect(minimapX, minimapY - 18, 90, 18, 3);
    radarFrame.lineStyle(1, 0x22d3ee, 0.6);
    radarFrame.strokeRoundedRect(minimapX, minimapY - 18, 90, 18, 3);

    const radarLabel = this.add.text(minimapX + 6, minimapY - 15, '📡 RADAR CITY', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#22d3ee',
      fontStyle: 'bold',
    }).setScrollFactor(0).setDepth(100);

    this.radarUIElements.push(radarFrame, radarLabel, this.promptIcon);
    minimap.ignore(this.radarUIElements);

    // 10. Subscribe to state changes for dynamic gate unlocking
    this.unsubState = gameState.subscribe(() => {
      this.updateSecurityGates();
    });

    this.updateSecurityGates();
  }

  private setupSecurityGates() {
    // Solid Arcade Physics static sprite for K8s Core gate entrance (y: 7*32 + 16, x: 20*32 + 16)
    const gateCenterX = 20 * 32 + 16;
    const gateCenterY = 7 * 32 + 16;

    this.gateCollider = this.physics.add.staticSprite(gateCenterX, gateCenterY, 'gate-barrier-texture');
    this.gateCollider.setVisible(false);

    // Visual Pylons at road edges
    this.leftPylon = this.add.sprite(18 * 32 - 10, gateCenterY, 'gate-pylon').setDepth(16);
    this.rightPylon = this.add.sprite(22 * 32 + 26, gateCenterY, 'gate-pylon').setDepth(16);

    // Laser beam graphics
    this.k8sLaserGraphics = this.add.graphics().setDepth(15);

    // Floating status tag above gate
    this.gateTagText = this.add.text(gateCenterX, 6 * 32 + 8, '🔒 ШЛЮЗ: K8S CORE', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#ef4444',
      fontStyle: 'bold',
      backgroundColor: '#0a0e1a'
    }).setOrigin(0.5).setDepth(17);
  }

  private updateSecurityGates() {
    const isK8sUnlocked = gameState.isZoneUnlocked('k8s-core');

    this.k8sLaserGraphics.clear();

    const startX = 18 * 32 - 10;
    const endX = 22 * 32 + 26;
    const laserY = 7 * 32 + 16;

    if (!isK8sUnlocked) {
      // Locked: Enable collision body
      if (this.gateCollider && this.gateCollider.body) {
        this.gateCollider.body.enable = true;
      }

      // Outer glow
      this.k8sLaserGraphics.lineStyle(6, 0xef4444, 0.4);
      this.k8sLaserGraphics.lineBetween(startX, laserY, endX, laserY);

      // Core red laser
      this.k8sLaserGraphics.lineStyle(3, 0xef4444, 0.95);
      this.k8sLaserGraphics.lineBetween(startX, laserY, endX, laserY);

      // White hot core
      this.k8sLaserGraphics.lineStyle(1, 0xffffff, 0.9);
      this.k8sLaserGraphics.lineBetween(startX, laserY, endX, laserY);

      this.gateTagText.setText('🔒 ШЛЮЗ: K8S CORE (Закрыто)').setColor('#ef4444');
      this.leftPylon.setTint(0xff5555);
      this.rightPylon.setTint(0xff5555);
    } else {
      // Unlocked: Disable collision body to allow passage
      if (this.gateCollider && this.gateCollider.body) {
        this.gateCollider.body.enable = false;
      }

      // Soft green deactivation beam
      this.k8sLaserGraphics.lineStyle(2, 0x22c55e, 0.4);
      this.k8sLaserGraphics.lineBetween(startX, laserY, endX, laserY);

      this.gateTagText.setText('🔓 ШЛЮЗ: K8S CORE (Открыто)').setColor('#22c55e');
      this.leftPylon.setTint(0x55ff55);
      this.rightPylon.setTint(0x55ff55);
    }
  }

  private generateMap(): Phaser.Tilemaps.TilemapLayer {
    const map = this.make.tilemap({ tileWidth: 32, tileHeight: 32, width: 40, height: 30 });
    
    // Explicitly set gid = 0 to match 0-indexed texture tiles
    const tileset = map.addTilesetImage('tileset', 'tileset', 32, 32, 0, 0, 0)!;
    const layer = map.createBlankLayer('ground', tileset)!;

    // 1. Natural Grass everywhere (Walkable TILE.GRASS = 1)
    for (let y = 0; y < 30; y++) {
      for (let x = 0; x < 40; x++) {
        layer.putTileAt(TILE.GRASS, x, y);
      }
    }

    // 2. Cyber River (Solid TILE.WATER = 4 at y = 13..15)
    for (let x = 0; x < 40; x++) {
      for (let y = 13; y <= 15; y++) {
        layer.putTileAt(TILE.WATER, x, y);
      }
    }

    // 3. Git Bridge crossing the river (Walkable TILE.BRIDGE = 5 at x = 18..22, y = 13..15)
    for (let x = 18; x <= 22; x++) {
      for (let y = 13; y <= 15; y++) {
        layer.putTileAt(TILE.BRIDGE, x, y);
      }
    }

    // 4. Main North-South Central Highway (Walkable TILE.ROAD = 0 at x = 19..21)
    for (let y = 0; y < 30; y++) {
      if (y < 13 || y > 15) {
        layer.putTileAt(TILE.ROAD, 19, y);
        layer.putTileAt(TILE.ROAD, 20, y);
        layer.putTileAt(TILE.ROAD, 21, y);
      }
    }

    // 5. South East-West Avenue (Walkable TILE.ROAD = 0 at y = 23..24)
    for (let x = 2; x < 38; x++) {
      layer.putTileAt(TILE.ROAD, x, 23);
      layer.putTileAt(TILE.ROAD, x, 24);
    }

    // 6. North East-West Avenue (Walkable TILE.ROAD = 0 at y = 8..9)
    for (let x = 2; x < 38; x++) {
      layer.putTileAt(TILE.ROAD, x, 8);
      layer.putTileAt(TILE.ROAD, x, 9);
    }

    // 7. Security Perimeter Walls enclosing K8s Core (Solid TILE.DATACENTER = 2)
    // Left boundary wall at x = 16..17, y = 2..7
    for (let y = 2; y <= 7; y++) {
      layer.putTileAt(TILE.DATACENTER, 16, y);
      layer.putTileAt(TILE.DATACENTER, 17, y);
    }
    // Right boundary wall at x = 23..24, y = 2..7
    for (let y = 2; y <= 7; y++) {
      layer.putTileAt(TILE.DATACENTER, 23, y);
      layer.putTileAt(TILE.DATACENTER, 24, y);
    }
    // North back wall of K8s Core
    for (let x = 16; x <= 24; x++) {
      layer.putTileAt(TILE.DATACENTER, x, 1);
    }

    // 8. Docker Yard (North-West: Solid TILE.CONTAINER = 3 at x = 3..14, y = 2..6)
    for (let x = 3; x <= 6; x++) {
      for (let y = 2; y <= 5; y++) {
        layer.putTileAt(TILE.CONTAINER, x, y);
      }
    }
    for (let x = 10; x <= 14; x++) {
      for (let y = 2; y <= 5; y++) {
        layer.putTileAt(TILE.CONTAINER, x, y);
      }
    }
    // Docker loading bay road
    for (let x = 7; x <= 9; x++) {
      for (let y = 2; y <= 7; y++) {
        layer.putTileAt(TILE.ROAD, x, y);
      }
    }

    // 9. Observability Peak (North-East: Solid TILE.DOME = 7 at x = 30..35, y = 2..4)
    for (let x = 30; x <= 35; x++) {
      for (let y = 2; y <= 4; y++) {
        layer.putTileAt(TILE.DOME, x, y);
      }
    }

    // 10. Linux Suburbs (South-West: Datacenter blocks in bottom-left corner only: x=3..6, y=26..28)
    for (let x = 3; x <= 6; x++) {
      for (let y = 26; y <= 28; y++) {
        layer.putTileAt(TILE.DATACENTER, x, y);
      }
    }
    layer.putTileAt(TILE.TERMINAL, 11, 22); // Terminal kiosk (Walkable)

    // 11. Network Crossroads (South-East: Datacenter blocks at x=32..35, y=26..28)
    for (let x = 32; x <= 35; x++) {
      for (let y = 26; y <= 28; y++) {
        layer.putTileAt(TILE.DATACENTER, x, y);
      }
    }
    layer.putTileAt(TILE.TERMINAL, 30, 23); // Network Terminal kiosk (Walkable)

    // ONLY solid obstacle tiles collide (Grass, Road, Bridge, Terminal are 100% WALKABLE!)
    layer.setCollision([
      TILE.DATACENTER,
      TILE.CONTAINER,
      TILE.WATER,
      TILE.DOME,
      TILE.FENCE,
    ]);

    return layer;
  }

  private setupInteractibles() {
    const addInteractive = (
      x: number,
      y: number,
      type: 'npc' | 'terminal' | 'door' | 'gate',
      id: string,
      texture: string,
      zone: string,
      label: string,
      labelColor = '#22d3ee'
    ) => {
      const sprite = this.add.sprite(x, y, texture).setDepth(15);
      this.interactibles.push({ x, y, type, id, sprite, zone });

      // Floating nameplate badge
      const tagBg = this.add.graphics().setDepth(16);
      tagBg.fillStyle(0x0a0e1a, 0.85);
      tagBg.fillRoundedRect(x - 36, y - 28, 72, 14, 3);
      tagBg.lineStyle(1, Phaser.Display.Color.HexStringToColor(labelColor).color, 0.7);
      tagBg.strokeRoundedRect(x - 36, y - 28, 72, 14, 3);

      this.add.text(x, y - 21, label, {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: labelColor,
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(17);
    };

    // Vasya at Docker Yard (North-West)
    addInteractive(8 * 32, 5 * 32, 'npc', 'vasya', 'npc-vasya', 'docker-yard', 'Вася [Dev]', '#4ade80');

    // Boris at Linux Suburbs (South-West)
    addInteractive(8 * 32, 22 * 32, 'npc', 'boris', 'npc-boris', 'linux-suburbs', 'Борис [Sys]', '#f59e0b');

    // Matvey at Git Bridge (Center River Crossing)
    addInteractive(20 * 32, 14 * 32, 'npc', 'matvey', 'npc-matvey', 'git-bridge', 'Матвей [Git]', '#f59e0b');

    // Daria at Network Crossroads (South-East)
    addInteractive(30 * 32, 24 * 32, 'npc', 'daria', 'npc-daria', 'network-crossroads', 'Дарья [NetOps]', '#ec4899');

    // Elena at K8s Core (North-Center)
    addInteractive(20 * 32, 4 * 32, 'npc', 'elena', 'npc-elena', 'k8s-core', 'Елена [SRE]', '#38bdf8');

    // Igor at Observability Peak (North-East)
    addInteractive(33 * 32, 4 * 32, 'npc', 'igor', 'npc-igor', 'observability-peak', 'Игорь [Obs]', '#a855f7');

    // Artem at Cloud Valley & IaC (Mid-East)
    addInteractive(35 * 32, 10 * 32, 'npc', 'artem', 'npc-artem', 'cloud-valley', 'Артём [IaC/Cloud]', '#38bdf8');

    // Siren / Incident Dispatcher at War Room
    addInteractive(33 * 32, 7 * 32, 'npc', 'siren', 'npc-siren', 'incident-war-room', '🚨 Сирена [WarRoom]', '#ef4444');

    // Terminals
    addInteractive(11 * 32, 22 * 32, 'terminal', 'term-linux', 'term-icon', 'linux-suburbs', 'Linux CLI', '#22c55e');
    addInteractive(20 * 32, 3 * 32, 'terminal', 'term-k8s', 'term-icon', 'k8s-core', 'K8s Core', '#a855f7');
    addInteractive(30 * 32, 23 * 32, 'terminal', 'term-net', 'term-icon', 'network-crossroads', 'NetOps Kiosk', '#ec4899');
    addInteractive(35 * 32, 12 * 32, 'terminal', 'term-cloud', 'term-icon', 'cloud-valley', 'Cloud IaC Console', '#38bdf8');
  }

  update() {
    const speed = 180;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      this.player.setVelocityX(-speed);
      this.player.setTexture('player-left');
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      this.player.setVelocityX(speed);
      this.player.setTexture('player-right');
    }
    
    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      this.player.setVelocityY(-speed);
      this.player.setTexture('player-up');
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      this.player.setVelocityY(speed);
      this.player.setTexture('player-down');
    }

    // Proximity check for interaction (within 48px)
    let nearest: InteractiveObj | null = null;
    let minDist = 48;
    
    for (const obj of this.interactibles) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, obj.x, obj.y);
      if (dist < minDist) {
        minDist = dist;
        nearest = obj;
      }
    }
    
    if (nearest) {
      this.promptIcon.setPosition(nearest.x, nearest.y - 36).setVisible(true);
      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        this.game.events.emit('interaction', {
          type: nearest.type,
          id: nearest.id,
          data: { zone: nearest.zone }
        });
      }
    } else {
      this.promptIcon.setVisible(false);
    }

    // Dynamic water shimmering waves
    this.drawWaterShimmer();

    // Draw pulsating objective beacon on target NPC
    this.drawObjectiveBeacon();
    
    // Determine current player zone
    const currentZone = this.determineZone(this.player.x, this.player.y);
    this.game.events.emit('playerState', {
      x: this.player.x,
      y: this.player.y,
      currentZone: currentZone,
      nearInteractive: !!nearest
    });
  }

  private drawWaterShimmer() {
    this.waterShimmer.clear();
    const time = this.time.now * 0.002;

    // Bridge horizontal bounds: x = 18*32 (576px) to x = 23*32 (736px)
    const bridgeLeft = 18 * 32;
    const bridgeRight = 23 * 32;

    // 1. Soft bridge drop-shadow on left and right river banks
    this.waterShimmer.fillStyle(0x000000, 0.4);
    this.waterShimmer.fillRect(bridgeLeft - 6, 13 * 32, 6, 3 * 32);
    this.waterShimmer.fillRect(bridgeRight, 13 * 32, 6, 3 * 32);

    // 2. West River flowing waves (x: 10 .. 560px)
    const westWidth = bridgeLeft - 30; // ~546px
    this.waterShimmer.fillStyle(0x38bdf8, 0.35 + Math.sin(time) * 0.15);
    for (let i = 0; i < 4; i++) {
      const wx = (i * 140 + this.time.now * 0.025) % westWidth;
      const wy = 13 * 32 + 8 + (i % 3) * 26;
      if (wx + 24 < bridgeLeft - 4) {
        this.waterShimmer.fillRoundedRect(wx, wy, 24, 3, 1.5);
      }
    }

    // 3. East River flowing waves (x: 746 .. 1270px)
    const eastStartX = bridgeRight + 10;
    const eastWidth = 1280 - eastStartX - 10;
    for (let i = 0; i < 4; i++) {
      const ex = eastStartX + ((i * 140 + this.time.now * 0.025) % eastWidth);
      const ey = 13 * 32 + 8 + ((i + 1) % 3) * 26;
      if (ex + 24 < 1270) {
        this.waterShimmer.fillRoundedRect(ex, ey, 24, 3, 1.5);
      }
    }
  }

  private drawObjectiveBeacon() {
    this.questBeacon.clear();
    const time = this.time.now * 0.005;
    const pulseRadius = 18 + Math.sin(time) * 4;

    const state = gameState.get();
    let targetObj: InteractiveObj | undefined;

    if (state.questProgress['quest-docker-01']?.status !== 'completed') {
      targetObj = this.interactibles.find(i => i.id === 'vasya');
    } else if (state.questProgress['quest-linux-01']?.status !== 'completed') {
      targetObj = this.interactibles.find(i => i.id === 'boris');
    } else if (state.questProgress['quest-git-01']?.status !== 'completed') {
      targetObj = this.interactibles.find(i => i.id === 'matvey');
    } else if (state.questProgress['quest-network-01']?.status !== 'completed') {
      targetObj = this.interactibles.find(i => i.id === 'daria');
    } else if (state.questProgress['quest-k8s-01']?.status !== 'completed' && state.unlockedZones.includes('k8s-core')) {
      targetObj = this.interactibles.find(i => i.id === 'elena');
    } else if (state.questProgress['quest-obs-01']?.status !== 'completed' && state.unlockedZones.includes('observability-peak')) {
      targetObj = this.interactibles.find(i => i.id === 'igor');
    } else if (state.questProgress['quest-terraform-01']?.status !== 'completed' && state.unlockedZones.includes('cloud-valley')) {
      targetObj = this.interactibles.find(i => i.id === 'artem');
    } else if (state.questProgress['quest-warroom-01']?.status !== 'completed' && state.unlockedZones.includes('incident-war-room')) {
      targetObj = this.interactibles.find(i => i.id === 'siren');
    }

    if (targetObj) {
      this.questBeacon.lineStyle(2, 0x22d3ee, 0.8 + Math.sin(time) * 0.2);
      this.questBeacon.strokeCircle(targetObj.x, targetObj.y, pulseRadius);
      this.questBeacon.fillStyle(0x22d3ee, 0.15);
      this.questBeacon.fillCircle(targetObj.x, targetObj.y, pulseRadius);
      
      const arrowY = targetObj.y - 42 + Math.sin(time * 2) * 3;
      this.questBeacon.fillStyle(0xfbbf24, 1);
      this.questBeacon.fillTriangle(
        targetObj.x, arrowY + 8,
        targetObj.x - 5, arrowY,
        targetObj.x + 5, arrowY
      );
    }
  }

  private determineZone(x: number, y: number): string {
    const tx = Math.floor(x / 32);
    const ty = Math.floor(y / 32);
    
    // Git Bridge (center river crossing)
    if (tx >= 17 && tx <= 23 && ty >= 12 && ty <= 16) return 'git-bridge';

    // North Sector
    if (ty <= 12) {
      if (tx <= 15) return 'docker-yard';
      if (tx >= 16 && tx <= 24 && ty <= 7) return 'k8s-core';
      if (tx >= 28 && ty >= 8) return 'cloud-valley';
      if (tx >= 26) return 'observability-peak';
      return 'docker-yard';
    }

    // South Sector
    if (tx <= 16) return 'linux-suburbs';
    if (tx >= 24) return 'network-crossroads';

    return 'linux-suburbs';
  }

  destroy() {
    this.unsubState?.();
  }
}
