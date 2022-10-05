import Player from '/utils/fsm/PlayerFSM.js'
import { createBox } from '/utils/geometry.js'
import { camera } from '/utils/scene.js'

export default class Savo extends Player {
  constructor({ speed, size = 2, ...params } = {}) {
    const mesh = createBox({ size })
    mesh.material.opacity = 0
    mesh.material.transparent = true
    super({ mesh, jumpStyle: 'FLY', ...params })
    this.speed = speed || this.size * 3
    this.maxVelocityY = .2
    this.minVelocityY = -this.maxVelocityY
  }

  update(delta) {
    super.update(delta)
    const target = this.mesh.position.clone()
    target.y = this.mesh.position.y + this.size
    camera.lookAt(target)
  }
}
