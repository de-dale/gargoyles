import * as Phaser from 'phaser';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Gargoyles',
};

interface Jumper {
  jumping: boolean
}

class Firebrand implements Jumper {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  up: Phaser.Input.Keyboard.Key
  down: Phaser.Input.Keyboard.Key
  left: Phaser.Input.Keyboard.Key
  right: Phaser.Input.Keyboard.Key
  jumping: boolean = false;

  constructor(cursors: Phaser.Types.Input.Keyboard.CursorKeys, player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
    this.cursors = cursors;
    this.player = player;
    ({ up: this.up, down: this.down, left: this.left, right: this.right } = cursors);
  }

  private isOnFloor(): boolean {
    return this.player.body.touching.down;
  }

  private leftIsDown(): boolean {
    return this.left.isDown;
  }

  private leftIsUp(): boolean {
    return this.left.isUp;
  }

  private rightIsDown(): boolean {
    return this.right.isDown;
  }

  private rightIsUp(): boolean {
    return this.right.isUp;
  }

  private upIsDown() {
    return this.cursors.up.isDown;
  }

  private upIsUp() {
    return this.cursors.up.isUp;
  }

  private isJumping() {
    return this.isOnFloor() && this.upIsDown();
  }

  private isTouchingDown() {
    return this.player.body.touching.down;
  }

  jumps() {
    if (this.isJumping()) {
      this.jumping = true;
      this.player.setVelocityY(-400);
    }
    if (this.jumping && this.upIsUp()) {
      console.log("Stop JUMPING")
      this.jumping = false;
      this.player.setVelocityY(0);
    }
  }

  animateJumping() {
    if (!this.isTouchingDown()) {
      this.player.anims.play('jump', true);
    }
  }

  moveOnHorizontally = () => {
    if (this.leftIsDown() && this.rightIsUp()) {
      this.player.setVelocityX(-160);
    }
    if (this.leftIsUp() && this.rightIsDown()) {
      this.player.setVelocityX(160);
    }
    if ((this.leftIsDown() && this.rightIsDown())
      || (this.leftIsUp() && this.rightIsUp())) {
      this.player.setVelocityX(0);
    }
  };

  animateFacing() {
    if (this.leftIsDown() && this.rightIsUp()) {
      this.player.setFlip(true, false);
    }
    if (this.leftIsUp() && this.rightIsDown()) {
      this.player.setFlip(false, false);
    }
  };

  animateWalking() {
    if (!this.isTouchingDown()) {
      return;
    }
    if ((this.leftIsDown() && this.rightIsUp()) || (this.leftIsUp() && this.rightIsDown())) {
      this.player.anims.play('walk', true);
    } else {
      this.player.setTexture("firebrand", "firebrand.stand")
    }
  }

  flying = () => {
    if (!this.isTouchingDown() && !this.jumping) {
      if (this.upIsDown()) {
        this.player.setVelocityY(-5);
      }
    }
  };

  updatePlayer() {
    this.moveOnHorizontally();
    this.animateFacing();
    this.animateWalking();

    this.jumps();
    this.animateJumping();
    this.flying()
  }

}

export class GargoylesScene extends Phaser.Scene {

  private platforms: Phaser.Physics.Arcade.StaticGroup;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private stars: Phaser.Physics.Arcade.Group;
  private player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private score = 0;
  private scoreText;
  private bombs: Phaser.Physics.Arcade.Group;

  private gameOver: boolean;
  private firebrand: Firebrand;

  constructor() {
    super(sceneConfig);
  }

  public preload() {
    // this.load.spritesheet('firebrand', '../assets/sprites/firebrand.walk.png',
    //   { frameWidth: 24, frameHeight: 24 });
    this.load.image('sky', '../assets/sky.png');
    this.load.image('ground', '../assets/platform.png');
    this.load.atlas('firebrand', '../assets/sprites/firebrand.png', '../assets/sprites/firebrand.json')
  }

  public create() {
    this.cursors = this.input.keyboard.createCursorKeys();

    this.add.image(400, 300, 'sky');

    const platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    this.platforms = platforms;

    const player = this.physics.add.sprite(100, 450, 'firebrand', 'firebrand.stand');
    player.setCollideWorldBounds(true);
    this.player = player;

    this.physics.add.collider(player, platforms);

    // this.anims.create({
    //   key: 'left',
    //   frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
    //   frameRate: 10,
    //   repeat: -1
    // });
    //
    // this.anims.create({
    //   key: 'turn',
    //   frames: [{ key: 'dude', frame: 4 }],
    //   frameRate: 20
    // });
    //
    player.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNames('firebrand', { prefix: 'firebrand.walk', start: 1, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    player.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNames('firebrand', { prefix: 'firebrand.jump', start: 1, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    // this.anims.create({
    //   key: 'stand',
    //   frames: this.anims.generateFrameNumbers('firebrand', {  start: 11, end: 12 }),
    //   frameRate: 10,
    //   repeat: -1
    // });
    //
    //
    // this.cursors = this.input.keyboard.createCursorKeys();
    //
    // this.stars = this.physics.add.group({
    //   key: 'star',
    //   repeat: 11,
    //   setXY: { x: 12, y: 0, stepX: 70 }
    // });
    //
    // this.stars.children.iterate(function (child) {
    //   // @ts-ignore
    //   child.body.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    // });
    //
    // this.physics.add.collider(this.stars, this.platforms);
    // const collectStar = (player, star) => {
    //   const stars = this.stars;
    //   const bombs = this.bombs;
    //
    //   star.disableBody(true, true);
    //   this.score += 10;
    //   this.scoreText.setText('Score: ' + this.score);
    //
    //   if (stars.countActive(true) === 0) {
    //     stars.children.iterate(function (child) {
    //       // @ts-ignore
    //       child.enableBody(true, child.x, 0, true, true);
    //     });
    //
    //     const x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    //
    //     const bomb = bombs.create(x, 16, 'bomb');
    //     bomb.setBounce(1);
    //     bomb.setCollideWorldBounds(true);
    //     bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    //   }
    // }
    // this.physics.add.overlap(this.player, this.stars, collectStar, null, this);
    //
    // // @ts-ignore
    // this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#ff0000' });
    //
    // this.bombs = this.physics.add.group();
    //
    // const hitBomb = (player, bomb) => {
    //   this.physics.pause();
    //   player.setTint(0xff0000);
    //   player.anims.play('turn');
    //   this.gameOver = true;
    // };
    // this.physics.add.collider(this.bombs, this.platforms);
    // this.physics.add.collider(this.player, this.bombs, hitBomb, null, this);

    this.firebrand = new Firebrand(this.cursors, player)
  }

  public update() {
    const cursors = this.cursors
    const player = this.player

    this.firebrand.updatePlayer()
  }

}