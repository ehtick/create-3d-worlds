import * as THREE from 'three'
import { camera, scene, renderer } from '/utils/scene.js'
import { createMoon, createSaturn } from '/utils/planets.js'

const { randInt, randFloat } = THREE.Math
const loader = new THREE.TextureLoader()

scene.background = new THREE.Color(0x000000)

const totalStars = 1000
let t = 0

camera.position.set(0, 1, 32)

const light = new THREE.PointLight('#ffffff', 1, 0)
light.position.set(0, 30, 30)
scene.add(light)

const planet = createSaturn()
planet.position.set(0, 8, -30)
scene.add(planet)

const moon = createMoon()
moon.position.set(0, 8, 0)
scene.add(moon)

const sphereBg = createBgSphere()
scene.add(sphereBg)

const terrain = createTerrain()
scene.add(terrain)

const stars = createStars()
scene.add(stars)

/* FUNCTIONS */

function setInitialHeight(geometry) {
  const { position } = geometry.attributes
  const initialHeight = []
  const vertex = new THREE.Vector3()
  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i)
    initialHeight.push(vertex.z)
  }
  geometry.setAttribute('initialHeight', new THREE.Float32BufferAttribute(initialHeight, 1))
}

function randomDeform(geometry, factor = 5) {
  const { position } = geometry.attributes
  const vertex = new THREE.Vector3()

  for (let i = 0, l = position.count; i < l; i++) {
    vertex.fromBufferAttribute(position, i)
    position.setZ(i, randFloat(0, factor))
  }
}

function createTerrain() {
  const geometry = new THREE.PlaneBufferGeometry(70, 70, 20, 20)
  randomDeform(geometry, 5)

  const material = new THREE.MeshBasicMaterial({ wireframe: true })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotation.x = -0.47 * Math.PI
  mesh.rotation.z = 0.5 * Math.PI
  return mesh
}

function earthShake(geometry) {
  if (!geometry.attributes.initialHeight) setInitialHeight(geometry)

  const { position, initialHeight } = geometry.attributes
  const vertex = new THREE.Vector3()
  for (let i = 0, l = position.count; i < l; i++) {
    vertex.fromBufferAttribute(position, i)
    vertex.z = (i >= 210 && i <= 250)
      ? 0 // coridor
      : Math.sin((i + t)) * (initialHeight.array[i] - (initialHeight.array[i] * 0.5))
    position.setXYZ(i, vertex.x, vertex.y, vertex.z)
  }
  position.needsUpdate = true
}

function createBgSphere() {
  const texture = loader.load('images/cosmos.jpg')
  const geometry = new THREE.SphereGeometry(150, 32, 32)
  const material = new THREE.MeshBasicMaterial({
    side: THREE.BackSide,
    map: texture,
  })
  const sphereBg = new THREE.Mesh(geometry, material)
  sphereBg.position.set(0, 50, 0)
  return sphereBg
}

function createStars() {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6 * totalStars), 3))
  geometry.setAttribute('velocity', new THREE.BufferAttribute(new Float32Array(2 * totalStars), 1))

  const positionArray = geometry.getAttribute('position').array
  const velocityArray = geometry.getAttribute('velocity').array

  for (let i = 0; i < totalStars; i++) {
    let x = randInt(-100, 100)
    const y = randInt(10, 40)
    if (x < 7 && x > -7 && y < 20) x += 14
    const z = randInt(0, -300)
    positionArray[6 * i + 0] = positionArray[6 * i + 3] = x
    positionArray[6 * i + 1] = positionArray[6 * i + 4] = y
    positionArray[6 * i + 2] = positionArray[6 * i + 5] = z
    velocityArray[2 * i] = velocityArray[2 * i + 1] = 0
  }
  const material = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.5,
    fog: false
  })
  const stars = new THREE.LineSegments(geometry, material)
  geometry.getAttribute('position').setUsage(THREE.DynamicDrawUsage)
  return stars
}

function updateStars(geometry) {
  const velocityArray = geometry.getAttribute('velocity').array
  const positionArray = geometry.getAttribute('position').array
  for (let i = 0; i < totalStars; i++) {
    velocityArray[2 * i] += 0.0049
    velocityArray[2 * i + 1] += 0.005
    positionArray[6 * i + 2] += velocityArray[2 * i]
    positionArray[6 * i + 5] += velocityArray[2 * i + 1]

    if (positionArray[6 * i + 2] > 50) {
      positionArray[6 * i + 2] = positionArray[6 * i + 5] = randInt(-200, 10)
      velocityArray[2 * i] = 0
      velocityArray[2 * i + 1] = 0
    }
  }
  geometry.getAttribute('position').needsUpdate = true
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)

  planet.rotation.y += 0.002

  moon.rotation.y -= 0.007
  moon.rotation.x -= 0.007
  moon.position.x = 15 * Math.cos(t) + 0
  moon.position.z = 20 * Math.sin(t) - 35

  earthShake(terrain.geometry)
  updateStars(stars.geometry)

  t += 0.015
  renderer.render(scene, camera)
}()
