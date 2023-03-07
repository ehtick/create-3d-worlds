import * as THREE from 'three'
import { material } from '/utils/shaders/thrust.js'

class LinearSpline {
  constructor(lerp) {
    this.points = []
    this.lerp = lerp
  }

  addPoint(t, d) {
    this.points.push([t, d])
  }

  get(t) {
    let p1 = 0

    for (let i = 0; i < this.points.length; i++) {
      if (this.points[i][0] >= t)
        break
      p1 = i
    }

    const p2 = Math.min(this.points.length - 1, p1 + 1)

    if (p1 == p2) return this.points[p1][1]

    return this.lerp(
      (t - this.points[p1][0]) / (this.points[p2][0] - this.points[p1][0]),
      this.points[p1][1],
      this.points[p2][1]
    )
  }
}

export default class Thrust {
  constructor(smokeUp = false) {
    this.t = 0.0
    this.particles = []
    this.geometry = new THREE.BufferGeometry()
    this.mesh = new THREE.Points(this.geometry, material)
    if (smokeUp) this.mesh.rotateX(Math.PI)

    this.spline = new LinearSpline((t, a, b) => a + t * (b - a))
    this.spline.addPoint(0.0, .5)
    this.spline.addPoint(0.25, 2.5)
    this.spline.addPoint(.5, .5)
  }

  addParticles(deltaTime, velocity = [0, -12, 0]) {
    this.t += deltaTime
    const n = Math.floor(this.t * 75.0)
    this.t -= n / 75.0

    for (let i = 0; i < n; i++) {
      const life = (Math.random() * 0.5 + 0.2) * 4.0
      this.particles.push({
        position: new THREE.Vector3(
          (Math.random() * 1.5 - .75) * 1.0,
          (Math.random() * 1.5 - .75) * 1.0,
          (Math.random() * 1.5 - .75) * 1.0),
        size: (Math.random() * 0.5 + 0.5) * 3.0,
        colour: new THREE.Color(),
        alpha: .25,
        life,
        maxLife: life,
        rotation: Math.random() * 2 * Math.PI,
        velocity: new THREE.Vector3(...velocity),
      })
    }
  }

  updateParticles(deltaTime = 1 / 60) {
    this.particles = this.particles.filter(p => {
      p.life -= deltaTime
      return p.life > 0.0
    })

    const positions = []
    const sizes = []
    const colours = []

    for (const p of this.particles) {
      const t = 1.0 - p.life / p.maxLife

      p.rotation += deltaTime * 0.5
      p.position.add(p.velocity.clone().multiplyScalar(deltaTime))
      const currentSize = p.size * this.spline.get(t)

      positions.push(p.position.x, p.position.y, p.position.z)
      colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha)
      sizes.push(currentSize)
    }

    this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    this.geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))
    this.geometry.setAttribute('colour', new THREE.Float32BufferAttribute(colours, 4))
  }

  clear() {
    this.particles = []
    this.updateParticles()
  }

  update(dt, { velocity } = {}) {
    this.addParticles(dt, velocity)
    this.updateParticles(dt)
  }
}