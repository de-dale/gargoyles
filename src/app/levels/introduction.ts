import * as Phaser from 'phaser'

import * as sky from '@assets/sky.png'
import * as introduction from '@assets/sounds/introduction.ogg'

import { nextSceneCallback } from '@app/utils'
import { FONTS } from '@app/fonts'

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Intro'
}

export class Introduction extends Phaser.Scene {

  constructor () {
    super(sceneConfig)
  }

  public preload () {
    this.load.image('sky', sky)
    this.load.audio('introduction', introduction)
  }

  public create () {
    this.add.text(100, 220, 'Gargoyles \n The Sentinels', {
      fontSize: '52px',
      fontFamily: FONTS.BURNY,
      color: 'darkred'
    })

    this.sound.play('introduction', { volume: 0.1 })

    const goToSandbox = nextSceneCallback(this, 'Sandbox')
    this.input.keyboard.once('keydown', () => goToSandbox())
  }

  public update (time: number, delta: number) {
  }

}
