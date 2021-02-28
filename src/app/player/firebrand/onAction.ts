import * as Phaser from 'phaser'

import * as firebrand from '@assets/sprites/firebrand.png'
import * as firebrandAtlas from '@assets/sprites/firebrand.atlas.json'

type State = 'walking' | 'jumping' | 'flying' | 'falling' | 'hanging' | 'standing' | 'none'

export class FirebrandOnAction {
  avatar: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  up: Phaser.Input.Keyboard.Key
  down: Phaser.Input.Keyboard.Key
  left: Phaser.Input.Keyboard.Key
  right: Phaser.Input.Keyboard.Key

  state: State;
  private speed: number;
  private jumpSpeed: number;

  private readonly Animations = {
    JUMP: 'jump'
  }

  constructor(avatar: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody, {
    up,
    down,
    left,
    right
  }: { up: any; down: any; left: any; right: any }, { speed = 160, jumpSpeed = 200 }) {
    this.avatar = avatar
    this.up = up
    this.down = down
    this.left = left
    this.right = right
    this.speed = speed;
    this.jumpSpeed = -Math.abs(jumpSpeed);
  }

  static preloadSprites(scene: Phaser.Scene) {
    scene.load.atlas('firebrand', firebrand, firebrandAtlas)
  }

  static create(scene: Phaser.Scene, x, y) {
    const cursors = scene.input.keyboard.createCursorKeys()
    const player = scene.physics.add.sprite(x, y, 'firebrand', 'firebrand.stand')
    player.setCollideWorldBounds(true)
    scene.cameras.main.startFollow(player)

    const result = new FirebrandOnAction(player, cursors, {})
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

  private static onlyOneIsDown = (keys: Phaser.Input.Keyboard.Key[]) => keys.filter(key => key.isDown).length === 1;
  private static allAreDown = (keys: Phaser.Input.Keyboard.Key[]) => keys.every(key => key.isDown);
  private static allAreUp = (keys: Phaser.Input.Keyboard.Key[]) => keys.every(key => key.isUp);

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
    console.log(this.state)

    if (this.leftIsDown() && this.rightIsUp()) {
      this.setSpeedToLeft(160);
      this.animateFacingLeft()
    }
    if (this.leftIsUp() && this.rightIsDown()) {
      this.setSpeedToRight(160)
      this.animateFacingRight()
    }
    if (this.isStopping()) {
      this.stops();
    }

    this.standing();
    this.walking();
    this.jumping();
    this.flying();
    this.hanging();

    // ANIMATE

    switch (this.state) {
      case 'flying':
      case 'falling':
      case 'jumping':
        this.avatar.anims.play(this.Animations.JUMP, true)
        break
      case 'walking':
        this.avatar.anims.play('walk', true)
        break
      case 'hanging':
        this.avatar.anims.play('hanged', true)
        break
      case 'standing':
      case 'none':
      default:
        this.avatar.setTexture('firebrand', 'firebrand.stand')
    }
  }

  private standing() {
    if (this.isOnFloor() && this.isStopping()) {
      this.state = 'standing'
    }
  }

  private walking() {
    if (!this.isWalking() && this.startsWalking()) {
      this.state = 'walking'
    }
    if (this.isWalkingOnAir()) {
      this.state = 'falling'
    }
  }

  private jumping() {
    if (this.startsJumping()) {
      this.state = 'jumping'
      this.avatar.setVelocityY(this.jumpSpeed)
    }
    if (this.stopsJumping()) {
      this.state = 'falling'
    }
  }

  private flying() {
    if (this.startsFlying()) {
      this.state = 'flying'
      this.setVerticalImmobility();
    }
    if (this.stopsFlying()) {
      this.state = 'falling'
    }
  }

  private isWalkingOnAir() {
    return this.isOnAir() && this.isWalking();
  }

  private startsWalking() {
    return this.isOnFloor() && FirebrandOnAction.onlyOneIsDown([this.left, this.right]);
  }

  private hanging() {
    if (this.isFlying()) {
      return;
    }
    if (this.isHangingOnLeft()) {
      this.state = 'hanging'
      this.setVerticalImmobility();
      this.animateFacingRight()
    }
    if (this.isHangingOnRight()) {
      this.state = 'hanging'
      this.setVerticalImmobility();
      this.animateFacingLeft()
    }

    if (this.stopsHangingLeft()) {
      this.state = 'falling'
      this.setSpeedToRight(500);
    }
    if (this.stopsHangingRight()) {
      this.state = 'falling'
      this.setSpeedToLeft(500)
    }
  }

  private setVerticalImmobility() {
    this.avatar.setVelocityY(-5)
  }

  private isStopping() {
    return FirebrandOnAction.allAreDown([this.left, this.right])
      || FirebrandOnAction.allAreUp([this.left, this.right]);
  }

  private stopsJumping() {
    return this.isOnAir() && this.isJumping() && this.upIsUp();
  }

  private startsJumping() {
    return this.isOnFloor() && this.upIsDown();
  }

  private stopsFlying() {
    return this.isOnAir() && this.isFlying() && this.upIsUp();
  }

  private startsFlying() {
    return this.isOnAir()
      && !this.isJumping()
      && !this.isHanging()
      && this.upIsDown();
  }

  private stops() {
    this.avatar.setVelocityX(0)
  }

  private setSpeedToLeft(speed: number) {
    this.avatar.setVelocityX(-Math.abs(speed))
  }

  private setSpeedToRight(speed: number) {
    this.avatar.setVelocityX(Math.abs(speed))
  }

  private isWalking() {
    return this.state === 'walking';
  }

  private isJumping() {
    return this.state === 'jumping';
  }

  private isFlying() {
    return this.state === 'flying';
  }

  private isHanging() {
    return this.state === 'hanging';
  }

  private isHangingOnLeft() {
    return this.avatar.body.blocked.left && this.leftIsDown() && !this.rightIsDown()
  }

  private stopsHangingLeft() {
    return this.isHanging()
      && this.avatar.body.blocked.left
      && (this.leftIsUp() || FirebrandOnAction.allAreDown([this.left, this.right]));
  }

  private isHangingOnRight() {
    return this.avatar.body.blocked.right && this.rightIsDown() && !this.leftIsDown()
  }

  private stopsHangingRight() {
    return this.isHanging()
      && this.avatar.body.blocked.right
      && (this.rightIsUp() || FirebrandOnAction.allAreDown([this.left, this.right]));
  }

}
