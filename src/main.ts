import * as Phaser from 'phaser';

import { SandboxScene } from "@app/levels/sandbox.ts";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: SandboxScene
};

export const game = new Phaser.Game(config);