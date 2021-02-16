import * as Phaser from 'phaser'

import * as firebrand from '@assets/sprites/firebrand.png'
import * as firebrandAtlas from '@assets/sprites/firebrand.atlas.json'

type State = 'walking' | 'jumping' | 'flying' | 'falling' | 'hanging' | 'standing' | 'none'
type Action =
  'jumps'
  | 'jumps:stop'
  | 'flying'
  | 'flying:stop'
  | 'hangs'
  | 'hangs:stop'
  | 'walk'
  | 'stand'
  | 'falls'
  | 'left'
  | 'right'

export class FirebrandOnAction {
  avatar: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  up: Phaser.Input.Keyboard.Key
  down: Phaser.Input.Keyboard.Key
  left: Phaser.Input.Keyboard.Key
  right: Phaser.Input.Keyboard.Key
  private jumping: boolean = false
  private flying: boolean
  private hanging: boolean;
  private facing: string;
  state: State;

  constructor(avatar: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, {
    up,
    down,
    left,
    right
  }: { up: any; down: any; left: any; right: any }) {
    this.avatar = avatar
    this.up = up
    this.down = down
    this.left = left
    this.right = right
  }

  static preloadSprites(scene: Phaser.Scene) {
    scene.load.atlas('firebrand', firebrand, firebrandAtlas)
  }

  static create(scene: Phaser.Scene, x, y) {
    const cursors = scene.input.keyboard.createCursorKeys()
    const player = scene.physics.add.sprite(x, y, 'firebrand', 'firebrand.stand')
    player.setCollideWorldBounds(true)
    scene.cameras.main.startFollow(player)

    const result = new FirebrandOnAction(player, cursors)
    result.createAnimations(scene)
    return result
  }

  private createAnimations(scene: Phaser.Scene) {
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

    this.avatar.anims.create({
      key: 'hanged',
      frames: [{ key: 'firebrand', frame: 'firebrand.hanged' }],
      frameRate: 10,
      repeat: -1
    })
  }

  private isOnFloor(): boolean {
    return this.avatar.body.onFloor()
  }

  private isOnAir(): boolean {
    return !this.isOnFloor()
  }

  private leftIsDown(): boolean {
    return this.left.isDown
  }

  private leftIsUp(): boolean {
    return this.left.isUp
  }

  private rightIsDown(): boolean {
    return this.right.isDown
  }

  private rightIsUp(): boolean {
    return this.right.isUp
  }

  private upIsDown(): boolean {
    return this.up.isDown
  }

  private upIsUp(): boolean {
    return this.up.isUp
  }

  private animateFacingRight() {
    this.avatar.setFlip(false, false)
  }

  private animateFacingLeft() {
    this.avatar.setFlip(true, false)
  }

  update() {
    const actions = this.nextActions();
    this.move(actions);

    // ANIMATE FACING

    if (actions.includes('left')) {
      if (this.state === 'hanging') {
        this.animateFacingRight()
      } else {
        this.animateFacingLeft()
      }
    }
    if (actions.includes('right')) {
      if (this.state === 'hanging') {
        this.animateFacingLeft()
      } else {
        this.animateFacingRight()
      }
    }

    // ANIMATE
    switch (this.state) {
      case "falling":
      case "flying":
      case "jumping":
        this.avatar.anims.play('jump', true)
        break
      case "walking":
        this.avatar.anims.play('walk', true)
        break
      case "hanging":
        this.avatar.anims.play('hanged', true)
        break
      case "standing":
      case "none":
      default:
        this.avatar.setTexture('firebrand', 'firebrand.stand')
    }
  }

  private move(actions: Action[]) {
    if (actions.includes('left')) {
      if (actions.includes('hangs:stop')) {
        this.avatar.setVelocityX(-500)
      } else {
        this.avatar.setVelocityX(-160)
      }
    } else if (actions.includes('right')) {
      if (actions.includes('hangs:stop')) {
        this.avatar.setVelocityX(500)
      } else {
        this.avatar.setVelocityX(160)
      }
    } else {
      this.avatar.setVelocityX(0)
    }

    if (actions.includes('walk')) {
      this.state = 'walking'
    }
    if (actions.includes('stand')) {
      this.state = 'standing'
    }
    if (actions.includes('jumps')) {
      this.state = 'jumping'
      this.avatar.setVelocityY(-400)
    }
    if (actions.includes('flying')) {
      this.state = 'flying'
      this.avatar.setVelocityY(-5)
    }
    if (actions.includes('hangs')) {
      this.state = 'hanging'
      this.avatar.setVelocityY(-5)
      console.log("HANGS")
    }
    if (actions.includes('falls')) {
      this.state = 'falling'
      this.avatar.setVelocityY(0)
    }
    if (actions.includes('flying:stop')) {
      this.state = 'falling'
      this.avatar.setVelocityY(0)
    }
    if (actions.includes('jumps:stop')) {
      this.state = 'falling'
    }
    if (actions.includes('hangs:stop')) {
      this.state = 'falling'
    }
  }

  private nextActions(): Action[] {
    const result: Action[] = []

    if (this.isOnAir()) {
      if (this.state === 'flying') {
        if (this.upIsUp()) {
          result.push('flying:stop')
        }
      }

      if (this.state === 'jumping') {
        if (this.upIsUp()) {
          result.push('jumps:stop')
        }
      } else {
        if (this.upIsDown()) {
          result.push('flying')
        }
      }

      if (this.state === 'walking') {
        result.push('falls')
      }
    }

    if (this.isOnFloor()) {
      if (this.upIsDown()) {
        result.push('jumps')
      }

      if (this.state !== 'walking') {
        if (this.leftIsDown() && this.rightIsUp()) {
          result.push('walk')
        }
        if (this.leftIsUp() && this.rightIsDown()) {
          result.push('walk')
        }
      }

      if (this.leftIsDown() && this.rightIsDown()) {
        result.push('stand')
      }
      if (this.leftIsUp() && this.rightIsUp()) {
        result.push('stand')
      }
    }

    if (this.leftIsDown() && this.rightIsUp()) {
      result.push('left')
    }
    if (this.leftIsUp() && this.rightIsDown()) {
      result.push('right')
    }
    if (this.isHangingLeft() || this.isHangingRight()) {
      result.push('hangs')
    }

    if (this.state === 'hanging') {
      if (this.avatar.body.blocked.left && this.leftIsUp()) {
        result.push('hangs:stop')
        result.push('right')
      }
      if (this.avatar.body.blocked.right && this.rightIsUp()) {
        result.push('hangs:stop')
        result.push('left')
      }
    }

    // if (this.avatar.body.blocked.right && this.rightIsDown()) {
    //   this.hanging = true
    //   this.avatar.setVelocityY(-5)
    //   this.facingLeft()
    // } else if (this.avatar.body.blocked.left && this.leftIsDown()) {
    //   this.hanging = true
    //   this.avatar.setVelocityY(-5)
    //   this.facingRight()
    // } else {
    //   this.hanging = false
    // }


    return result
  }

  private isHangingRight() {
    return this.avatar.body.blocked.right && this.rightIsDown();
  }

  private isHangingLeft() {
    return this.avatar.body.blocked.left && this.leftIsDown();
  }
}
