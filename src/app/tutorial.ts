import * as Phaser from 'phaser';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

export class TutorialScene extends Phaser.Scene {

  private platforms: Phaser.Physics.Arcade.StaticGroup;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private stars: Phaser.Physics.Arcade.Group;
  private player;
  private score = 0;
  private scoreText;
  private bombs: Phaser.Physics.Arcade.Group;
  private gameOver: boolean;

  constructor() {
    super(sceneConfig);
  }

  public preload() {
    this.load.image('sky', '../assets/sky.png');
    this.load.image('ground', '../assets/platform.png');
    this.load.image('star', '../assets/star.png');
    this.load.image('bomb', '../assets/bomb.png');
    this.load.spritesheet('dude', '../assets/dude.png',
      { frameWidth: 32, frameHeight: 48 }
    );
  }

  public create() {
    this.add.image(400, 300, 'sky');

    this.platforms = this.physics.add.staticGroup();

    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    this.platforms.create(600, 400, 'ground');
    this.platforms.create(50, 250, 'ground');
    this.platforms.create(750, 220, 'ground');

    this.player = this.physics.add.sprite(100, 450, 'dude');

    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'turn',
      frames: [{ key: 'dude', frame: 4 }],
      frameRate: 20
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });

    this.physics.add.collider(this.player, this.platforms);
    this.cursors = this.input.keyboard.createCursorKeys();

    this.stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 }
    });

    this.stars.children.iterate(function (child) {
      // @ts-ignore
      child.body.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    this.physics.add.collider(this.stars, this.platforms);
    const collectStar = (player, star) => {
      const stars = this.stars;
      const bombs = this.bombs;

      star.disableBody(true, true);
      this.score += 10;
      this.scoreText.setText('Score: ' + this.score);

      if (stars.countActive(true) === 0) {
        stars.children.iterate(function (child) {
          // @ts-ignore
          child.enableBody(true, child.x, 0, true, true);
        });

        const x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        const bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
      }
    }
    this.physics.add.overlap(this.player, this.stars, collectStar, null, this);

    // @ts-ignore
    this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#ff0000' });

    this.bombs = this.physics.add.group();

    const hitBomb = (player, bomb) => {
      this.physics.pause();
      player.setTint(0xff0000);
      player.anims.play('turn');
      this.gameOver = true;
    };
    this.physics.add.collider(this.bombs, this.platforms);
    this.physics.add.collider(this.player, this.bombs, hitBomb, null, this);

  }

  public update() {
    const cursors = this.cursors
    const player = this.player
    if (cursors.left.isDown) {
      player.setVelocityX(-160);
      player.anims.play('left', true);
    } else if (cursors.right.isDown) {
      player.setVelocityX(160);
      player.anims.play('right', true);
    } else {
      player.setVelocityX(0);
      player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
      player.setVelocityY(-400);
    }
  }

}