import Phaser from 'phaser';
import { gameState } from '../state';
import { MAP_WIDTH_TILES, MAP_HEIGHT_TILES, TILE_SIZE } from '../config';
import { WARP_STATION } from '../../data/warps';
import { SIGNS, SIGNS_LOCATION } from '../../data/signs';

const MAP_W = MAP_WIDTH_TILES * TILE_SIZE;
const MAP_H = MAP_HEIGHT_TILES * TILE_SIZE;

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
  VAULT: 9,       // 9: Security Vault Wall (Solid Obstacle)
  CABLE: 10,      // 10: Cable Duct Floor (Walkable)
  GEAR: 11,       // 11: Gear Machinery Block (Solid Obstacle)
  PIPE: 12,       // 12: Pipeline Floor (Walkable)
};

interface GateDef {
  zoneId: string;
  label: string;
  barrierX: number;
  barrierY: number;
  barrierW: number;
  barrierH: number;
  laserX1: number;
  laserY1: number;
  laserX2: number;
  laserY2: number;
  capX1: number;
  capY1: number;
  capX2: number;
  capY2: number;
  tagX: number;
  tagY: number;
}

interface GateRuntime extends GateDef {
  collider: Phaser.Physics.Arcade.Sprite;
  graphics: Phaser.GameObjects.Graphics;
  tag: Phaser.GameObjects.Text;
  capA: Phaser.GameObjects.Sprite;
  capB: Phaser.GameObjects.Sprite;
}

const GATE_DEFS: GateDef[] = [
  {
    // K8s Core laser gate (southern road entrance, between the datacenter walls)
    zoneId: 'k8s-core', label: 'K8S CORE',
    barrierX: 20 * 32 + 16, barrierY: 7 * 32 + 16, barrierW: 160, barrierH: 24,
    laserX1: 18 * 32 - 10, laserY1: 7 * 32 + 16, laserX2: 22 * 32 + 26, laserY2: 7 * 32 + 16,
    capX1: 18 * 32 - 10, capY1: 7 * 32 + 16, capX2: 22 * 32 + 26, capY2: 7 * 32 + 16,
    tagX: 20 * 32 + 16, tagY: 6 * 32 + 8,
  },
  {
    // Pipeline Plaza entrance (north road, south wall gap x43..46)
    zoneId: 'pipeline-plaza', label: 'PIPELINE PLAZA',
    barrierX: 45 * 32, barrierY: 7 * 32 + 16, barrierW: 144, barrierH: 24,
    laserX1: 43 * 32 + 10, laserY1: 7 * 32 + 16, laserX2: 46 * 32 + 22, laserY2: 7 * 32 + 16,
    capX1: 43 * 32 + 10, capY1: 7 * 32 + 16, capX2: 46 * 32 + 22, capY2: 7 * 32 + 16,
    tagX: 45 * 32, tagY: 6 * 32 + 8,
  },
{
    // SecOps Bastion entrance (north road, south wall gap x48..50)
    zoneId: 'secops-bastion', label: 'SECOPS BASTION',
    barrierX: 49 * 32 + 16, barrierY: 7 * 32 + 16, barrierW: 144, barrierH: 24,
    laserX1: 48 * 32 + 10, laserY1: 7 * 32 + 16, laserX2: 50 * 32 + 22, laserY2: 7 * 32 + 16,
    capX1: 48 * 32 + 10, capY1: 7 * 32 + 16, capX2: 50 * 32 + 22, capY2: 7 * 32 + 16,
    tagX: 49 * 32 + 16, tagY: 6 * 32 + 8,
  },
  {
    // Pipeline Plaza entrance (north road, south wall gap x58..60)
    zoneId: 'pipeline-plaza', label: 'PIPELINE PLAZA',
    barrierX: 59 * 32 + 16, barrierY: 7 * 32 + 16, barrierW: 144, barrierH: 24,
    laserX1: 58 * 32 + 10, laserY1: 7 * 32 + 16, laserX2: 60 * 32 + 22, laserY2: 7 * 32 + 16,
    capX1: 58 * 32 + 10, capY1: 7 * 32 + 16, capX2: 60 * 32 + 22, capY2: 7 * 32 + 16,
    tagX: 59 * 32 + 16, tagY: 6 * 32 + 8,
  },
  {
    // Storage Quay entrance (north wall gap x54..58, above the South Avenue)
    zoneId: 'storage-quay', label: 'STORAGE QUAY',
    barrierX: 56 * 32, barrierY: 24 * 32 + 16, barrierW: 144, barrierH: 24,
    laserX1: 54 * 32 + 10, laserY1: 24 * 32 + 16, laserX2: 58 * 32 + 22, laserY2: 24 * 32 + 16,
    capX1: 54 * 32 + 10, capY1: 24 * 32 + 16, capX2: 58 * 32 + 22, capY2: 24 * 32 + 16,
    tagX: 56 * 32, tagY: 23 * 32 + 8,
  },
  {
    // Edge Refinery entrance (south wall gap x56..60)
    zoneId: 'edge-refinery', label: 'EDGE REFINERY',
    barrierX: 58 * 32, barrierY: 21 * 32 + 16, barrierW: 144, barrierH: 24,
    laserX1: 56 * 32 + 10, laserY1: 21 * 32 + 16, laserX2: 60 * 32 + 22, laserY2: 21 * 32 + 16,
    capX1: 56 * 32 + 10, capY1: 21 * 32 + 16, capX2: 60 * 32 + 22, capY2: 21 * 32 + 16,
    tagX: 58 * 32, tagY: 20 * 32 + 8,
  },
];

interface InteractiveObj {
  x: number;
  y: number;
  type: 'npc' | 'terminal' | 'door' | 'gate' | 'library' | 'shop' | 'warp' | 'minigame' | 'sign';
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
  
  // Gate physics & visuals (data-driven, one entry per protected district)
  private gates: GateRuntime[] = [];
  private gateColliders: Phaser.Physics.Arcade.Sprite[] = [];

  // Visual effects
  private questBeacon!: Phaser.GameObjects.Graphics;
  private waterShimmer!: Phaser.GameObjects.Graphics;
  private unsubState?: () => void;
  private onTeleport?: (payload: { x: number; y: number }) => void;
  
  constructor() {
    super({ key: 'CityScene' });
  }

  create() {
    // 1. Generate City Map (40 x 30 tiles = 1280 x 960 px)
    const mapLayer = this.generateMap();
    
    // 2. Setup Interactive Objects & NPCs
    this.setupInteractibles();

// 3. Security Laser Barriers for closed districts
    this.setupSecurityGates();

    // 4. Physics world must match the FULL tilemap, not the viewport
    const worldWidth = MAP_W;
    const worldHeight = MAP_H;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // 5. Player Character (Spawn in Linux Suburbs on road at x: 8*32, y: 24*32)
    this.player = this.physics.add.sprite(8 * 32, 24 * 32, 'player-down');
    this.player.setCollideWorldBounds(true);
    this.player.setSize(18, 20);
    this.player.setOffset(7, 8);
    this.player.setDepth(20);

    // Collision with solid tilemap objects and all gate barriers
    this.physics.add.collider(this.player, mapLayer);
    this.gateColliders.forEach(collider => this.physics.add.collider(this.player, collider));

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

    // Teleport from the Warp Hub (emitted by the React layer via GameBridge)
    this.onTeleport = (payload: { x: number; y: number }) => {
      this.player.setPosition(payload.x, payload.y);
      this.player.setVelocity(0, 0);
      this.cameras.main.centerOn(payload.x, payload.y);
    };
    this.game.events.on('teleport', this.onTeleport);

    this.updateSecurityGates();
  }

  private setupSecurityGates() {
    this.gates = GATE_DEFS.map(def => {
      const collider = this.physics.add.staticSprite(def.barrierX, def.barrierY, 'gate-barrier-texture');
      collider.setVisible(false);
      if (collider.body) {
        collider.setDisplaySize(def.barrierW, def.barrierH);
        (collider.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
      }
      this.gateColliders.push(collider);

      const graphics = this.add.graphics().setDepth(15);
      const capA = this.add.sprite(def.capX1, def.capY1, 'gate-pylon').setDepth(16);
      const capB = this.add.sprite(def.capX2, def.capY2, 'gate-pylon').setDepth(16);

      const tag = this.add.text(def.tagX, def.tagY, '🔒 ШЛЮЗ: ' + def.label, {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#ef4444',
        fontStyle: 'bold',
        backgroundColor: '#0a0e1a',
      }).setOrigin(0.5).setDepth(17);

      return { ...def, collider, graphics, tag, capA, capB };
    });
  }

  private updateSecurityGates() {
    for (const gate of this.gates) {
      const isUnlocked = gameState.isZoneUnlocked(gate.zoneId);
      gate.graphics.clear();

      if (!isUnlocked) {
        if (gate.collider.body) {
          gate.collider.body.enable = true;
        }

        // Outer glow
        gate.graphics.lineStyle(6, 0xef4444, 0.4);
        gate.graphics.lineBetween(gate.laserX1, gate.laserY1, gate.laserX2, gate.laserY2);

        // Core red laser
        gate.graphics.lineStyle(3, 0xef4444, 0.95);
        gate.graphics.lineBetween(gate.laserX1, gate.laserY1, gate.laserX2, gate.laserY2);

        // White hot core
        gate.graphics.lineStyle(1, 0xffffff, 0.9);
        gate.graphics.lineBetween(gate.laserX1, gate.laserY1, gate.laserX2, gate.laserY2);

        gate.tag.setText(`🔒 ШЛЮЗ: ${gate.label} (Закрыто)`).setColor('#ef4444');
        gate.capA.setTint(0xff5555);
        gate.capB.setTint(0xff5555);
      } else {
        if (gate.collider.body) {
          gate.collider.body.enable = false;
        }

        // Soft green deactivation beam
        gate.graphics.lineStyle(2, 0x22c55e, 0.4);
        gate.graphics.lineBetween(gate.laserX1, gate.laserY1, gate.laserX2, gate.laserY2);

        gate.tag.setText(`🔓 ШЛЮЗ: ${gate.label} (Открыто)`).setColor('#22c55e');
        gate.capA.setTint(0x55ff55);
        gate.capB.setTint(0x55ff55);
      }
    }
  }

  private generateMap(): Phaser.Tilemaps.TilemapLayer {
    const map = this.make.tilemap({ tileWidth: TILE_SIZE, tileHeight: TILE_SIZE, width: MAP_WIDTH_TILES, height: MAP_HEIGHT_TILES });
    
    // Explicitly set gid = 0 to match 0-indexed texture tiles
    const tileset = map.addTilesetImage('tileset', 'tileset', TILE_SIZE, TILE_SIZE, 0, 0, 0)!;
    const layer = map.createBlankLayer('ground', tileset)!;

    // 1. Natural Grass everywhere (Walkable TILE.GRASS = 1)
    for (let y = 0; y < MAP_HEIGHT_TILES; y++) {
      for (let x = 0; x < MAP_WIDTH_TILES; x++) {
        layer.putTileAt(TILE.GRASS, x, y);
      }
    }

    // 2. Cyber River (Solid TILE.WATER = 4 at y = 13..15)
    for (let x = 0; x < MAP_WIDTH_TILES; x++) {
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
    for (let y = 0; y < MAP_HEIGHT_TILES; y++) {
      if (y < 13 || y > 15) {
        layer.putTileAt(TILE.ROAD, 19, y);
        layer.putTileAt(TILE.ROAD, 20, y);
        layer.putTileAt(TILE.ROAD, 21, y);
      }
    }

    // 5. South East-West Avenue (Walkable TILE.ROAD = 0 at y = 23..24)
    for (let x = 2; x < MAP_WIDTH_TILES - 1; x++) {
      layer.putTileAt(TILE.ROAD, x, 23);
      layer.putTileAt(TILE.ROAD, x, 24);
    }

    // 6. North East-West Avenue (Walkable TILE.ROAD = 0 at y = 8..9, full width)
    for (let x = 2; x < MAP_WIDTH_TILES - 1; x++) {
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

    // 12. East Corridor (new access road x44..48, y10..22, crosses the river via the 2nd bridge y13..15)
    for (let x = 44; x <= 48; x++) {
      for (let y = 10; y <= 22; y++) {
        if (y === 13 || y === 14 || y === 15) {
          layer.putTileAt(TILE.BRIDGE, x, y);
        } else {
          layer.putTileAt(TILE.ROAD, x, y);
        }
      }
    }

    // 13. SecOps Bastion (Fortress on the North-East avenue, interior x = 44..51, y = 2..6)
    // Interior cable floor (above the avenue, behind its own gate)
    for (let x = 44; x <= 51; x++) {
      for (let y = 2; y <= 6; y++) {
        layer.putTileAt(TILE.CABLE, x, y);
      }
    }
    // West perimeter wall
    for (let y = 2; y <= 8; y++) {
      layer.putTileAt(TILE.VAULT, 42, y);
      layer.putTileAt(TILE.VAULT, 43, y);
    }
    // East perimeter wall (also keeps the Pipeline sealed on its west)
    for (let y = 2; y <= 8; y++) {
      layer.putTileAt(TILE.VAULT, 52, y);
      layer.putTileAt(TILE.VAULT, 53, y);
    }
    // North perimeter wall
    for (let x = 44; x <= 53; x++) {
      layer.putTileAt(TILE.VAULT, x, 1);
    }
    // South perimeter wall with road gap x = 48..50 (gate row at y = 7)
    for (let x = 44; x <= 53; x++) {
      if (x < 48 || x > 50) {
        layer.putTileAt(TILE.VAULT, x, 7);
      }
    }
    // Entrance road (from the North Avenue through the gate)
    for (let x = 48; x <= 50; x++) {
      for (let y = 2; y <= 8; y++) {
        layer.putTileAt(TILE.ROAD, x, y);
      }
    }
    // Interior vault buildings (corridors between them)
    for (let x = 44; x <= 45; x++) {
      for (let y = 3; y <= 5; y++) {
        layer.putTileAt(TILE.VAULT, x, y);
      }
    }
    for (let y = 3; y <= 5; y++) {
      layer.putTileAt(TILE.VAULT, 51, y);
    }
    layer.putTileAt(TILE.GEAR, 46, 6);
    layer.putTileAt(TILE.GEAR, 50, 2);
    layer.putTileAt(TILE.GEAR, 47, 2);

    // 14. Pipeline Plaza (Far North-East district, interior x = 54..61, y = 0..6)
    // Cable duct floors
    for (let x = 54; x <= 61; x++) {
      for (let y = 0; y <= 6; y++) {
        layer.putTileAt(TILE.CABLE, x, y);
      }
    }
    // West perimeter wall (shared column with the SecOps Bastion east wall)
    for (let y = 0; y <= 7; y++) {
      layer.putTileAt(TILE.VAULT, 52, y);
      layer.putTileAt(TILE.VAULT, 53, y);
    }
    // East perimeter wall (map edge column)
    for (let y = 0; y <= 7; y++) {
      layer.putTileAt(TILE.VAULT, 62, y);
    }
    // South perimeter wall with road gap x = 58..60 (gate row at y = 7)
    for (let x = 54; x <= 63; x++) {
      if (x < 58 || x > 60) {
        layer.putTileAt(TILE.VAULT, x, 7);
      }
    }
    // Entrance road (from the North Avenue, under the gate at y = 7)
    for (let x = 58; x <= 60; x++) {
      for (let y = 2; y <= 8; y++) {
        layer.putTileAt(TILE.ROAD, x, y);
      }
    }
    // Machinery decorations
    for (const [geoX, geoY] of [[55, 1], [56, 4], [60, 1], [61, 4], [54, 3], [54, 6], [61, 6]] as const) {
      layer.putTileAt(TILE.GEAR, geoX, geoY);
    }
    for (const [pipX, pipY] of [[54, 0], [57, 3], [61, 0], [59, 6]] as const) {
      layer.putTileAt(TILE.PIPE, pipX, pipY);
    }

    // 15. Edge Refinery (East bank district, interior x = 54..61, y = 13..19)
    // Industrial floors
    for (let x = 54; x <= 61; x++) {
      for (let y = 13; y <= 19; y++) {
        layer.putTileAt(TILE.PIPE, x, y);
      }
    }
    for (let x = 54; x <= 61; x++) {
      layer.putTileAt(TILE.CABLE, x, 14);
      layer.putTileAt(TILE.CABLE, x, 17);
    }
    // North perimeter wall
    for (let x = 53; x <= 62; x++) {
      layer.putTileAt(TILE.VAULT, x, 12);
    }
    // West perimeter wall
    for (let y = 13; y <= 20; y++) {
      layer.putTileAt(TILE.VAULT, 51, y);
      layer.putTileAt(TILE.VAULT, 52, y);
    }
    // East perimeter wall (map edge column)
    for (let y = 13; y <= 20; y++) {
      layer.putTileAt(TILE.VAULT, 62, y);
    }
    // South perimeter wall with road gap x = 56..60 (gate row at y = 21)
    for (let x = 53; x <= 62; x++) {
      if (x < 56 || x > 60) {
        layer.putTileAt(TILE.VAULT, x, 21);
      }
    }
    // Entrance road (from South Avenue through the gate)
    for (let x = 56; x <= 60; x++) {
      for (let y = 20; y <= 23; y++) {
        layer.putTileAt(TILE.ROAD, x, y);
      }
    }
    // Reactor machinery
    for (const [geoX, geoY] of [[54, 13], [56, 15], [58, 18], [61, 13], [60, 16], [55, 19]] as const) {
      layer.putTileAt(TILE.GEAR, geoX, geoY);
    }

    // 16. Storage Quay (Far South-East warehouse district, interior x = 48..61, y = 25..34)
    // Interior floors
    for (let x = 48; x <= 61; x++) {
      for (let y = 25; y <= 34; y++) {
        layer.putTileAt(TILE.CABLE, x, y);
      }
    }
    // North perimeter wall with road gap x = 54..58 (below the South Avenue)
    for (let x = 48; x <= 62; x++) {
      if (x < 54 || x > 58) {
        layer.putTileAt(TILE.VAULT, x, 24);
      }
    }
    // West perimeter wall
    for (let y = 25; y <= 34; y++) {
      layer.putTileAt(TILE.VAULT, 46, y);
      layer.putTileAt(TILE.VAULT, 47, y);
    }
    // East perimeter wall
    for (let y = 25; y <= 34; y++) {
      layer.putTileAt(TILE.VAULT, 62, y);
      layer.putTileAt(TILE.VAULT, 63, y);
    }
    // South perimeter wall
    for (let x = 48; x <= 61; x++) {
      layer.putTileAt(TILE.VAULT, x, 35);
    }
    // Entrance road (from South Avenue through the gate)
    for (let x = 54; x <= 58; x++) {
      for (let y = 23; y <= 26; y++) {
        layer.putTileAt(TILE.ROAD, x, y);
      }
    }
    // Warehouse rack rows (aisles between them)
    for (let x = 49; x <= 53; x++) {
      for (let y = 27; y <= 28; y++) {
        layer.putTileAt(TILE.VAULT, x, y);
      }
    }
    for (let x = 59; x <= 61; x++) {
      for (let y = 27; y <= 28; y++) {
        layer.putTileAt(TILE.VAULT, x, y);
      }
    }
    for (let x = 49; x <= 53; x++) {
      for (let y = 31; y <= 32; y++) {
        layer.putTileAt(TILE.VAULT, x, y);
      }
    }
    for (let x = 59; x <= 61; x++) {
      for (let y = 31; y <= 32; y++) {
        layer.putTileAt(TILE.VAULT, x, y);
      }
    }
    // Backup drive banks
    layer.putTileAt(TILE.GEAR, 48, 26);
    layer.putTileAt(TILE.GEAR, 61, 33);
    layer.putTileAt(TILE.GEAR, 55, 30);

    // ONLY solid obstacle tiles collide (Grass, Road, Bridge, Terminal, Cable, Pipe are 100% WALKABLE!)
    layer.setCollision([
      TILE.DATACENTER,
      TILE.CONTAINER,
      TILE.WATER,
      TILE.DOME,
      TILE.FENCE,
      TILE.VAULT,
      TILE.GEAR,
    ]);

    return layer;
  }

  private setupInteractibles() {
    const addInteractive = (
      x: number,
      y: number,
      type: 'npc' | 'terminal' | 'door' | 'gate' | 'library' | 'shop' | 'warp' | 'minigame' | 'sign',
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

    // Genadiy at Pipeline Plaza (Far North-East)
    addInteractive(56 * 32, 4 * 32, 'npc', 'genadiy', 'npc-genadiy', 'pipeline-plaza', 'Генадий [Pipeline]', '#22d3ee');

    // Katya at SecOps Bastion (North-East)
    addInteractive(46 * 32, 4 * 32, 'npc', 'katya', 'npc-katya', 'secops-bastion', 'Катя [SecOps]', '#f472b6');

    // Svetlana near Storage Quay gate (South-East)
    addInteractive(50 * 32, 27 * 32, 'npc', 'svetlana', 'npc-svetlana', 'storage-quay', 'Светлана [DBA]', '#a78bfa');

    // Nikita deeper in Storage Quay
    addInteractive(57 * 32, 33 * 32, 'npc', 'nikita', 'npc-nikita', 'storage-quay', 'Никита [DBA]', '#a78bfa');

    // Toha at Edge Refinery (East Bank)
    addInteractive(57 * 32, 16 * 32, 'npc', 'toha', 'npc-toha', 'edge-refinery', 'Тоха [Edge]', '#fb923c');

    // Boss 2 spawn inside War Room (after Boss 1)
    addInteractive(35 * 32, 9 * 32, 'npc', 'boss2', 'npc-boss2', 'incident-war-room', '🤖 БОСС 2', '#f87171');

    // Terminals
    addInteractive(11 * 32, 22 * 32, 'terminal', 'term-linux', 'term-icon', 'linux-suburbs', 'Linux CLI', '#22c55e');
    addInteractive(20 * 32, 3 * 32, 'terminal', 'term-k8s', 'term-icon', 'k8s-core', 'K8s Core', '#a855f7');
    addInteractive(30 * 32, 23 * 32, 'terminal', 'term-net', 'term-icon', 'network-crossroads', 'NetOps Kiosk', '#ec4899');
    addInteractive(35 * 32, 12 * 32, 'terminal', 'term-cloud', 'term-icon', 'cloud-valley', 'Cloud IaC Console', '#38bdf8');
    addInteractive(59 * 32, 3 * 32, 'terminal', 'term-pipeline', 'term-icon', 'pipeline-plaza', 'Pipeline Console', '#22d3ee');
    addInteractive(45 * 32, 6 * 32, 'terminal', 'term-secops', 'term-icon', 'secops-bastion', 'SecOps Audit', '#f472b6');
    addInteractive(52 * 32, 26 * 32, 'terminal', 'term-storage', 'term-icon', 'storage-quay', 'Storage Admin', '#a78bfa');
    addInteractive(59 * 32, 18 * 32, 'terminal', 'term-edge', 'term-icon', 'edge-refinery', 'Edge Console', '#fb923c');
    addInteractive(34 * 32, 9 * 32, 'terminal', 'term-boss2', 'term-icon', 'incident-war-room', 'DR Console', '#f87171');

    // Library (Knowledge Base — центр города, у пересечения Южной авеню и центрального хайвея)
    addInteractive(18 * 32, 22 * 32, 'library', 'library', 'lib-icon', 'linux-suburbs', '📚 Библиотека', '#fbbf24');

    // Shops (DevOps trading kiosks)
    addInteractive(29 * 32, 23 * 32, 'shop', 'shop-net', 'shop-icon', 'network-crossroads', '🛒 NetOps Shop', '#fbbf24');
    addInteractive(55 * 32, 2 * 32, 'shop', 'shop-pipeline', 'shop-icon', 'pipeline-plaza', '🛒 Pipeline Shop', '#fbbf24');

    // Warp hub (fast travel; placed near the Victory Monument road crossing)
    addInteractive(WARP_STATION.x, WARP_STATION.y, 'warp', 'warp-hub', 'warp-icon', 'git-bridge', '🚀 Warp Hub', '#22d3ee');

    // Arcade kiosks (minigames)
    addInteractive(31 * 32, 24 * 32, 'minigame', 'packet-catch', 'arcade-icon', 'network-crossroads', '🕹️ Packet Catch', '#f472b6');
    addInteractive(34 * 32, 8 * 32, 'minigame', 'uptime-jump', 'arcade-icon', 'incident-war-room', '🕹️ Uptime Jump', '#f472b6');

    // Info signs near the new Far-East districts & the warp hub
    for (const [signId, [sx, sy, texture]] of Object.entries(SIGNS_LOCATION)) {
      const sign = SIGNS[signId];
      addInteractive(sx, sy, 'sign', signId, texture, 'git-bridge', sign.icon + ' ' + sign.title, sign.color);
    }
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
      if (obj.id === 'boss2') {
        const boss2Progress = gameState.get().questProgress['quest-boss2-01'];
        if (boss2Progress?.status !== 'available' && boss2Progress?.status !== 'completed') continue;
      }
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

    // 3. East River flowing waves (x: 746 .. MAP_W)
    const eastStartX = bridgeRight + 10;
    const eastWidth = MAP_W - eastStartX - 10;
    for (let i = 0; i < 4; i++) {
      const ex = eastStartX + ((i * 140 + this.time.now * 0.025) % eastWidth);
      const ey = 13 * 32 + 8 + ((i + 1) % 3) * 26;
      if (ex + 24 < MAP_W - 10) {
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
    } else if (state.questProgress['quest-boss2-01']?.status !== 'completed' && state.questProgress['quest-boss2-01']?.status !== 'locked') {
      targetObj = this.interactibles.find(i => i.id === 'boss2');
    } else if (state.questProgress['quest-pipeline-01']?.status !== 'completed' && state.unlockedZones.includes('pipeline-plaza')) {
      targetObj = this.interactibles.find(i => i.id === 'genadiy');
    } else if (state.questProgress['quest-secops-01']?.status !== 'completed' && state.unlockedZones.includes('secops-bastion')) {
      targetObj = this.interactibles.find(i => i.id === 'katya');
    } else if (state.questProgress['quest-storage-01']?.status !== 'completed' && state.unlockedZones.includes('storage-quay')) {
      targetObj = this.interactibles.find(i => i.id === 'svetlana');
    } else if (state.questProgress['quest-storage-02']?.status !== 'completed' && state.unlockedZones.includes('storage-quay')) {
      targetObj = this.interactibles.find(i => i.id === 'nikita');
    } else if (state.questProgress['quest-edge-01']?.status !== 'completed' && state.unlockedZones.includes('edge-refinery')) {
      targetObj = this.interactibles.find(i => i.id === 'toha');
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
    const tx = Math.floor(x / TILE_SIZE);
    const ty = Math.floor(y / TILE_SIZE);

    // New Far-East districts (checked before the generic regions below)
    if (tx >= 54 && tx <= 62 && ty >= 0 && ty <= 7) return 'pipeline-plaza';
    if (tx >= 44 && tx <= 53 && ty >= 1 && ty <= 7) return 'secops-bastion';
    if (tx >= 53 && tx <= 62 && ty >= 12 && ty <= 21) return 'edge-refinery';
    if (tx >= 48 && tx <= 63 && ty >= 23 && ty <= 35) return 'storage-quay';

    // East Corridor (2nd bridge road — part of the Git Bridge crossing family)
    if (tx >= 44 && tx <= 48 && ty >= 12 && ty <= 22) return 'git-bridge';

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
    if (this.onTeleport) {
      this.game.events.off('teleport', this.onTeleport);
      this.onTeleport = undefined;
    }
    this.unsubState?.();
  }
}
