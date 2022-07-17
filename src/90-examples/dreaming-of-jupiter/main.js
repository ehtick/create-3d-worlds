import * as THREE from '/node_modules/three127/build/three.module.js'
import { camera, scene, renderer } from '/utils/scene.js'

const loader = new THREE.TextureLoader()

const totalStars = 1000
let count = 0,
  t = 0

camera.position.set(0, 1, 32)

const light = new THREE.PointLight('#ffffff', 1, 0)
light.position.set(0, 30, 30)
scene.add(light)

const planet = createPlanet()
scene.add(planet)

const moon = createMoon()
scene.add(moon)

const sphereBg = createBgSphere()
scene.add(sphereBg)

const terrain = createTerrain()
scene.add(terrain)

const terrainLines = createTerrainLines(terrain.geometry)
scene.add(terrainLines)

const stars = createStars()
scene.add(stars)

/* FUNCTIONS */

function createTerrainLines(geometry) {
  const positionArray = geometry.getAttribute('position').array
  geometry.setAttribute('myZ', new THREE.BufferAttribute(new Float32Array(positionArray.length / 3), 1))
  const myZArray = geometry.getAttribute('myZ').array

  for (let i = 0; i < positionArray.length; i++)
    myZArray[i] = THREE.MathUtils.randInt(0, 5)

  const lineSegments = new THREE.LineSegments(
    geometry,
    new THREE.LineBasicMaterial({
      color: '#fff',
      fog: false
    })
  )
  lineSegments.rotation.x = -0.47 * Math.PI
  lineSegments.rotation.z = THREE.Math.degToRad(90)
  return lineSegments
}

function createTerrain() {
  const texture = loader.load()
  const geometry = new THREE.PlaneBufferGeometry(70, 70, 20, 20)
  const material = new THREE.MeshBasicMaterial({
    map: texture,
  })
  const terrain = new THREE.Mesh(geometry, material)
  terrain.rotation.x = -0.47 * Math.PI
  terrain.rotation.z = THREE.Math.degToRad(90)
  return terrain
}

function createBgSphere() {
  const texture = loader.load('images/cosmos.jpg')
  const geometry = new THREE.SphereBufferGeometry(150, 32, 32)
  const material = new THREE.MeshBasicMaterial({
    side: THREE.BackSide,
    map: texture,
  })
  const sphereBg = new THREE.Mesh(geometry, material)
  sphereBg.position.set(0, 50, 0)
  return sphereBg
}

function createPlanet() {
  const texturePlanet = loader.load('images/saturn-texture.jpg')
  texturePlanet.anisotropy = 16
  const planetGeometry = new THREE.SphereBufferGeometry(10, 50, 50)
  const planetMaterial = new THREE.MeshLambertMaterial({
    map: texturePlanet,
  })
  const planet = new THREE.Mesh(planetGeometry, planetMaterial)
  planet.position.set(0, 8, -30)
  return planet
}

function createMoon() {
  const textureMoon = loader.load('images/moon-texture.jpg')
  textureMoon.anisotropy = 16
  const moonGeometry = new THREE.SphereBufferGeometry(2, 32, 32)
  const moonMaterial = new THREE.MeshPhongMaterial({
    map: textureMoon,
  })
  const moon = new THREE.Mesh(moonGeometry, moonMaterial)
  moon.position.set(0, 8, 0)
  return moon
}

function createStars() {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6 * totalStars), 3))
  geometry.setAttribute('velocity', new THREE.BufferAttribute(new Float32Array(2 * totalStars), 1))

  const positionArray = geometry.getAttribute('position').array
  const velocityArray = geometry.getAttribute('velocity').array

  for (let i = 0; i < totalStars; i++) {
    let x = THREE.MathUtils.randInt(-100, 100)
    const y = THREE.MathUtils.randInt(10, 40)
    if (x < 7 && x > -7 && y < 20) x += 14
    const z = THREE.MathUtils.randInt(0, -300)
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
      positionArray[6 * i + 2] = positionArray[6 * i + 5] = THREE.MathUtils.randInt(-200, 10)
      velocityArray[2 * i] = 0
      velocityArray[2 * i + 1] = 0
    }
  }
}

function updateTerrain(terrainGeometry) {
  const positionArray = terrainGeometry.getAttribute('position').array
  const myZArray = terrainGeometry.getAttribute('myZ').array

  for (let i = 0; i < positionArray.length; i++)
    if (i >= 210 && i <= 250) positionArray[i * 3 + 2] = 0
    else {
      positionArray[i * 3 + 2] = Math.sin((i + count * 0.0003)) * (myZArray[i] - (myZArray[i] * 0.5))
      count += 0.1
    }
}

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)

  planet.rotation.y += 0.002
  sphereBg.rotation.x += 0.002
  sphereBg.rotation.y += 0.002
  sphereBg.rotation.z += 0.002

  moon.rotation.y -= 0.007
  moon.rotation.x -= 0.007
  moon.position.x = 15 * Math.cos(t) + 0
  moon.position.z = 20 * Math.sin(t) - 35

  updateTerrain(terrain.geometry)
  terrain.geometry.attributes.position.needsUpdate = true
  updateStars(stars.geometry)
  stars.geometry.getAttribute('position').needsUpdate = true

  t += 0.015
  renderer.render(scene, camera)
}()
