import * as Phaser from 'phaser'

import * as firebrand from '@assets/sprites/firebrand.png'
import * as firebrandAtlas from '@assets/sprites/firebrand.atlas.json'

type State = 'walking' | 'jumping' | 'flying' | 'falling' | 'hanging:left' | 'hanging:right' | 'standing' | 'none'

export class FirebrandOnAction {
  avatar: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  up: Phaser.Input.Keyboard.Key
  down: Phaser.Input.Keyboard.Key
  left: Phaser.Input.Keyboard.Key
  right: Phaser.Input.Keyboard.Key

  state: State;

  private readonly speed: number;
  private readonly jumpSpeed: number;

  private readonly wallHangingRepulsion = 500;

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
    this.speed = Math.abs(speed);
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
    this.movingHorizontally();

    this.standing();
    this.walking();
    this.jumping();
    this.flying();
    this.hanging();

    this.movingVertically();

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
      case 'hanging:left':
      case 'hanging:right':
        this.avatar.anims.play('hanged', true)
        break
      case 'standing':
      case 'none':
      default:
        this.avatar.setTexture('firebrand', 'firebrand.stand')
    }
  }

  private movingHorizontally() {
    if (this.isHanging()) {
      return;
    }
    if (this.leftIsDown() && this.rightIsUp()) {
      this.setSpeedToLeft(this.speed);
      this.animateFacingLeft()
    }
    if (this.leftIsUp() && this.rightIsDown()) {
      this.setSpeedToRight(this.speed)
      this.animateFacingRight()
    }
    if (this.isStopping()) {
      this.stops();
    }
  }

  private movingVertically() {
    if (this.isFlying() || this.isHanging()) {
      this.setVerticalImmobility();
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

  private isWalkingOnAir() {
    return this.isOnAir() && this.isWalking();
  }

  private startsWalking() {
    return this.isOnFloor() && FirebrandOnAction.onlyOneIsDown([this.left, this.right]);
  }

  private jumping() {
    if (this.startsJumpingFromFloor()) {
      this.state = 'jumping'
      this.setJumpVelocity();
    }
    if (this.startsJumpingFromWall()) {
      this.stopsHanging();
      this.state = 'jumping'
      this.setJumpVelocity();
    }
    if (this.stopsJumping()) {
      this.state = 'falling'
    }
  }

  private flying() {
    if (this.startsFlying()) {
      this.state = 'flying'
    }
    if (this.stopsFlying()) {
      this.state = 'falling'
    }
  }

  private hanging() {
    if (this.isFlying()) {
      return;
    }
    if (this.isJumping()) {
      return;
    }
    if (this.startsHangingOnLeft()) {
      this.state = 'hanging:left'
      this.animateFacingRight()
    }
    if (this.startsHangingOnRight()) {
      this.state = 'hanging:right'
      this.animateFacingLeft()
    }
    this.stopsHanging();
  }

  private stopsHanging() {
    if (this.stopsHangingLeft()) {
      this.state = 'falling'
      this.setSpeedToRight(this.wallHangingRepulsion);
    }
    if (this.stopsHangingRight()) {
      this.state = 'falling'
      this.setSpeedToLeft(this.wallHangingRepulsion)
    }
  }

  private setVerticalImmobility() {
    this.avatar.setVelocityY(-5)
  }

  private setJumpVelocity() {
    this.avatar.setVelocityY(this.jumpSpeed)
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

  private isStopping() {
    return FirebrandOnAction.allAreDown([this.left, this.right])
      || FirebrandOnAction.allAreUp([this.left, this.right]);
  }

  private stopsJumping() {
    return this.isOnAir() && this.isJumping() && this.upIsUp();
  }

  private startsJumpingFromFloor() {
    return this.isOnFloor() && this.upIsDown();
  }

  private startsJumpingFromWall() {
    return this.isHanging() && this.upIsDown();
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
    return this.isHangingOnLeft() || this.isHangingOnRight()
  }

  private isHangingOnLeft() {
    return this.state === 'hanging:left';
  }

  private isHangingOnRight() {
    return this.state === 'hanging:right';
  }

  private startsHangingOnLeft() {
    return this.isOnAir()
      && this.avatar.body.blocked.left
      && this.leftIsDown()
  }

  private stopsHangingLeft() {
    return this.isHangingOnLeft() && this.upIsDown();
  }

  private startsHangingOnRight() {
    return this.isOnAir()
      && this.avatar.body.blocked.right
      && this.rightIsDown()
  }

  private stopsHangingRight() {
    return this.isHangingOnRight() && this.upIsDown();
  }

}
