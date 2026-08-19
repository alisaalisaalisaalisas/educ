import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    this.createPlayerSprites();
    this.createTileset();
    this.createNPCSprites();
    this.createGateSprites();
    this.createUIElements();
  }

  create() {
    this.scene.start('CityScene');
  }

  private createPlayerSprites() {
    const directions = ['down', 'left', 'right', 'up'] as const;

    for (const dir of directions) {
      const graphics = this.make.graphics({ x: 0, y: 0, add: false } as any);

      // Soft character shadow
      graphics.fillStyle(0x000000, 0.35);
      graphics.fillEllipse(16, 29, 18, 5);

      // Shoes / Legs (Dark slate navy with sky blue sole accents)
      graphics.fillStyle(0x1e293b, 1);
      graphics.fillRect(10, 22, 4, 6);
      graphics.fillRect(18, 22, 4, 6);
      graphics.fillStyle(0x38bdf8, 1);
      graphics.fillRect(10, 27, 4, 1);
      graphics.fillRect(18, 27, 4, 1);

      // Body (Cyan DevOps Hoodie)
      graphics.fillStyle(0x0891b2, 1);
      graphics.fillRoundedRect(8, 11, 16, 12, 3);
      graphics.fillStyle(0x06b6d4, 1);
      graphics.fillRect(9, 12, 14, 10);
      
      // Zipper
      graphics.fillStyle(0x155e75, 1);
      graphics.fillRect(15, 11, 2, 11);

      // Head / Face (Peach skin tone)
      graphics.fillStyle(0xfbcfe8, 1);
      graphics.fillRoundedRect(9, 3, 14, 10, 2);

      // Hair (Dark slate)
      graphics.fillStyle(0x334155, 1);
      graphics.fillRect(9, 2, 14, 4);

      if (dir === 'down') {
        // Headphones
        graphics.fillStyle(0x0284c7, 1);
        graphics.fillRect(7, 5, 3, 5);
        graphics.fillRect(22, 5, 3, 5);
        graphics.fillRect(8, 2, 16, 2);

        // Eyes
        graphics.fillStyle(0x0f172a, 1);
        graphics.fillRect(11, 7, 2, 3);
        graphics.fillRect(19, 7, 2, 3);

        // Glowing Laptop with green terminal
        graphics.fillStyle(0x334155, 1);
        graphics.fillRect(9, 15, 14, 8);
        graphics.fillStyle(0x22c55e, 1);
        graphics.fillRect(11, 16, 10, 5);
        graphics.fillStyle(0xffffff, 0.9);
        graphics.fillRect(12, 17, 3, 1);
      } else if (dir === 'left') {
        graphics.fillStyle(0x0284c7, 1);
        graphics.fillRect(7, 5, 3, 5);
        graphics.fillRect(8, 2, 12, 2);

        graphics.fillStyle(0x0f172a, 1);
        graphics.fillRect(10, 7, 2, 3);

        graphics.fillStyle(0x334155, 1);
        graphics.fillRect(6, 16, 10, 6);
        graphics.fillStyle(0x22c55e, 1);
        graphics.fillRect(7, 17, 6, 4);
      } else if (dir === 'right') {
        graphics.fillStyle(0x0284c7, 1);
        graphics.fillRect(22, 5, 3, 5);
        graphics.fillRect(12, 2, 12, 2);

        graphics.fillStyle(0x0f172a, 1);
        graphics.fillRect(20, 7, 2, 3);

        graphics.fillStyle(0x334155, 1);
        graphics.fillRect(16, 16, 10, 6);
        graphics.fillStyle(0x22c55e, 1);
        graphics.fillRect(19, 17, 6, 4);
      } else if (dir === 'up') {
        graphics.fillStyle(0x334155, 1);
        graphics.fillRect(9, 3, 14, 8);

        graphics.fillStyle(0x0284c7, 1);
        graphics.fillRect(8, 2, 16, 2);

        graphics.fillStyle(0x1e293b, 1);
        graphics.fillRoundedRect(10, 13, 12, 9, 2);
        graphics.fillStyle(0x22d3ee, 1);
        graphics.fillRect(13, 16, 6, 2);
      }

      graphics.generateTexture(`player-${dir}`, 32, 32);
    }
  }

  private createTileset() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false } as any);

    // ==========================================
    // 0: Road (Smooth asphalt with soft dashed markings)
    // ==========================================
    graphics.fillStyle(0x182234, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.fillStyle(0x1f2b3e, 0.5);
    graphics.fillRect(2, 2, 28, 28);
    // Center dashed lane marker
    graphics.fillStyle(0x475569, 0.7);
    graphics.fillRect(15, 3, 2, 8);
    graphics.fillRect(15, 19, 2, 8);

    // ==========================================
    // 1: Seamless Lush Meadow Grass (Eye-friendly, zero harsh grid)
    // ==========================================
    // Uniform rich forest green base
    graphics.fillStyle(0x1a3d24, 1);
    graphics.fillRect(32, 0, 32, 32);

    // Soft organic hue variations
    graphics.fillStyle(0x1f472b, 0.7);
    graphics.fillRect(36, 4, 10, 8);
    graphics.fillRect(50, 16, 10, 8);

    // Delicate grass blade tufts
    graphics.fillStyle(0x2d633c, 0.8);
    graphics.fillRect(38, 8, 2, 3);
    graphics.fillRect(41, 6, 2, 4);
    graphics.fillRect(52, 20, 2, 3);
    graphics.fillRect(55, 18, 2, 4);

    // Soft gentle highlights (no bright dots)
    graphics.fillStyle(0x3e8552, 0.4);
    graphics.fillRect(39, 7, 1, 2);
    graphics.fillRect(53, 19, 1, 2);

    // ==========================================
    // 2: K8s / Datacenter Building Wall (Obstacle)
    // ==========================================
    graphics.fillStyle(0x0f172a, 1);
    graphics.fillRect(64, 0, 32, 32);
    graphics.fillStyle(0x1e293b, 1);
    graphics.fillRect(65, 1, 30, 30);
    graphics.lineStyle(1, 0x3b82f6, 0.8);
    graphics.strokeRect(65, 1, 30, 30);
    // Server LED slot arrays
    graphics.fillStyle(0x090d16, 1);
    graphics.fillRect(68, 5, 24, 6);
    graphics.fillRect(68, 13, 24, 6);
    graphics.fillRect(68, 21, 24, 6);
    graphics.fillStyle(0x22d3ee, 0.9);
    graphics.fillRect(70, 7, 4, 2);
    graphics.fillRect(78, 7, 4, 2);
    graphics.fillStyle(0x4ade80, 0.9);
    graphics.fillRect(70, 15, 4, 2);
    graphics.fillRect(84, 15, 4, 2);
    graphics.fillStyle(0xa855f7, 0.9);
    graphics.fillRect(76, 23, 6, 2);

    // ==========================================
    // 3: Docker Container / Metal Crate (Obstacle)
    // ==========================================
    graphics.fillStyle(0x0c4a6e, 1);
    graphics.fillRect(96, 0, 32, 32);
    graphics.fillStyle(0x075985, 1);
    graphics.fillRect(97, 1, 30, 30);
    graphics.lineStyle(1, 0x38bdf8, 0.8);
    graphics.strokeRect(97, 1, 30, 30);
    // Vertical container corrugated ribs
    graphics.fillStyle(0x0284c7, 1);
    graphics.fillRect(102, 3, 3, 26);
    graphics.fillRect(108, 3, 3, 26);
    graphics.fillRect(114, 3, 3, 26);
    graphics.fillRect(120, 3, 3, 26);

    // ==========================================
    // 4: Deep Sapphire River Water (Obstacle)
    // ==========================================
    graphics.fillStyle(0x0e263d, 1);
    graphics.fillRect(128, 0, 32, 32);
    // Flowing water bands
    graphics.fillStyle(0x133758, 0.9);
    graphics.fillRect(128, 4, 32, 10);
    graphics.fillRect(128, 18, 32, 10);
    // Soft ripples
    graphics.fillStyle(0x1b4d7a, 0.8);
    graphics.fillRect(130, 6, 12, 4);
    graphics.fillRect(146, 10, 10, 3);
    graphics.fillRect(132, 20, 14, 4);
    graphics.fillRect(148, 22, 8, 3);

    // ==========================================
    // 5: Git Bridge (Wooden Plank Deck)
    // ==========================================
    graphics.fillStyle(0x5c2c16, 1);
    graphics.fillRect(160, 0, 32, 32);
    graphics.fillStyle(0x7c3a1d, 1);
    graphics.fillRect(161, 2, 30, 8);
    graphics.fillRect(161, 12, 30, 8);
    graphics.fillRect(161, 22, 30, 8);
    graphics.fillStyle(0x9a4c24, 0.8);
    graphics.fillRect(162, 3, 28, 2);
    graphics.fillRect(162, 13, 28, 2);
    graphics.fillRect(162, 23, 28, 2);
    // Iron bolts
    graphics.fillStyle(0xd97706, 0.9);
    graphics.fillRect(163, 6, 2, 2);
    graphics.fillRect(187, 6, 2, 2);
    graphics.fillRect(163, 16, 2, 2);
    graphics.fillRect(187, 16, 2, 2);
    graphics.fillRect(163, 26, 2, 2);
    graphics.fillRect(187, 26, 2, 2);

    // ==========================================
    // 6: Terminal Station Floor
    // ==========================================
    graphics.fillStyle(0x0f172a, 1);
    graphics.fillRect(192, 0, 32, 32);
    graphics.lineStyle(1, 0x22c55e, 0.7);
    graphics.strokeRect(193, 1, 30, 30);
    graphics.fillStyle(0x14532d, 1);
    graphics.fillRect(198, 8, 20, 16);
    graphics.fillStyle(0x4ade80, 1);
    graphics.fillRect(202, 11, 12, 9);

    // ==========================================
    // 7: Observability Dome Wall (Obstacle)
    // ==========================================
    graphics.fillStyle(0x1e1b4b, 1);
    graphics.fillRect(224, 0, 32, 32);
    graphics.lineStyle(2, 0x818cf8, 0.9);
    graphics.strokeRect(225, 1, 30, 30);
    graphics.fillStyle(0xc084fc, 0.9);
    graphics.fillCircle(240, 16, 8);

    // ==========================================
    // 8: Security Perimeter Fence / Wall (Obstacle)
    // ==========================================
    graphics.fillStyle(0x0f172a, 1);
    graphics.fillRect(256, 0, 32, 32);
    graphics.fillStyle(0x1e293b, 1);
    graphics.fillRect(257, 1, 30, 30);
    graphics.lineStyle(1, 0xef4444, 0.8);
    graphics.strokeRect(257, 1, 30, 30);
    // Steel grid lines
    graphics.lineStyle(1, 0x64748b, 0.6);
    graphics.lineBetween(260, 4, 284, 28);
    graphics.lineBetween(284, 4, 260, 28);
    graphics.fillStyle(0xef4444, 0.8);
    graphics.fillRect(268, 13, 8, 6);

    graphics.generateTexture('tileset', 288, 32);

    // Dedicated terminal icon
    const termIcon = this.make.graphics({ x: 0, y: 0, add: false } as any);
    termIcon.fillStyle(0x0f172a, 0.95);
    termIcon.fillRoundedRect(0, 0, 32, 32, 6);
    termIcon.lineStyle(2, 0x22c55e, 1);
    termIcon.strokeRoundedRect(0, 0, 32, 32, 6);
    termIcon.fillStyle(0x22c55e, 1);
    termIcon.fillRect(6, 6, 20, 14);
    termIcon.fillStyle(0x052e16, 1);
    termIcon.fillRect(8, 8, 16, 10);
    termIcon.fillStyle(0x4ade80, 1);
    termIcon.fillRect(10, 10, 4, 2);
    termIcon.fillRect(10, 14, 8, 2);
    termIcon.fillStyle(0x64748b, 1);
    termIcon.fillRect(12, 22, 8, 4);
    termIcon.fillRect(8, 26, 16, 2);
    termIcon.generateTexture('term-icon', 32, 32);
  }

  private createGateSprites() {
    // Pylon post sprite for laser gate
    const graphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
    graphics.fillStyle(0x0f172a, 1);
    graphics.fillRoundedRect(4, 2, 24, 28, 4);
    graphics.lineStyle(2, 0xef4444, 1);
    graphics.strokeRoundedRect(4, 2, 24, 28, 4);
    // Emitter core
    graphics.fillStyle(0xef4444, 1);
    graphics.fillCircle(16, 14, 6);
    graphics.fillStyle(0xffffff, 0.9);
    graphics.fillCircle(16, 14, 3);
    graphics.generateTexture('gate-pylon', 32, 32);

    // Gate barrier texture (160x24) for solid physics collider
    const barrierGfx = this.make.graphics({ x: 0, y: 0, add: false } as any);
    barrierGfx.fillStyle(0xef4444, 0.01);
    barrierGfx.fillRect(0, 0, 160, 24);
    barrierGfx.generateTexture('gate-barrier-texture', 160, 24);
  }

  private createNPCSprites() {
    const makeNPC = (key: string, shirtColor: number, hairColor: number, accessory?: string) => {
      const graphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
      
      graphics.fillStyle(0x000000, 0.35);
      graphics.fillEllipse(16, 29, 18, 5);

      graphics.fillStyle(0x1e293b, 1);
      graphics.fillRect(10, 22, 4, 6);
      graphics.fillRect(18, 22, 4, 6);

      graphics.fillStyle(shirtColor, 1);
      graphics.fillRoundedRect(8, 11, 16, 12, 2);

      graphics.fillStyle(0xfbcfe8, 1);
      graphics.fillRoundedRect(9, 3, 14, 10, 2);

      graphics.fillStyle(hairColor, 1);
      graphics.fillRect(9, 2, 14, 4);

      graphics.fillStyle(0x0f172a, 1);
      graphics.fillRect(11, 7, 2, 3);
      graphics.fillRect(19, 7, 2, 3);

      if (accessory === 'badge') {
        graphics.fillStyle(0xef4444, 1);
        graphics.fillRect(18, 13, 5, 7);
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(19, 15, 3, 3);
      } else if (accessory === 'beard') {
        graphics.fillStyle(0x94a3b8, 1);
        graphics.fillRect(11, 10, 10, 5);
      } else if (accessory === 'glasses') {
        graphics.lineStyle(1, 0x0284c7, 1);
        graphics.strokeRect(10, 6, 4, 4);
        graphics.strokeRect(18, 6, 4, 4);
        graphics.fillRect(14, 8, 4, 1);
      } else if (accessory === 'siren') {
        graphics.fillStyle(0xef4444, 1);
        graphics.fillCircle(16, 2, 4);
        graphics.fillStyle(0xffffff, 0.9);
        graphics.fillCircle(16, 2, 2);
      } else if (accessory === 'cap') {
        graphics.fillStyle(0xd97706, 1);
        graphics.fillRect(8, 1, 16, 4);
        graphics.fillRect(14, 4, 10, 2);
      }
      
      graphics.generateTexture(key, 32, 32);
    };
    
    makeNPC('npc-vasya', 0x16a34a, 0x78350f, 'glasses'); // Junior Dev
    makeNPC('npc-elena', 0x2563eb, 0x1e1b4b, 'badge');   // SRE Architect
    makeNPC('npc-boris', 0x475569, 0x94a3b8, 'beard');   // Sysadmin
    makeNPC('npc-matvey', 0xf59e0b, 0x451a03, 'cap');    // Git/CI Guru
    makeNPC('npc-daria', 0xec4899, 0x831843, 'glasses'); // NetOps Engineer
    makeNPC('npc-igor', 0x8b5cf6, 0x1e1b4b, 'glasses');  // SRE Observability
    makeNPC('npc-artem', 0x0284c7, 0x1e293b, 'glasses'); // Cloud/IaC Architect
    makeNPC('npc-siren', 0xdc2626, 0x18181b, 'siren');   // Incident Dispatcher
  }

  private createUIElements() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
    graphics.fillStyle(0x0a0e1a, 0.95);
    graphics.fillRoundedRect(0, 0, 28, 28, 6);
    graphics.lineStyle(2, 0x22d3ee, 1);
    graphics.strokeRoundedRect(0, 0, 28, 28, 6);
    
    graphics.fillStyle(0x22d3ee, 1);
    graphics.fillRect(7, 7, 14, 3);
    graphics.fillRect(7, 7, 3, 14);
    graphics.fillRect(7, 13, 11, 3);
    graphics.fillRect(7, 18, 14, 3);
    
    graphics.generateTexture('prompt-e', 28, 28);
  }
}
