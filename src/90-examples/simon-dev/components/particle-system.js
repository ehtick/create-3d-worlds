import * as THREE from '/node_modules/three127/build/three.module.js'
import { scene, camera } from '/utils/scene.js'
import { material } from '/utils/shaders/thrust.js'
import { LinearSpline } from '../shared/spline.mjs'

class ParticleEmitter {
  constructor() {
    this.alphaSpline_ = new LinearSpline((t, a, b) => a + t * (b - a))

    this.colourSpline_ = new LinearSpline((t, a, b) => {
      const c = a.clone()
      return c.lerp(b, t)
    })

    this.sizeSpline_ = new LinearSpline((t, a, b) => a + t * (b - a))

    this.emissionRate_ = 0.0
    this.emissionAccumulator_ = 0.0
    this.particles = []
    this.emitterLife_ = null
  }

  UpdateParticles_(timeElapsed) {
    for (const p of this.particles)
      p.life -= timeElapsed

    this.particles = this.particles.filter(p => p.life > 0.0)

    for (let i = 0; i < this.particles.length; ++i) {
      const p = this.particles[i]
      const t = 1.0 - p.life / p.maxLife

      if (t < 0 || t > 1) {
        const a = 0
      }

      p.rotation += timeElapsed * 0.5
      p.alpha = this.alphaSpline_.Get(t)
      p.currentSize = p.size * this.sizeSpline_.Get(t)
      p.colour.copy(this.colourSpline_.Get(t))

      p.position.add(p.velocity.clone().multiplyScalar(timeElapsed))

      const drag = p.velocity.clone()
      drag.multiplyScalar(timeElapsed * 0.1)
      drag.x = Math.sign(p.velocity.x) * Math.min(Math.abs(drag.x), Math.abs(p.velocity.x))
      drag.y = Math.sign(p.velocity.y) * Math.min(Math.abs(drag.y), Math.abs(p.velocity.y))
      drag.z = Math.sign(p.velocity.z) * Math.min(Math.abs(drag.z), Math.abs(p.velocity.z))
      p.velocity.sub(drag)
    }
  }

  CreateParticle_() {
    const life = (Math.random() * 0.75 + 0.25) * 5.0
    return {
      position: new THREE.Vector3(
        (Math.random() * 2 - 1) * 4.0 + -44,
        (Math.random() * 2 - 1) * 4.0 + 0,
        (Math.random() * 2 - 1) * 4.0 + 12),
      size: (Math.random() * 0.5 + 0.5) * 2.0,
      colour: new THREE.Color(),
      alpha: 1.0,
      life,
      maxLife: life,
      rotation: Math.random() * 2.0 * Math.PI,
      velocity: new THREE.Vector3(0, 1, 0),
      blend: 0.0,
    }
  }

  get IsAlive() {
    if (this.emitterLife_ === null)
      return this.particles.length > 0

    return this.emitterLife_ > 0.0 || this.particles.length > 0

  }

  SetLife(life) {
    this.emitterLife_ = life
  }

  SetEmissionRate(rate) {
    this.emissionRate_ = rate
  }

  OnUpdate_(_) {
  }

  Update(timeElapsed) {
    this.OnUpdate_(timeElapsed)

    if (this.emitterLife_ !== null)
      this.emitterLife_ -= timeElapsed

    if (this.emissionRate_ > 0.0) {
      this.emissionAccumulator_ += timeElapsed
      const n = Math.floor(this.emissionAccumulator_ * this.emissionRate_)
      this.emissionAccumulator_ -= n / this.emissionRate_

      for (let i = 0; i < n; i++) {
        const p = this.CreateParticle_()
        this.particles.push(p)
      }
    }

    this.UpdateParticles_(timeElapsed)
  }
};

class ParticleSystem {
  constructor({ texture }) {
    material.uniforms.diffuseTexture.value = new THREE.TextureLoader().load(texture)
    this.particles = []

    this.geometry_ = new THREE.BufferGeometry()
    this.geometry_.setAttribute('position', new THREE.Float32BufferAttribute([], 3))
    this.geometry_.setAttribute('size', new THREE.Float32BufferAttribute([], 1))
    this.geometry_.setAttribute('colour', new THREE.Float32BufferAttribute([], 4))
    this.geometry_.setAttribute('angle', new THREE.Float32BufferAttribute([], 1))
    this.geometry_.setAttribute('blend', new THREE.Float32BufferAttribute([], 1))

    this.points_ = new THREE.Points(this.geometry_, material)

    scene.add(this.points_)

    this.emitters_ = []
    this.particles = []

    this.UpdateGeometry_()
  }

  Destroy() {
    material.dispose()
    this.geometry_.dispose()
    if (this.points_.parent)
      this.points_.parent.remove(this.points_)

  }

  AddEmitter(e) {
    this.emitters_.push(e)
  }

  UpdateGeometry_() {
    const positions = []
    const sizes = []
    const colours = []
    const angles = []
    const blends = []

    const box = new THREE.Box3()
    for (const p of this.particles) {
      positions.push(p.position.x, p.position.y, p.position.z)
      colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha)
      sizes.push(p.currentSize)
      angles.push(p.rotation)
      blends.push(p.blend)

      box.expandByPoint(p.position)
    }

    this.geometry_.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    this.geometry_.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))
    this.geometry_.setAttribute('colour', new THREE.Float32BufferAttribute(colours, 4))
    this.geometry_.setAttribute('angle', new THREE.Float32BufferAttribute(angles, 1))
    this.geometry_.setAttribute('blend', new THREE.Float32BufferAttribute(blends, 1))

    this.geometry_.attributes.position.needsUpdate = true
    this.geometry_.attributes.size.needsUpdate = true
    this.geometry_.attributes.colour.needsUpdate = true
    this.geometry_.attributes.angle.needsUpdate = true
    this.geometry_.attributes.blend.needsUpdate = true
    this.geometry_.boundingBox = box
    this.geometry_.boundingSphere = new THREE.Sphere()

    box.getBoundingSphere(this.geometry_.boundingSphere)
  }

  UpdateParticles_() {
    this.particles = this.emitters_.map(e => e.particles)
    this.particles = this.particles.flat()
    this.particles.sort((a, b) => {
      const d1 = camera.position.distanceTo(a.position)
      const d2 = camera.position.distanceTo(b.position)

      if (d1 > d2)
        return -1

      if (d1 < d2)
        return 1

      return 0
    })
  }

  UpdateEmitters_(timeElapsed) {
    for (let i = 0; i < this.emitters_.length; ++i)
      this.emitters_[i].Update(timeElapsed)

    this.emitters_ = this.emitters_.filter(e => e.IsAlive)
  }

  Update(timeElapsed) {
    this.UpdateEmitters_(timeElapsed)
    this.UpdateParticles_(timeElapsed)
    this.UpdateGeometry_()
  }
};

export {
  ParticleEmitter,
  ParticleSystem,
}
