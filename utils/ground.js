import * as THREE from 'three'
import { SimplexNoise } from '/libs/SimplexNoise.js'
import { randomInRange, randomNuance, getTexture, similarColor } from '/utils/helpers.js'

const simplex = new SimplexNoise()

/* GROUND */

export function createGroundMaterial({ color = 0x509f53, file, repeat } = {}) {
  const params = { side: THREE.FrontSide }
  const material = file
    ? new THREE.MeshBasicMaterial({
      ...params,
      map: getTexture({ file, repeat }),
    })
    : new THREE.MeshPhongMaterial({ ...params, color }) // MeshLambertMaterial ne radi rasveta
  return material
}

export function crateGroundGeometry({ size, circle = true }) {
  const geometry = circle
    ? new THREE.CircleGeometry(size, 32)
    : new THREE.PlaneGeometry(size, size)

  geometry.rotateX(-Math.PI * 0.5)
  return geometry
}

export function createGround({ size = 1000, color, circle, file, repeat = size / 8 } = {}) {
  const material = createGroundMaterial({ file, color, repeat })
  const geometry = crateGroundGeometry({ size, circle })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.receiveShadow = true
  return mesh
}

/* TERRAIN */

export function createTerrain({ size = 400, segments = 50, colorParam, factor = 2 } = {}) {
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments)
  geometry.rotateX(- Math.PI / 2)

  const { position } = geometry.attributes
  const vertex = new THREE.Vector3()

  for (let i = 0, l = position.count; i < l; i++) {
    vertex.fromBufferAttribute(position, i)
    vertex.y += randomInRange(-factor * 5, factor * 7.5) * Math.random() * Math.random()
    vertex.z += randomInRange(-factor, factor)
    position.setXYZ(i, vertex.x, vertex.y, vertex.z)
  }

  const colors = []
  for (let i = 0, l = position.count; i < l; i++) {
    const color = randomNuance(colorParam)
    colors.push(color.r, color.g, color.b)
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

  const material = new THREE.MeshLambertMaterial({ vertexColors: THREE.VertexColors })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.receiveShadow = true
  return mesh
}

export function createCraters() {
  const geometry = new THREE.PlaneGeometry(100, 100, 100, 100)
  const material = new THREE.MeshBasicMaterial({ color: 0x7a8a46, wireframe: true })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotateX(-Math.PI / 2)

  const xZoom = 20
  const yZoom = 20
  const noiseStrength = 5

  const { position } = geometry.attributes
  const vertex = new THREE.Vector3()

  for (let i = 0, l = position.count; i < l; i++) {
    vertex.fromBufferAttribute(position, i)
    const x = vertex.x / xZoom
    const y = vertex.y / yZoom
    let noise = simplex.noise(x, y) * noiseStrength
    noise = Math.round(noise)
    if (noise > 2.5) continue // cut mountain's peaks
    vertex.z = noise
    position.setXYZ(i, vertex.x, vertex.y, vertex.z)
  }
  return mesh
}

export function createDunes() {
  const geometry = new THREE.PlaneGeometry(100, 100, 100, 100)
  const material = new THREE.MeshBasicMaterial({ color: 0xc2b280, wireframe: true })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotateX(-Math.PI / 2)

  const { position } = geometry.attributes
  const vertex = new THREE.Vector3()

  for (let i = 0, l = position.count; i < l; i++) {
    vertex.fromBufferAttribute(position, i)

    const res = simplex.noise(vertex.x * .1, vertex.y * .1)
    vertex.z = res * 1.5

    position.setXYZ(i, vertex.x, vertex.y, vertex.z)
  }
  return mesh
}

/* WATER */

export const createWater = ({ size = 1200, segments = 20, opacity = .6, file = 'water512.jpg' } = {}) => {
  const material = new THREE.MeshLambertMaterial({
    color: 0x6699ff,
    opacity,
    transparent: true,
    vertexColors: THREE.FaceColors,
    map: file ? getTexture({ file, repeat: 5 }) : null
  })
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments)
  geometry.dynamic = true
  geometry.verticesNeedUpdate = true

  const colors = []
  for (let i = 0, l = geometry.attributes.position.count; i < l; i++) {
    const nuance = similarColor(0x40E0D0, .15)
    colors.push(nuance.r, nuance.g, nuance.b)
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

  const water = new THREE.Mesh(geometry, material)
  water.receiveShadow = true
  water.name = 'water'
  water.rotateX(-Math.PI / 2)
  return water
}

/* ALIASES */

export function createFloor({ color = 0x808080, circle = false, ...rest } = {}) {
  return createGround({ color, circle, ...rest })
}

/* UPDATES */

let oldPosition

export function wave(geometry, time, amplitude = 1, frequency = 1) {
  const { position } = geometry.attributes
  oldPosition = oldPosition || position.clone()

  const vertex = new THREE.Vector3()
  const oldVertex = new THREE.Vector3()

  for (let i = 0, l = position.count; i < l; i++) {
    vertex.fromBufferAttribute(position, i)
    oldVertex.fromBufferAttribute(oldPosition, i)
    const { x, y } = vertex
    let change = 0

    // change X
    change += 0.32 * amplitude * Math.sin(x * 1.9 * frequency + time)
    change += 3 * amplitude * Math.sin(x * 0.1 * frequency + time)

    // change Y
    change += .42 * amplitude * Math.sin(y * 2.1 * frequency + time)
    change += 2.8 * amplitude * Math.sin(y * 0.2 * frequency + time)

    change *= amplitude * 0.6
    vertex.z = change + oldVertex.z // preserve initial terrain
    position.setXYZ(i, vertex.x, vertex.y, vertex.z)
  }
  position.needsUpdate = true
}