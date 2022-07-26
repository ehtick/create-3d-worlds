import * as THREE from '/node_modules/three127/build/three.module.js'
import { scene, camera } from '/utils/scene.js'
import { material } from '/utils/shaders/thrust.js'
import { LinearSpline } from '../shared/spline.mjs'

export class ParticleSystem {
  constructor({ texture, parent = scene } = {}) {
    material.uniforms.diffuseTexture.value = new THREE.TextureLoader().load(texture)

    this.particles = []

    this.geometry = new THREE.BufferGeometry()
    this.geometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3))
    this.geometry.setAttribute('size', new THREE.Float32BufferAttribute([], 1))
    this.geometry.setAttribute('colour', new THREE.Float32BufferAttribute([], 4))
    this.geometry.setAttribute('angle', new THREE.Float32BufferAttribute([], 1))

    this.points = new THREE.Points(this.geometry, material)
    parent.add(this.points)

    this.alphaSpline = new LinearSpline((t, a, b) => a + t * (b - a))
    this.colourSpline = new LinearSpline((t, a, b) => a.clone().lerp(b, t))
    this.sizeSpline = new LinearSpline((t, a, b) => a + t * (b - a))

    this._UpdateGeometry()
  }

  AddParticles(origin, n) {
    for (let i = 0; i < n; i++) {
      const life = (Math.random() * 0.75 + 0.25) * 3.0
      const p = new THREE.Vector3(
        (Math.random() * 2 - 1) * 1.0,
        (Math.random() * 2 - 1) * 1.0,
        (Math.random() * 2 - 1) * 1.0)
      const d = p.clone().normalize().multiplyScalar(15)
      p.add(origin)
      this.particles.push({
        position: p,
        size: (Math.random() * 0.5 + 0.5) * 4.0,
        colour: new THREE.Color(),
        alpha: 1.0,
        life,
        maxLife: life,
        rotation: Math.random() * 2.0 * Math.PI,
        velocity: d,
      })
    }
  }

  _UpdateGeometry() {
    const positions = []
    const sizes = []
    const colours = []
    const angles = []

    for (const p of this.particles) {
      positions.push(p.position.x, p.position.y, p.position.z)
      colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha)
      sizes.push(p.currentSize)
      angles.push(p.rotation)
    }

    this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    this.geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))
    this.geometry.setAttribute('colour', new THREE.Float32BufferAttribute(colours, 4))
    this.geometry.setAttribute('angle', new THREE.Float32BufferAttribute(angles, 1))

    this.geometry.attributes.position.needsUpdate = true
    this.geometry.attributes.size.needsUpdate = true
    this.geometry.attributes.colour.needsUpdate = true
    this.geometry.attributes.angle.needsUpdate = true
  }

  _UpdateParticles(timeElapsed) {
    for (const p of this.particles) p.life -= timeElapsed

    this.particles = this.particles.filter(p => p.life > 0.0)

    for (const p of this.particles) {
      const t = 1.0 - p.life / p.maxLife

      p.rotation += timeElapsed * 0.5
      p.alpha = this.alphaSpline.Get(t)
      p.currentSize = p.size * this.sizeSpline.Get(t)
      p.colour.copy(this.colourSpline.Get(t))

      p.position.add(p.velocity.clone().multiplyScalar(timeElapsed))

      const drag = p.velocity.clone()
      drag.multiplyScalar(timeElapsed * 2.0)
      drag.x = Math.sign(p.velocity.x) * Math.min(Math.abs(drag.x), Math.abs(p.velocity.x))
      drag.y = Math.sign(p.velocity.y) * Math.min(Math.abs(drag.y), Math.abs(p.velocity.y))
      drag.z = Math.sign(p.velocity.z) * Math.min(Math.abs(drag.z), Math.abs(p.velocity.z))
      p.velocity.sub(drag)
    }

    this.particles.sort((a, b) => {
      const d1 = camera.position.distanceTo(a.position)
      const d2 = camera.position.distanceTo(b.position)

      if (d1 > d2) return -1
      if (d1 < d2) return 1
      return 0
    })
  }

  Step(timeElapsed) {
    this._UpdateParticles(timeElapsed)
    this._UpdateGeometry()
  }
}
