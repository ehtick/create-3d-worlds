import Player from '/utils/fsm/Player.js'
import { createInvisibleBox } from '/utils/geometry.js'
import { camera as defaultCamera } from '/utils/scene.js'
import { normalizeMouse } from '/utils/helpers.js'
import FPSRenderer from '/utils/classes/2d/FPSRenderer.js'

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

  update(delta) {
    super.update(delta)
    this.fpsRenderer.render()
    if (!this.mousemove) this.lookAtFront()
  }
}
