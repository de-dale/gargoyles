import * as Phaser from 'phaser'

export const nextSceneCallback = (scene: Phaser.Scene, nextScene: string, sceneData: any = {}) =>
  () => {
    scene.scene.start(nextScene, { ...sceneData })
    scene.scene.stop()
    scene.sound.stopAll()
  }

export const nextSceneTransitionCallback = (scene: Phaser.Scene, nextScene: string, sceneData: any = {}) =>
  () => {
    scene.scene.transition({
      target: nextScene,
      duration: 2000,
      remove: true,
      data: { ...sceneData }
    })
    scene.scene.setVisible(false)
  }

export const victory = (scene: Phaser.Scene, sound: string, nextScene: string, data: any) => {
  scene.sound.play(sound, { volume: 0.1 })
  scene.scene.pause()
  scene.cameras.main.fadeOut(5000)
  setTimeout(() => nextSceneTransitionCallback(scene, nextScene, data)(), 5000)
}
