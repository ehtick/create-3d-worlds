import * as THREE from 'three'
import { randomNuance } from './helpers.js'
import { material as skyMaterial } from '/utils/shaders/gradient-sky.js'

const { randFloat } = THREE.Math
const textureLoader = new THREE.TextureLoader()

/* BOXES */

export function createBox({ size = 1, height = size, depth = size, file, bumpFile, color = randomNuance({ h: 0.1, s: 0.01, l: .75 }) } = {}) {
  const geometry = new THREE.BoxGeometry(size, height, depth)
  const options = {
    map: file ? textureLoader.load(`/assets/textures/${file}`) : null,
    color: !file ? color : null,
    bumpMap: bumpFile ? textureLoader.load(`/assets/textures/${bumpFile}`) : null,
  }
  const material = new THREE.MeshPhongMaterial(options)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.translateY(height / 2)
  mesh.updateMatrix()
  mesh.geometry.applyMatrix4(mesh.matrix)
  return mesh
}

export const createCrate = ({ size, file = 'crate.gif' } = {}) => createBox({ size, file })

export const createBumpBox = ({ size, file = 'walls/bricks.jpg', bumpFile = 'walls/bricks-gray.jpg' } = {}) =>
  createBox({ size, file, bumpFile })

export function createBuilding({ width = 2, height = 1, depth = 1, color = 0x999999, frontFile, backFile, rightFile, leftFile, topFile, bumpScale = .015 } = {}) {
  const geometry = new THREE.BoxGeometry(width, height, depth)
  const frontTexture = textureLoader.load(`/assets/textures/buildings/${frontFile}`)
  const backTexture = textureLoader.load(`/assets/textures/buildings/${backFile}`)
  const rightTexture = textureLoader.load(`/assets/textures/buildings/${rightFile || backFile}`)

  if (!rightFile) rightTexture.repeat.set(.5, 1)
  const leftTexture = textureLoader.load(`/assets/textures/buildings/${leftFile || frontFile}`)
  if (!leftFile) leftTexture.repeat.set(.5, 1)

  const topTexture = textureLoader.load(`/assets/textures/${topFile || 'terrain/rocks.jpg'}`)

  const materials = [
    new THREE.MeshPhongMaterial({ map: rightTexture, bumpMap: rightTexture, bumpScale }),
    new THREE.MeshPhongMaterial({ map: leftTexture, bumpMap: leftTexture, bumpScale }),
    new THREE.MeshPhongMaterial({ color, map: topFile ? topTexture : null, bumpMap: topTexture, bumpScale }),
    new THREE.MeshBasicMaterial({ color }), // bottom
    new THREE.MeshPhongMaterial({ map: frontTexture, bumpMap: frontTexture, bumpScale }),
    new THREE.MeshPhongMaterial({ map: backTexture, bumpMap: backTexture, bumpScale }),
  ]
  const mesh = new THREE.Mesh(geometry, materials)
  mesh.translateY(height / 2)
  return mesh
}

/* SPHERES */

export function createSphere({
  r = 1, segments = 32, color = null, castShadow = true, receiveShadow = true, file, bumpFile } = {}
) {
  const geometry = new THREE.SphereGeometry(r, segments, segments)
  const material = new THREE.MeshStandardMaterial({ color })
  if (file) material.map = textureLoader.load(`/assets/textures/${file}`)
  if (bumpFile) material.bumpMap = textureLoader.load(`/assets/textures/${bumpFile}`)

  const mesh = new THREE.Mesh(geometry, material)
  mesh.receiveShadow = receiveShadow
  mesh.castShadow = castShadow
  return mesh
}

export function createBall({ r = 1 } = {}) {
  const geometry = new THREE.DodecahedronGeometry(r, 1)
  const material = new THREE.MeshStandardMaterial({
    color: 0xe5f2f2,
    flatShading: true
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.receiveShadow = mesh.castShadow = true
  return mesh
}

export const createBullet = ({ color = 0x333333, r = .1, widthSegments = 6 } = {}) =>
  createSphere({ r, color, widthSegments, castShadow: true, receiveShadow: true })

/* WORLD SPHERE */

export function createWorldSphere({ r = 26, widthSegments = 40, heightSegments = 40, distort = .5 } = {}) {
  const geometry = new THREE.SphereBufferGeometry(r, widthSegments, heightSegments)

  const { position } = geometry.attributes
  const vertex = new THREE.Vector3()
  for (let i = 0, l = position.count; i < l; i ++) {
    vertex.fromBufferAttribute(position, i)
    vertex.x += randFloat(-distort, distort)
    vertex.z += randFloat(-distort, distort)
    position.setXYZ(i, vertex.x, vertex.y, vertex.z)
  }

  const material = new THREE.MeshStandardMaterial({
    color: 0xfffafa,
    flatShading: true
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.receiveShadow = mesh.castShadow = false
  mesh.rotation.z = -Math.PI / 2
  return mesh
}

/* SKY SPHERE */

export function createSkySphere({ r = 4000, color1 = 0x0077ff, color2 = 0xffffff } = {}) {
  const geometry = new THREE.SphereGeometry(r, 32, 15)
  skyMaterial.uniforms.color1.value = new THREE.Color(color1)
  skyMaterial.uniforms.color2.value = new THREE.Color(color2)
  return new THREE.Mesh(geometry, skyMaterial)
}

/* BARRELS */

export function createBarrel({ r = .4, height = 1, segments = 32, file = 'rust.jpg', topFile = 'barrel/rust-top.jpg' } = {}) {
  const geometry = new THREE.CylinderGeometry(r, r, height, segments)
  const sideMaterial = new THREE.MeshPhongMaterial({
    map: textureLoader.load(`/assets/textures/${file}`),
    bumpMap: textureLoader.load(`/assets/textures/${file}`),
    bumpScale: .02
  })
  const topMaterial = new THREE.MeshPhongMaterial({
    map: textureLoader.load(`/assets/textures/${topFile || file}`),
    bumpMap: textureLoader.load(`/assets/textures/${topFile || file}`),
    bumpScale: .02
  })
  const materials = [
    sideMaterial,
    topMaterial,
    topMaterial, // bottomMaterial
  ]
  const cylinder = new THREE.Mesh(geometry, materials)
  return cylinder
}

export function createWoodBarrel({ r = .4, R = .5, h = 1 } = {}) {
  const geometry = new THREE.CylinderGeometry(1, 1, 2, 24, 32)
  const v3 = new THREE.Vector3()
  const v2 = new THREE.Vector2()
  const pos = geometry.attributes.position
  const rDiff = R - r
  for (let i = 0; i < pos.count; i++) {
  	v3.fromBufferAttribute(pos, i)
    const y = Math.abs(v3.y)
    const rShift = Math.pow(Math.sqrt(1 - (y * y)), 2) * rDiff + r
    v2.set(v3.x, v3.z).setLength(rShift)
    v3.set(v2.x, v3.y, v2.y)
    pos.setXYZ(i, v3.x, v3.y, v3.z)
  }
  geometry.scale(1, h * 0.5, 1)

  const sideMaterial = new THREE.MeshPhongMaterial({
    map: textureLoader.load('/assets/textures/barrel/WoodBarrel-side.jpg'),
    specularMap: textureLoader.load('/assets/textures/barrel/WoodBarrel-side-s.jpg'),
  })
  const topMaterial = new THREE.MeshPhongMaterial({
    map: textureLoader.load('/assets/textures/barrel/WoodBarrel-top.jpg'),
    specularMap: textureLoader.load('/assets/textures/barrel/WoodBarrel-top-s.jpg'),
  })

  const materials = [
    sideMaterial,
    topMaterial,
    topMaterial, // bottomMaterial
  ]
  return new THREE.Mesh(geometry, materials)
}

/* FACTORIES */

export function createRandomBoxes({ n = 100, size = 5, mapSize = 50 } = {}) {
  const group = new THREE.Group()
  for (let i = 0; i < n; i++) {
    const color = randomNuance({ h: 0.1, s: 0.01, l: .75 })
    const x = randFloat(-mapSize, mapSize), y = randFloat(-5, mapSize * .5), z = randFloat(-mapSize, mapSize)
    const box = createBox({ size, color })
    box.position.set(x, y, z)
    group.add(box)
  }
  return group
}
