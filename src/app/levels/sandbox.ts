import * as Phaser from 'phaser'

import * as tiles from '@assets/maps/colored.png'
import * as levelSandbox from '@assets/maps/level-sandbox.json'

import { FirebrandOnAction } from '@app/player/firebrand/onAction'

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Gargoyles'
}

export class SandboxScene extends Phaser.Scene {
  private firebrand: FirebrandOnAction;

  constructor () {
    super(sceneConfig)
  }

  public preload () {
    this.load.image('tiles', tiles)
    this.load.tilemapTiledJSON('levelSandbox', levelSandbox)

    FirebrandOnAction.preloadSprites(this)
  }

  public create () {
    const map = this.make.tilemap({ key: 'levelSandbox' })
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels)

    const tileset = map.addTilesetImage('colored', 'tiles')
    const worldLayer = map.createLayer('world', tileset)
    worldLayer.setCollisionByProperty({ solid: true })

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels)
    this.firebrand = this.createFirebrand(map)

    this.physics.add.collider(this.firebrand.avatar, worldLayer)
  }

  private createFirebrand (map: Phaser.Tilemaps.Tilemap) {
    const { x: startX, y: startY } = map.findObject('objects', i => i.name === 'start-position')
    return FirebrandOnAction.create(this, startX, startY)
  }

  public update (time: number, delta: number) {
    this.firebrand.update()
  }
}
