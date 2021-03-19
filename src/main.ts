import * as Phaser from 'phaser'

import { SandboxScene } from '@app/levels/sandbox.ts'
import { EndVictory } from '@app/levels/end-victory'
import { Introduction } from '@app/levels/introduction';
import { loadFonts } from '@app/fonts'

loadFonts()

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  // width: 480,
  width: 960,
  // height: 320,
  height: 640,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: [Introduction, SandboxScene, EndVictory]
}

export const game = new Phaser.Game(config)
