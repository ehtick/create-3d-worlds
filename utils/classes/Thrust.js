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
  constructor() {
    this.t = 0.0
    this.particles = []
    this.geometry = new THREE.BufferGeometry()
    this.mesh = new THREE.Points(this.geometry, material)
    this.spline = new LinearSpline((t, a, b) => a + t * (b - a))
    this.spline.addPoint(0.0, 1.0)
    this.spline.addPoint(0.5, 5.0)
    this.spline.addPoint(1.0, 1.0)
  }

  addParticles(deltaTime) {
    // if (!t) t = 0.0

    this.t += deltaTime
    const n = Math.floor(this.t * 75.0)
    this.t -= n / 75.0

    for (let i = 0; i < n; i++) {
      const life = (Math.random() * 0.75 + 0.25) * 5.0
      this.particles.push({
        position: new THREE.Vector3(
          (Math.random() * 2 - 1) * 1.0,
          (Math.random() * 2 - 1) * 1.0,
          (Math.random() * 2 - 1) * 1.0),
        size: (Math.random() * 0.5 + 0.5) * 4.0,
        colour: new THREE.Color(),
        alpha: 1.0,
        life,
        maxLife: life,
        rotation: Math.random() * 2.0 * Math.PI,
        velocity: new THREE.Vector3(0, -15, 0),
      })
    }
  }

  updateGeometry() {
    const positions = []
    const sizes = []
    const colours = []

    for (const p of this.particles) {
      positions.push(p.position.x, p.position.y, p.position.z)
      colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha)
      sizes.push(p.currentSize)
    }

    this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    this.geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))
    this.geometry.setAttribute('colour', new THREE.Float32BufferAttribute(colours, 4))
  }

  updateParticles(deltaTime) {
    this.particles = this.particles.filter(p => {
      p.life -= deltaTime
      return p.life > 0.0
    })

    for (const p of this.particles) {
      const t = 1.0 - p.life / p.maxLife

      p.rotation += deltaTime * 0.5
      p.currentSize = p.size * this.spline.get(t)
      p.position.add(p.velocity.clone().multiplyScalar(deltaTime))
    }
  }
}