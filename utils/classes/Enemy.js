import { createBox } from '/utils/geometry.js'

export default class Enemy {
  constructor({ x, z, size = 1, height = 3 }) {
    this.mesh = createBox({ size, height, color: 0xff0000 })
    this.mesh.position.set(x, height / 2, z)
    this.lastRandomX = Math.random()
    this.lastRandomZ = Math.random()
    this.speed = 7
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