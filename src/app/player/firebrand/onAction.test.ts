import * as Phaser from 'phaser'

import { FirebrandOnAction } from '@app/player/firebrand/onAction'

jest.useFakeTimers()

Object.defineProperty(global.Image.prototype, 'src', {
  get() {
    return this['_src']
  },
  set(val) {
    this['_src'] = val
    setTimeout(() => this.onload())
  },
  enumerable: true,
  configurable: true
})

const speedToRight = 160;
const speedToLeft = -speedToRight;
const speedJump = -400;
const speedFlying = -5;

const fallingSpeed = 0;
const speedOfRepulsion = 500;
describe(`Firebrand in Action`, () => {

  let game
  let updateScene = () => {
  }

  beforeAll(() => {
    window.focus = jest.fn()
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
    })
    game.renderer = {
      preRender: jest.fn(),
      render: jest.fn(),
      postRender: jest.fn()
    }
    jest.runAllTimers();
    ({ up, down, left, right } = getScene().input.keyboard.createCursorKeys())
  })

  afterAll(() => {
    game.destroy(true, true)
    game.runDestroy()
  })

  let firebrand: FirebrandOnAction

  let up
  let down
  let left
  let right

  const getScene = () => game.scene.getScene('default')

  beforeEach(() => {
    const scene = getScene()
    const avatar = scene.physics.add.sprite();
    firebrand = new FirebrandOnAction(avatar, { up, down, left, right })
  })

  afterEach(() => {
    firebrand.avatar.destroy()
    Array.of(up, down, left, right).forEach(key => key.reset())
  })

  const givenKeyIsDown = key => {
    key.isDown = true
    key.isUp = false
  }

  const givenKeyIsUp = key => {
    key.isDown = false
    key.isUp = true
  }

  const givenAvatarIsOnFloor = () => firebrand.avatar.body.blocked.down = true
  const givenAvatarIsOnAir = () => firebrand.avatar.body.blocked.down = false

  const givenFirebrandStateIs = state => firebrand.state = state

  const givenAvatarIsBlockedOnLeft = () => firebrand.avatar.body.blocked.left = true
  const givenAvatarIsBlockedOnRight = () => firebrand.avatar.body.blocked.right = true

  // @ts-ignore
  const spyAnimateFacingLeft = () => jest.spyOn(firebrand, "animateFacingLeft");

  // @ts-ignore
  const spyAnimateFacingRight = () => jest.spyOn(firebrand, "animateFacingRight");

  describe(`walks`, () => {

    it(`when avatar is on floor and key 'right' is down`, () => {
      givenAvatarIsOnFloor()
      givenKeyIsDown(right)

      const setVelocityX = jest.spyOn(firebrand.avatar, "setVelocityX");
      const animateFacingRight = spyAnimateFacingRight();

      firebrand.update()

      expect(setVelocityX).toHaveBeenCalledWith(speedToRight)
      expect(animateFacingRight).toHaveBeenCalled()
    });

    it(`when avatar is on floor and key 'left' is down`, () => {
      givenAvatarIsOnFloor()
      givenKeyIsDown(left)

      const setVelocityX = jest.spyOn(firebrand.avatar, "setVelocityX");
      const animateFacingLeft = spyAnimateFacingLeft();

      firebrand.update()

      expect(setVelocityX).toHaveBeenCalledWith(speedToLeft)
      expect(animateFacingLeft).toHaveBeenCalled()
    });

    it(`no longer when keys 'left' and 'right' are released`, () => {
      givenFirebrandStateIs('walking')
      givenAvatarIsOnFloor()
      givenKeyIsUp(left)
      givenKeyIsUp(right)

      const setVelocityX = jest.spyOn(firebrand.avatar, "setVelocityX");

      firebrand.update()

      expect(setVelocityX).toHaveBeenCalledWith(0)
    });

    it(`no longer when both keys 'left' and 'right' are down`, () => {
      givenFirebrandStateIs('walking')
      givenAvatarIsOnFloor()
      givenKeyIsDown(left)
      givenKeyIsDown(right)

      const setVelocityX = jest.spyOn(firebrand.avatar, "setVelocityX");

      firebrand.update()

      expect(setVelocityX).toHaveBeenCalledWith(0)
    });

  })

  describe(`falls`, () => {

    it(`when avatar is walking in air and key 'left' is down`, () => {
      givenFirebrandStateIs('walking')
      givenAvatarIsOnAir()
      givenKeyIsDown(left)

      const setVelocityX = jest.spyOn(firebrand.avatar, "setVelocityX");
      const setVelocityY = jest.spyOn(firebrand.avatar, "setVelocityY");

      firebrand.update()

      expect(setVelocityX).toHaveBeenCalledWith(speedToLeft)
      expect(setVelocityY).toHaveBeenCalledWith(fallingSpeed)
    });

    it(`when flying and key 'up' is released`, () => {
      givenFirebrandStateIs('flying')
      givenAvatarIsOnAir()
      givenKeyIsUp(up)

      const setVelocityY = jest.spyOn(firebrand.avatar, "setVelocityY");

      firebrand.update()

      expect(setVelocityY).toHaveBeenCalledWith(fallingSpeed)
    });

  })

  describe(`jumps`, () => {

    it(`when avatar is on floor and key 'up' is down`, () => {
      givenAvatarIsOnFloor()
      givenKeyIsDown(up)

      const setVelocityY = jest.spyOn(firebrand.avatar, "setVelocityY");

      firebrand.update()

      expect(setVelocityY).toHaveBeenCalledWith(speedJump)
    });

    it(`is not possible when is jumping`, () => {
      givenFirebrandStateIs('jumping')
      givenAvatarIsOnAir()
      givenKeyIsDown(up)

      const setVelocityY = jest.spyOn(firebrand.avatar, "setVelocityY");

      firebrand.update()

      expect(setVelocityY).not.toHaveBeenCalled()
    });

    it(`no longer when key 'up' is released`, () => {
      givenFirebrandStateIs('jumping')
      givenAvatarIsOnAir()
      givenKeyIsUp(up)

      const setVelocityY = jest.spyOn(firebrand.avatar, "setVelocityY");

      firebrand.update()

      expect(setVelocityY).not.toHaveBeenCalled()
      expect(firebrand.state).toBe('falling')
    });

  })

  describe(`flies`, () => {

    it(`when is on air and key 'up' is down`, () => {
      givenAvatarIsOnAir()
      givenKeyIsDown(up)

      const setVelocityY = jest.spyOn(firebrand.avatar, "setVelocityY");

      firebrand.update()

      expect(setVelocityY).toHaveBeenCalledWith(speedFlying)
      expect(setVelocityY).toHaveBeenCalledTimes(1)
    });

    it(`no longer when key 'up' is released`, () => {
      givenFirebrandStateIs('flying')
      givenAvatarIsOnAir()
      givenKeyIsUp(up)

      const setVelocityY = jest.spyOn(firebrand.avatar, "setVelocityY");

      firebrand.update()

      expect(setVelocityY).toHaveBeenCalledWith(0)
    });

    it(`is not possible when is jumping`, () => {
      givenFirebrandStateIs('jumping')
      givenAvatarIsOnAir()
      givenKeyIsDown(up)

      const setVelocityY = jest.spyOn(firebrand.avatar, "setVelocityY");

      firebrand.update()

      expect(setVelocityY).not.toHaveBeenCalled()
    });

    it(`no longer when reaches the ground`, () => {
      givenFirebrandStateIs('flying')
      givenAvatarIsOnFloor()

      const setVelocityY = jest.spyOn(firebrand.avatar, "setVelocityY");

      firebrand.update()

      expect(setVelocityY).not.toHaveBeenCalled()
    });

  })

  describe(`hangs`, () => {
    it(`left when is on air going left into a wall`, () => {
      givenAvatarIsOnAir()
      givenAvatarIsBlockedOnLeft()
      givenKeyIsDown(left)

      const setVelocityY = jest.spyOn(firebrand.avatar, "setVelocityY");

      firebrand.update()

      expect(setVelocityY).toHaveBeenCalledWith(-5)
    });

    it(`right when is on air going right into a wall`, () => {
      givenAvatarIsOnAir()
      givenAvatarIsBlockedOnRight()
      givenKeyIsDown(right)

      const setVelocityY = jest.spyOn(firebrand.avatar, "setVelocityY");

      firebrand.update()

      expect(setVelocityY).toHaveBeenCalledWith(-5)
    });

    it(`no longer to left when key 'left' is released`, () => {
      givenFirebrandStateIs('hanging')
      givenAvatarIsOnAir()
      givenAvatarIsBlockedOnLeft()
      givenKeyIsUp(left)

      const setVelocityY = jest.spyOn(firebrand.avatar, "setVelocityY");

      firebrand.update()

      expect(setVelocityY).not.toHaveBeenCalled()
    });

    it(`no longer to right when key 'right' is released`, () => {
      givenFirebrandStateIs('hanging')
      givenAvatarIsOnAir()
      givenAvatarIsBlockedOnRight()
      givenKeyIsUp(right)

      const setVelocityY = jest.spyOn(firebrand.avatar, "setVelocityY");

      firebrand.update()

      expect(setVelocityY).not.toHaveBeenCalled()
    });

    it(`is repulsed form wall when hangs no longer`, () => {
      givenFirebrandStateIs('hanging')
      givenAvatarIsOnAir()
      givenAvatarIsBlockedOnLeft()
      givenKeyIsUp(left)

      const setVelocityX = jest.spyOn(firebrand.avatar, "setVelocityX");

      firebrand.update()

      expect(setVelocityX).toHaveBeenCalledWith(speedOfRepulsion)
    });

  });

  [
    {
      setupAction() {
        givenAvatarIsOnFloor()
      },
      action: 'walk'
    },
    {
      setupAction() {
        givenAvatarIsOnFloor()
        givenKeyIsDown(up)
      },
      action: 'jumps'
    },
    {
      setupAction() {
        givenKeyIsDown(up)
      },
      action: 'flying'
    }
  ].forEach(({ setupAction, action }) =>
    describe(`should ${action} in a direction when proper key is down`, () => {

      beforeEach(() => setupAction())

      it(`should go left when avatar key 'left' is down`, () => {
        givenKeyIsDown(left)

        const setVelocityX = jest.spyOn(firebrand.avatar, "setVelocityX");

        firebrand.update()

        expect(setVelocityX).toHaveBeenCalledWith(speedToLeft)
      })

      it(`should go right when avatar key 'right' is down`, () => {
        givenKeyIsDown(right)

        const setVelocityX = jest.spyOn(firebrand.avatar, "setVelocityX");

        firebrand.update()

        expect(setVelocityX).toHaveBeenCalledWith(speedToRight)
      })

      it(`should do nothing when all keys are up`, () => {
        const setVelocityX = jest.spyOn(firebrand.avatar, "setVelocityX");

        firebrand.update()

        expect(setVelocityX).toHaveBeenCalledWith(0)

      })

      it(`should do nothing when both left and right are down`, () => {
        givenKeyIsDown(left)
        givenKeyIsDown(right)

        const setVelocityX = jest.spyOn(firebrand.avatar, "setVelocityX");

        firebrand.update()

        expect(setVelocityX).toHaveBeenCalledWith(0)
      })
    })
  );


});