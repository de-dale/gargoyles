import * as Phaser from 'phaser'

import * as firebrand from '@assets/sprites/firebrand.png'
import * as firebrandAtlas from '@assets/sprites/firebrand.atlas.json'

export class FirebrandOnAction {
  avatar: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  up: Phaser.Input.Keyboard.Key
  down: Phaser.Input.Keyboard.Key
  left: Phaser.Input.Keyboard.Key
  right: Phaser.Input.Keyboard.Key
  jumping: boolean = false;

  constructor (player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, {
    up,
    down,
    left,
    right
  }: { up: any; down: any; left: any; right: any }) {
    this.avatar = player
    this.up = up
    this.down = down
    this.left = left
    this.right = right
  }

  static preloadSprites (scene: Phaser.Scene) {
    scene.load.atlas('firebrand', firebrand, firebrandAtlas)
  }

  static create (scene: Phaser.Scene, x, y) {
    const cursors = scene.input.keyboard.createCursorKeys()
    const player = scene.physics.add.sprite(x, y, 'firebrand', 'firebrand.stand')
    player.setCollideWorldBounds(true)
    scene.cameras.main.startFollow(player)

    const result = new FirebrandOnAction(player, cursors)
    result.createAnimations(scene)
    return result
  }

  private createAnimations (scene: Phaser.Scene) {
    this.avatar.anims.create({
      key: 'walk',
      frames: scene.anims.generateFrameNames('firebrand', { prefix: 'firebrand.walk', start: 1, end: 3 }),
      frameRate: 10,
      repeat: -1
    })

    this.avatar.anims.create({
      key: 'jump',
      frames: scene.anims.generateFrameNames('firebrand', { prefix: 'firebrand.jump', start: 1, end: 3 }),
      frameRate: 10,
      repeat: -1
    })
  }

  private isOnFloor (): boolean {
    return this.avatar.body.onFloor()
  }

  private leftIsDown (): boolean {
    return this.left.isDown
  }

  private leftIsUp (): boolean {
    return this.left.isUp
  }

  private rightIsDown (): boolean {
    return this.right.isDown
  }

  private rightIsUp (): boolean {
    return this.right.isUp
  }

  private upIsDown (): boolean {
    return this.up.isDown
  }

  private upIsUp (): boolean {
    return this.up.isUp
  }

  private movesRight () {
    return this.leftIsUp() && this.rightIsDown()
  }

  private movesLeft () {
    return this.leftIsDown() && this.rightIsUp()
  }

  private bothDirectionsAreDown () {
    return this.leftIsDown() && this.rightIsDown()
  }

  private bothDirectionsAreUp () {
    return this.leftIsUp() && this.rightIsUp()
  }

  private cannotDetermineMove () {
    return this.bothDirectionsAreDown() || this.bothDirectionsAreUp()
  }

  private animateOrientation () {
    if (this.movesLeft()) {
      this.avatar.setFlip(true, false)
    }
    if (this.movesRight()) {
      this.avatar.setFlip(false, false)
    }
  };

  private moveOnHorizontally = () => {
    if (this.movesLeft()) {
      this.avatar.setVelocityX(-160)
    }
    if (this.movesRight()) {
      this.avatar.setVelocityX(160)
    }
    if (this.cannotDetermineMove()) {
      this.avatar.setVelocityX(0)
    }
  };

  private animateWalking () {
    if (!this.isOnFloor()) {
      return
    }
    if (this.movesLeft() || this.movesRight()) {
      this.avatar.anims.play('walk', true)
    } else {
      this.avatar.setTexture('firebrand', 'firebrand.stand')
    }
  }

  private startsJumping () {
    return this.isOnFloor() && this.upIsDown()
  }

  private isJumping () {
    return this.jumping
  }

  private jumps () {
    if (this.startsJumping()) {
      this.jumping = true
      this.avatar.setVelocityY(-400)
    }
    if (this.isJumping() && this.upIsUp()) {
      this.jumping = false
      this.avatar.setVelocityY(0)
    }
  }

  private animateJumping () {
    if (!this.isOnFloor()) {
      this.avatar.anims.play('jump', true)
    }
  }

  private flying () {
    if (!this.isOnFloor() && !this.isJumping() && this.upIsDown()) {
      this.avatar.setVelocityY(-5)
    }
  };

  update () {
    this.moveOnHorizontally()
    this.animateOrientation()
    this.animateWalking()

    this.jumps()
    this.animateJumping()
    this.flying()
  }
}
