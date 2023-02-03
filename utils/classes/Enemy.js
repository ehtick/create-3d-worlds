import * as THREE from 'three'
import { createBox } from '/utils/geometry.js'

const { randFloat } = THREE.MathUtils

export default class Enemy {
  constructor({ x, z, size = 1, height = 2, mesh = createBox({ size, height, color: 0x009900 }) }) {
    this.mesh = mesh
    this.mesh.position.set(x, height / 2, z)
    this.speed = 2
    this.mesh.name = 'enemy'
    this.randomizeMove()
  }

  randomizeMove() {
    this.lastRandomAngle = randFloat(-1, 1)
    this.mesh.rotateY(this.lastRandomAngle)
    this.lastRandomSpeed = randFloat(.5, 2)
  }

  update(delta) {
    const speed = this.speed * delta
    if (Math.random() > 0.995) this.randomizeMove()
    this.mesh.translateZ(speed * this.lastRandomSpeed)
  }
}