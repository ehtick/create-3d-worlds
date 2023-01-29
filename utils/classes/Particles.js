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
    material.map = textureLoader.load(`/assets/particles/${file}`)
    material.blending = blending
    material.depthWrite = false // for explosion
  }

  if (color)
    material.color = new THREE.Color(color)
  else
    material.vertexColors = true

  return new THREE.Points(geometry, material)
}

function update({ particles, min = -300, max = 300, axis = 1, pos } = {}) {
  const { geometry } = particles
  if (!geometry.attributes.velocity) addVelocity({ geometry, min: 0.5, max: 3 })
  const { position, velocity } = geometry.attributes

  velocity.array.forEach((vel, i) => {
    const index = 3 * i + axis // x: 0, y: 1, z: 2
    const value = position.array[index]
    if (axis === 1) // move y
      position.array[index] = value < min ? max : value - vel
    if (axis === 2) // move z
      position.array[index] = value > max ? min : value + vel
  })

  position.needsUpdate = true
  if (pos) particles.position.set(pos.x, 0, pos.z) // follow player
}

function updateRain({ particles, min = -300, max = 300, axis = 1, ...rest } = {}) {
  update({ particles, min, max, axis, ...rest })
}

function updateStars({ particles, min = -500, max = 500, axis = 2, ...rest } = {}) {
  update({ particles, min, max, axis, ...rest })
}

function updateSnow({ particles, rotateY = .003, ...rest } = {}) {
  updateRain({ particles, ...rest })
  particles.rotateY(rotateY)
}

/* CLASS */

export default class Particles {
  constructor(params) {
    this.t = 0
    this.particles = createParticles(params)
  }

  expand({ particles, scalar, maxRounds = 50, gravity = 0 } = {}) {
    if (++this.t > maxRounds) {
      particles.visible = false
      return
    }
    particles.material.opacity = 1 - this.t / maxRounds
    const { array } = particles.geometry.attributes.position
    for (let i = 0, l = array.length; i < l; i += 3) {
      const vertex = new THREE.Vector3(array[i], array[i + 1], array[i + 2])
      vertex.multiplyScalar(scalar)
      vertex.y -= gravity
      array[i] = vertex.x
      array[i + 1] = vertex.y
      array[i + 2] = vertex.z
    }
    particles.geometry.attributes.position.needsUpdate = true
  }

  reset({ particles, pos = [0, 0, 0], unitAngle = 1 } = {}) {
    this.t = 0
    particles.visible = true

    setPosition(particles, pos)

    const { array } = particles.geometry.attributes.position
    for (let i = 0, l = array.length; i < l; i++)
      array[i] = randFloat(-unitAngle, unitAngle)

    particles.geometry.attributes.position.needsUpdate = true
  }

  update(params) {
    updateStars({ particles: this.particles, ...params })
  }
}