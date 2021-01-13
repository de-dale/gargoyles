import * as Phaser from 'phaser';

import { TutorialScene } from "./app/tutorial";

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
  scene: TutorialScene
};

export const game = new Phaser.Game(config);