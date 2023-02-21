import Player from '/utils/player/Player.js'
import { createBox } from '/utils/geometry.js'
import { camera as defaultCamera } from '/utils/scene.js'
import { normalizeMouse, getCameraIntersects, getScene, getParent, belongsTo } from '/utils/helpers.js'
import FPSRenderer from '/utils/classes/2d/FPSRenderer.js'
import { shootDecals } from '/utils/decals.js'
import Particles from '/utils/classes/Particles.js'
import config from '/config.js'
import keyboard from '/utils/classes/Keyboard.js'
import { jumpStyles } from '/utils/constants.js'

export default class Savo extends Player {
  constructor({
    speed, size = 1.8, mousemove = false, camera = defaultCamera, rifleBurst = false, ...params
  } = {}) {
    super({
      mesh: createBox({ size }), jumpStyle: jumpStyles.FLY, camera: null, ...params
    })
    this.speed = speed || size * 3
    this.mouseSensitivity = .05
    this.mousemove = mousemove
    this.rifleBurst = rifleBurst
    this.time = 0

    const file = rifleBurst ? 'rifle-burst' : 'rifle'
    this.audio = new Audio(`/assets/sounds/${file}.mp3`)
    this.audio.volume = config.volume

    this.fpsRenderer = new FPSRenderer()
    this.camera = camera
    camera.position.set(0, this.height * .8, this.height / 4)
    camera.rotation.set(0, 0, 0)
    this.mesh.add(camera)

    this.ricochet = new Particles({ num: 100, size: .05, unitAngle: 0.2 })

    document.body.addEventListener('click', () => this.shoot())
    if (mousemove) document.addEventListener('mousemove', e => this.onMouseMove(e))
  }

  onMouseMove(e) {
    const { x, y } = normalizeMouse(e)
    this.mesh.rotateY(-x * this.mouseSensitivity)
    this.camera.rotateX(y * this.mouseSensitivity)
    this.camera.rotation.x = Math.max(-0.1, Math.min(Math.PI / 4, this.camera.rotation.x))
  }

  lookAtFront() {
    const target = this.mesh.position.clone()
    target.y = this.mesh.position.y + this.height * .8
    this.camera.lookAt(target)
  }

  shoot() {
    this.audio.currentTime = 0
    this.audio.play()
    const shoots = this.rifleBurst ? 5 : 1

    for (let i = 0; i < shoots; i++) setTimeout(() => {
      const intersects = getCameraIntersects(this.camera, this.solids)
      if (!intersects.length) return

      const { point, object } = intersects.find(x => x.object.name != 'decal')
      const isEnemy = belongsTo(object, 'enemy')

      const decalColor = isEnemy ? 0x8a0303 : 0x000000
      shootDecals(intersects[0], { color: decalColor })

      const ricochetColor = isEnemy ? 0x8a0303 : 0xcccccc
      this.ricochet.reset({ pos: point, unitAngle: 0.2, color: ricochetColor })
      const scene = getScene(object)
      scene.add(this.ricochet.particles)

      if (isEnemy) {
        const mesh = getParent(object, 'enemy')
        mesh.userData.player.setState('pain')
      }

      this.time -= .5
    }, i * 100)
  }

  update(delta) {
    super.update(delta)
    this.time += (keyboard.run ? delta * 2 : delta)
    this.fpsRenderer.render(this.time)
    this.ricochet.expand({ scalar: 1.2, maxRounds: 5, gravity: .02 })
    if (!this.mousemove) this.lookAtFront()
  }
}
