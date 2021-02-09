import * as Phaser from 'phaser'

import { FirebrandOnAction } from '@app/player/firebrand/onAction'

jest.useFakeTimers();

Object.defineProperty(global.Image.prototype, 'src', {
  get() {
    return this['_src'];
  },
  set(val) {
    this['_src'] = val
    setTimeout(() => this.onload());
  },
  enumerable: true,
  configurable: true
});

describe(`Firebrand in Action`, () => {

  let game
  let updateScene = () => {
  }

  beforeAll(() => {
    window.focus = jest.fn();
    game = new Phaser.Game({
      type: Phaser.HEADLESS,
      scene: {
        update(time: number, delta: number) {
          updateScene()
        }
      },
      callbacks: {
        postBoot: () => game.loop.stop()
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 300 },
          debug: false
        }
      }
    });
    game.renderer = {
      preRender: jest.fn(),
      render: jest.fn(),
      postRender: jest.fn()
    }
    jest.runAllTimers();
  });

  afterAll(() => {
    game.destroy(true, true);
    game.runDestroy();
  });

  let sprite
  let up
  let down
  let left
  let right

  const getScene = () => game.scene.getScene('default')

  beforeEach(() => {
    let scene = getScene();
    sprite = scene.physics.add.sprite();
    ({ up, down, left, right } = scene.input.keyboard.createCursorKeys());
  });

  afterEach(() => sprite.destroy());

  it(`should press 'right' update velocity to right`, () => {
    const firebrandOnAction = new FirebrandOnAction(sprite, { up, down, left, right });
    updateScene = () => firebrandOnAction.update()

    right.isDown = true;
    right.isUp = false;

    game.step();

    expect(firebrandOnAction.avatar.body.velocity.x).toBe(160)
  });

});