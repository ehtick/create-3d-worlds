import Player from '/utils/fsm/Player.js'
import { createBox } from '/utils/geometry.js'
import { camera } from '/utils/scene.js'

const PI_HALF = Math.PI * .5

export default class Savo extends Player {
  constructor({ speed, size = 2, ...params } = {}) {
    const mesh = createBox({ size })
    mesh.material.opacity = 0
    mesh.material.transparent = true
    super({ mesh, jumpStyle: 'FLY', ...params })
    this.speed = speed || this.size * 3
    this.maxVelocityY = .2
    this.minVelocityY = -this.maxVelocityY

    this.mouseSensitivity = .002
    camera.rotation.set(0, 0, 0)
    mesh.add(camera)

    document.addEventListener('mousemove', e => this.onMouseMove(e))
  }

  onMouseMove(e) {
    this.mesh.rotation.y -= e.movementX * this.mouseSensitivity

    camera.rotation.x -= e.movementY * this.mouseSensitivity
    camera.rotation.x = Math.max(-PI_HALF, Math.min(PI_HALF, camera.rotation.x))
  }

  update(delta) {
    super.update(delta)
    // const target = this.mesh.position.clone()
    // target.y = this.mesh.position.y + this.size
    // camera.lookAt(target)
  }
}
