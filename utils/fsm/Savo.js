import Player from '/utils/fsm/Player.js'
import { createInvisibleBox } from '/utils/geometry.js'
import { camera as defaultCamera } from '/utils/scene.js'
import { normalizeMouse, getCameraIntersects, getScene } from '/utils/helpers.js'
import FPSRenderer from '/utils/classes/2d/FPSRenderer.js'
import { shootDecals } from '/utils/decals.js'
import Particles, { Rain } from '/utils/classes/Particles.js'

const gunshoot = new Audio('/assets/sounds/rafal.mp3')
// gunshoot.volume = 0

export default class Savo extends Player {
  constructor({ speed, size = 2, mousemove = false, camera = defaultCamera, ...params } = {}) {
    super({ mesh: createInvisibleBox({ size }), jumpStyle: 'FLY', camera: null, ...params })
    this.speed = speed || this.size * 3
    this.maxVelocityY = .2
    this.minVelocityY = -this.maxVelocityY
    this.mouseSensitivity = .05
    this.mousemove = mousemove

    this.fpsRenderer = new FPSRenderer()
    this.camera = camera
    camera.position.set(0, size, size / 2)
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
    target.y = this.mesh.position.y + this.size
    this.camera.lookAt(target)
  }

  shoot() {
    gunshoot.play()

    for (let i = 0; i < 5; i++) setTimeout(() => {
      const intersects = getCameraIntersects(this.camera, this.solids)
      if (!intersects.length) return

      const { point, object } = intersects[0]
      console.log(object.name)
      const decalColor = object.name == 'enemy' ? 0xff0000 : 0x000000
      shootDecals(intersects[0], { color: decalColor })

      const ricochetColor = object.name == 'enemy' ? 0xff0000 : 0xcccccc
      this.ricochet.reset({ pos: point, unitAngle: 0.2, color: ricochetColor })
      const scene = getScene(object)
      scene.add(this.ricochet.particles)
    }, i * 100)
  }

  update(delta) {
    super.update(delta)
    this.fpsRenderer.render()
    this.ricochet.expand({ scalar: 1.2, maxRounds: 5, gravity: .02 })
    if (!this.mousemove) this.lookAtFront()
  }
}
