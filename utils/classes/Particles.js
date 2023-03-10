import * as THREE from 'three'
import input from '/utils/classes/Input.js'
import { similarColor } from '/utils/helpers.js'
import config from '/config.js'

const { randFloat } = THREE.MathUtils
const textureLoader = new THREE.TextureLoader()

const setPosition = (mesh, pos) => {
  if (Array.isArray(pos))
    mesh.position.set(...pos)
  else
    mesh.position.copy(pos)
}

function addVelocity({ geometry, minVelocity = .5, maxVelocity = 3 } = {}) {
  const velocities = []
  for (let i = 0; i < geometry.attributes.position.count; i++)
    velocities[i] = randFloat(minVelocity, maxVelocity)
  geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 1))
}

function createParticles({ num = 10000, file = 'ball.png', color, size = .5, opacity = 1, unitAngle = 1, minRadius = 100, maxRadius = 1000, blending = THREE.AdditiveBlending } = {}) {
  const geometry = new THREE.BufferGeometry()
  const positions = []
  const colors = []

  for (let i = 0; i < num; i++) {
    const vertex = new THREE.Vector3(
      randFloat(-unitAngle, unitAngle), randFloat(-unitAngle, unitAngle), randFloat(-unitAngle, unitAngle)
    )
    const scalar = randFloat(minRadius, maxRadius)
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

/**
 * Particles base class
 * constructor(): creates sphere full of particles
 * expand(): expands particles from center according to unitAngle and scalar
 * update(): moves particles vertically or horizontally
 */
export default class Particles {
  constructor(params) {
    this.t = 0
    this.mesh = createParticles(params)
  }

  get particles() {
    return this.mesh
  }

  reset({ pos = [0, 0, 0], unitAngle = 1, color } = {}) {
    const { mesh } = this
    this.t = 0
    mesh.visible = true
    setPosition(mesh, pos)

    const { position } = mesh.geometry.attributes
    for (let i = 0, l = position.array.length; i < l; i++)
      position.array[i] = randFloat(-unitAngle, unitAngle)
    position.needsUpdate = true

    if (color)
      mesh.material.color = new THREE.Color(color)

  }

  expand({ scalar = 1.1, maxRounds = 50, gravity = 0 } = {}) { // scalar < 1 reverses direction
    const { mesh } = this
    if (++this.t > maxRounds) {
      mesh.visible = false
      return
    }

    mesh.material.opacity = 1 - this.t / maxRounds
    const { position } = mesh.geometry.attributes

    const vertex = new THREE.Vector3()
    for (let i = 0, l = position.count; i < l; i++) {
      vertex.fromBufferAttribute(position, i)
      vertex.multiplyScalar(scalar)
      vertex.y -= gravity
      position.setXYZ(i, vertex.x, vertex.y, vertex.z)
    }

    position.needsUpdate = true
  }

  update({ delta = 1 / 60, min = -500, max = 500, axis = 2, minVelocity = 50, maxVelocity = 300, loop = true, pos, rotateY } = {}) {
    const { geometry } = this.mesh
    if (!geometry.attributes.velocity) addVelocity({ geometry, minVelocity, maxVelocity })
    const { position, velocity } = geometry.attributes

    velocity.array.forEach((vel, i) => {
      const index = 3 * i + axis
      const currentPos = position.array[index]

      if (axis === 1) // y: vertical axis
        position.array[index] = (loop && currentPos < min) ? max : (currentPos - vel * delta)

      if (axis === 2) // z: horizontal axis
        position.array[index] = (loop && currentPos > max) ? min : (currentPos + vel * delta)
    })

    position.needsUpdate = true
    if (pos) this.mesh.position.set(pos.x, 0, pos.z) // follow player
    if (rotateY) this.mesh.rotateY(rotateY)
  }
}

/* CHILD CLASSES */

export class Stars extends Particles {
  update({ min = -500, max = 500, ...rest } = {}) {
    super.update({ min, max, axis: 2, ...rest })
  }
}

export class Rain extends Particles {
  constructor({ file = 'raindrop.png', num = 10000, size = .2, opacity = .7, minRadius = 10, maxRadius = 100, color = 0xDEF4FC } = {}) {
    super({ file, num, size, opacity, minRadius, maxRadius, color, blending: THREE.NormalBlending })

    this.audio = new Audio('/assets/sounds/rain.mp3')
    this.audio.volume = config.volume
    this.audio.loop = true
    if (input.touched) this.audio.play()
  }

  update({ min = 0, max = 200, minVelocity = 120, maxVelocity = 240, ...rest } = {}) {
    super.update({ min, max, axis: 1, minVelocity, maxVelocity, ...rest })
  }
}

export class Snow extends Particles {
  constructor(params = {}) {
    super({ file: 'snowflake.png', color: 0xffffff, size: 7, minRadius: 50, maxRadius: 500, ...params })
  }

  update(params = {}) {
    super.update({ axis: 1, rotateY: .007, min: -100, max: 100, minVelocity: 50, maxVelocity: 150, ...params })
  }
}

export class Explosion extends Particles {
  constructor({ num = 30, file = 'fireball.png', size = .4, unitAngle = 0.1, ...rest } = {}) {
    super({ num, file, size, unitAngle, ...rest })
  }
}

export class FlameThrower extends Particles {
  constructor({ file = 'fire.png', size = 5, num = 50, minRadius = 0, maxRadius = .5, color = 0xffffff, ...rest } = {}) {
    super({ num, file, size, minRadius, maxRadius, color, ...rest })
    this.mesh.rotateX(Math.PI)
    this.mesh.translateY(-1.2)
    this.mesh.translateZ(1.75)
  }

  update(params = {}) {
    super.update({ min: 0, max: 8, axis: 2, minVelocity: 5, maxVelocity: 10, ...params })
  }
}

export class Smoke extends Particles {
  constructor({ file = 'smoke.png', size = 1, num = 10, minRadius = 0, maxRadius = .1, color = 0x999999, blending = THREE.NormalBlending, ...rest } = {}) {
    super({ num, file, size, minRadius, maxRadius, color, blending, ...rest })
    this.mesh.rotateX(Math.PI)
  }

  update(params = {}) {
    super.update({ rotateY: .009, min: -4, max: 0, minVelocity: 2, maxVelocity: 5, axis: 1, ...params })
  }
}
