import * as THREE from 'three'
import { scene, renderer, camera, clock, createOrbitControls } from '/utils/scene.js'
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

export default class ParticleSystem {
  constructor({ parent, camera, texture = '/assets/particles/fire.png' } = {}) {
    material.uniforms.diffuseTexture.value = new THREE.TextureLoader().load(texture)

    this.camera = camera
    this.particles = []

    this.geometry = new THREE.BufferGeometry()
    this.geometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3))
    this.geometry.setAttribute('size', new THREE.Float32BufferAttribute([], 1))
    this.geometry.setAttribute('colour', new THREE.Float32BufferAttribute([], 4))
    this.geometry.setAttribute('angle', new THREE.Float32BufferAttribute([], 1))

    this.points = new THREE.Points(this.geometry, material)

    parent.add(this.points)

    this.alphaSpline = new LinearSpline((t, a, b) => a + t * (b - a))
    this.alphaSpline.addPoint(0.0, 0.0)
    this.alphaSpline.addPoint(0.1, 1.0)
    this.alphaSpline.addPoint(0.6, 1.0)
    this.alphaSpline.addPoint(1.0, 0.0)

    this.colorSpline = new LinearSpline((t, a, b) => a.clone().lerp(b, t))
    this.colorSpline.addPoint(0.0, new THREE.Color(0xFFFF80))
    this.colorSpline.addPoint(1.0, new THREE.Color(0xFF8080))

    this.sizeSpline = new LinearSpline((t, a, b) => a + t * (b - a))
    this.sizeSpline.addPoint(0.0, 1.0)
    this.sizeSpline.addPoint(0.5, 5.0)
    this.sizeSpline.addPoint(1.0, 1.0)
  }

  addParticles(deltaTime) {
    if (!this.gdfsghk) this.gdfsghk = 0.0

    this.gdfsghk += deltaTime
    const n = Math.floor(this.gdfsghk * 75.0)
    this.gdfsghk -= n / 75.0

    for (let i = 0; i < n; i++) {
      const life = (Math.random() * 0.75 + 0.25) * 10.0
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

  updateParticles(deltaTime) {
    for (const p of this.particles)
      p.life -= deltaTime

    this.particles = this.particles.filter(p => p.life > 0.0)

    for (const p of this.particles) {
      const t = 1.0 - p.life / p.maxLife

      p.rotation += deltaTime * 0.5
      p.alpha = this.alphaSpline.get(t)
      p.currentSize = p.size * this.sizeSpline.get(t)
      p.colour.copy(this.colorSpline.get(t))

      p.position.add(p.velocity.clone().multiplyScalar(deltaTime))

      const drag = p.velocity.clone()
      drag.multiplyScalar(deltaTime * 0.1)
      drag.x = Math.sign(p.velocity.x) * Math.min(Math.abs(drag.x), Math.abs(p.velocity.x))
      drag.y = Math.sign(p.velocity.y) * Math.min(Math.abs(drag.y), Math.abs(p.velocity.y))
      drag.z = Math.sign(p.velocity.z) * Math.min(Math.abs(drag.z), Math.abs(p.velocity.z))
      p.velocity.sub(drag)
    }

    this.particles.sort((a, b) => {
      const d1 = this.camera.position.distanceTo(a.position)
      const d2 = this.camera.position.distanceTo(b.position)

      if (d1 > d2) return -1
      if (d1 < d2) return 1
      return 0
    })
  }

  update(deltaTime) {
    this.addParticles(deltaTime)
    this.updateParticles(deltaTime)
    this.updateGeometry()
  }
}

createOrbitControls()
camera.position.z = 20

const light = new THREE.AmbientLight(0x666666)
scene.add(light)

const particles = new ParticleSystem({ parent: scene, camera, texture: '/assets/particles/fire.png' })

/* LOOP */

void function update() {
  requestAnimationFrame(update)
  const delta = clock.getDelta()
  particles.update(delta)
  renderer.render(scene, camera)
}()
