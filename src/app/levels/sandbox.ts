import * as Phaser from 'phaser'

import * as tiles from '@assets/maps/colored.png'
import * as levelSandbox from '@assets/maps/level-sandbox.json'
import * as areaClear from '@assets/sounds/area-clear.ogg'

import { FirebrandOnAction } from '@app/player/firebrand/onAction'
import { END_VICTORY } from '@app/levels/end-victory'
import { victory } from '@app/utils'

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Sandbox'
}

const once = (fn) => nth(fn)

const nth = (fn, n = 1) => {
  const nextNth = () => {
    fn()
    return nth(fn, n--)
  }
  return () => (n === 0)
    ? () => {
    }
    : nextNth()
}

export class SandboxScene extends Phaser.Scene {

  private firebrand: FirebrandOnAction

  constructor () {
    super(sceneConfig)
  }

  public preload () {
    this.load.image('tiles', tiles)
    this.load.tilemapTiledJSON('levelSandbox', levelSandbox)
    this.load.audio('area-clear', areaClear)

    FirebrandOnAction.preloadSprites(this)
  }

  public create () {
    const map = this.make.tilemap({ key: 'levelSandbox' })
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)

    const tileset = map.addTilesetImage('colored', 'tiles')
    const worldLayer = map.createLayer('world', tileset)
    worldLayer.setCollisionByProperty({ solid: true })

    const endPosition = map.findObject('objects', i => i.name === 'end-position')
    const endAsSprite = this.physics.add.staticSprite(endPosition.x, endPosition.y, '')
    endAsSprite.setSize(5, endAsSprite.height)
    endAsSprite.setVisible(false)

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
    this.firebrand = this.createFirebrand(map)

    this.physics.add.collider(this.firebrand.avatar, worldLayer)

    const endLevel = this.endLevel()
    this.physics.add.overlap(endAsSprite, this.firebrand.avatar, (left, right) => {
      endLevel()
    })
  }

  private endLevel () {
    return once(() =>
      victory(this, 'area-clear', END_VICTORY, { message: 'victory' }))
  }

  private createFirebrand (map: Phaser.Tilemaps.Tilemap) {
    const {
      x: startX,
      y: startY
    } = map.findObject('objects', i => i.name === 'start-position')
    return FirebrandOnAction.create(this, startX, startY, {
      speed: 160,
      jumpSpeed: 600 // 200
    })
  }

  public update (time: number, delta: number) {
    this.firebrand.update()
  }

}
