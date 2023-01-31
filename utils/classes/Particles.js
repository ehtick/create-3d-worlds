import * as THREE from 'three'
import { similarColor } from '/utils/helpers.js'

const { randFloat } = THREE.MathUtils
const textureLoader = new THREE.TextureLoader()

const setPosition = (mesh, pos) => {
  if (Array.isArray(pos))
    mesh.position.set(...pos)
  else
    mesh.position.copy(pos)
}

function addVelocity({ geometry, min = .5, max = 3 } = {}) {
  const velocities = []
  for (let i = 0; i < geometry.attributes.position.count; i++)
    velocities[i] = randFloat(min, max)
  geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 1))
}

function createParticles({ num = 10000, file = 'ball.png', color, size = .5, opacity = 1, unitAngle = 1, minRange = 100, maxRange = 1000, blending = THREE.AdditiveBlending } = {}) {
  const geometry = new THREE.BufferGeometry()
  const positions = []
  const colors = []

  for (let i = 0; i < num; i++) {
    const vertex = new THREE.Vector3(
      randFloat(-unitAngle, unitAngle), randFloat(-unitAngle, unitAngle), randFloat(-unitAngle, unitAngle)
    )
    const scalar = randFloat(minRange, maxRange)
    vertex.multiplyScalar(scalar)
    const { x, y, z } = vertex
    positions.push(x, y, z)
    if (!color) {
      const color = similarColor(0xf2c5f3)
      colors.push(color.r, color.g, color.b)
    }
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  if (!color) geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size,
    transparent: true,
    opacity,
  })
  if (file) {
    material.map = textureLoader.load(`/assets/textures/particles/${file}`)
    material.blending = blending
    material.depthWrite = false // for explosion
  }

  if (color)
    material.color = new THREE.Color(color)
  else
    material.vertexColors = true

  return new THREE.Points(geometry, material)
}

/* BASE CLASS */

export default class Particles {
  constructor(params) {
    this.t = 0
    this.particles = createParticles(params)
  }

  reset({ pos = [0, 0, 0], unitAngle = 1 } = {}) {
    const { particles } = this
    this.t = 0
    particles.visible = true
    setPosition(particles, pos)

    const { position } = particles.geometry.attributes
    for (let i = 0, l = position.array.length; i < l; i++)
      position.array[i] = randFloat(-unitAngle, unitAngle)

    position.needsUpdate = true
  }

  expand({ scalar = 1.1, maxRounds = 50, gravity = 0 } = {}) { // scalar < 1 reverses direction
    const { particles } = this
    if (++this.t > maxRounds) {
      particles.visible = false
      return
    }

    particles.material.opacity = 1 - this.t / maxRounds
    const { position } = particles.geometry.attributes

    const vertex = new THREE.Vector3()
    for (let i = 0, l = position.count; i < l; i ++) {
      vertex.fromBufferAttribute(position, i)
      vertex.multiplyScalar(scalar)
      vertex.y -= gravity
      position.setXYZ(i, vertex.x, vertex.y, vertex.z)
    }

    position.needsUpdate = true
  }

  update({ min = -500, max = 500, axis = 2, minVelocity = .5, maxVelocity = 3, pos } = {}) {
    const { geometry } = this.particles
    if (!geometry.attributes.velocity) addVelocity({ geometry, min: minVelocity, max: maxVelocity })
    const { position, velocity } = geometry.attributes

    velocity.array.forEach((vel, i) => {
      const index = 3 * i + axis
      const currentPos = position.array[index]
      if (axis === 1) // move on y axis
        position.array[index] = currentPos < min ? max : currentPos - vel
      if (axis === 2) // move on z axis
        position.array[index] = currentPos > max ? min : currentPos + vel
    })

    position.needsUpdate = true
    if (pos) this.particles.position.set(pos.x, 0, pos.z) // follow player
  }
}

/* CHILD CLASSES */

export class Stars extends Particles {
  update({ min = -500, max = 500, ...rest } = {}) {
    super.update({ min, max, axis: 2, ...rest })
  }
}

export class Rain extends Particles {
  constructor({ file = 'raindrop.png', num = 10000, size = .2, opacity = .7, minRange = 10, maxRange = 100, color = 0xDEF4FC } = {}) {
    super({ file, num, size, opacity, minRange, maxRange, color, blending: THREE.NormalBlending })
  }

  update({ min = 0, max = 200, minVelocity = 2, maxVelocity = 4, ...rest } = {}) {
    super.update({ min, max, axis: 1, minVelocity, maxVelocity, ...rest })
  }
}

export class Snow extends Rain {
  constructor({ file = 'snowflake.png', size = 5, color = 0xffffff, ...rest } = {}) {
    super({ file, size, color, ...rest })
  }

  update({ rotateY = .003, ...rest } = {}) {
    super.update({ ...rest })
    this.particles.rotateY(rotateY)
  }
}

export class Explosion extends Particles {
  constructor({ num = 30, file = 'fireball.png', size = .4, unitAngle = 0.1, ...rest } = {}) {
    super({ num, file, size, unitAngle, ...rest })
  }
}