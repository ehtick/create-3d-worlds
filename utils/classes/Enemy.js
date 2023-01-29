import { createBox } from '/utils/geometry.js'

export default class Enemy {
  constructor({ x, z, size = 2 }) {
    this.mesh = createBox({ size, color: 0xff0000 })
    this.mesh.position.set(x, size / 2, z)
    this.lastRandomX = Math.random()
    this.lastRandomZ = Math.random()
    this.speed = 10
  }

  update(delta) {
    const speed = this.speed * delta
    if (Math.random() > 0.995) {
      this.lastRandomX = Math.random() * 2 - 1
      this.lastRandomZ = Math.random() * 2 - 1
    }
    this.mesh.translateX(speed * this.lastRandomX)
    this.mesh.translateZ(speed * this.lastRandomZ)
  }
}