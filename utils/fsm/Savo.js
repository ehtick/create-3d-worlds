import Player from '/utils/fsm/Player.js'
import { createBox } from '/utils/geometry.js'
import { camera as defaultCamera } from '/utils/scene.js'
import { normalizeMouse } from '/utils/helpers.js'

export default class Savo extends Player {
  constructor({ speed, size = 2, camera = defaultCamera, ...params } = {}) {
    const mesh = createBox({ size })
    mesh.material.opacity = 0
    mesh.material.transparent = true
    super({ mesh, jumpStyle: 'FLY', camera: null, ...params })
    this.speed = speed || this.size * 3
    this.maxVelocityY = .2
    this.minVelocityY = -this.maxVelocityY

    this.mouseSensitivity = .05
    this.camera = camera
    camera.rotation.set(0, 0, 0)
    mesh.add(camera)

    document.addEventListener('mousemove', e => this.onMouseMove(e))
  }

  onMouseMove(e) {
    const { x, y } = normalizeMouse(e)

    this.mesh.rotateY(-x * this.mouseSensitivity)
    this.camera.rotateX(y * this.mouseSensitivity)
    this.camera.rotation.x = Math.max(-0.1, Math.min(Math.PI / 4, this.camera.rotation.x))
  }
}
