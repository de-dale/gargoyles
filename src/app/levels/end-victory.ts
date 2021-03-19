import * as Phaser from 'phaser'

import { FONTS } from '@app/fonts'

export const END_VICTORY = 'EndVictory'

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: END_VICTORY
}

export class EndVictory extends Phaser.Scene {

  private message: string

  constructor () {
    super(sceneConfig)
  }

  public init (data) {
    this.message = data.message
  }

  public preload () {
  }

  public create () {
    console.log('VICTORY')
    console.log(this.message)

    this.add.text(200, 150, this.message.toUpperCase(), {
      fontSize: '52px',
      fontFamily: FONTS.BURNY,
      color: 'darkred'
    })
  }

  public update (time: number, delta: number) {
  }

}
