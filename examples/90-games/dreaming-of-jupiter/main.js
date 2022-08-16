import * as THREE from 'three'
import { camera, scene, renderer } from '/utils/scene.js'
import { createMoon, createSaturn } from '/utils/planets.js'
import { createTerrain, wave, shake } from '/utils/ground.js'

const { randInt } = THREE.Math

scene.background = new THREE.Color(0x000000)
camera.position.set(0, 9, 32)

const totalStars = 1000
let t = 0

const light = new THREE.PointLight('#ffffff', 1, 0)
light.position.set(0, 30, 30)
scene.add(light)

const planet = createSaturn()
planet.position.set(0, 8, -30)
scene.add(planet)

const moon = createMoon()
moon.position.set(0, 8, 0)
scene.add(moon)

const terrain = createTerrain()
terrain.material.wireframe = true
scene.add(terrain)

const stars = createStars()
scene.add(stars)

/* FUNCTIONS */

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

function orbit(moon, t) {
  moon.rotation.y -= 0.007

  moon.position.x = 15 * Math.cos(t)
  moon.position.z = 20 * Math.sin(t) - 35
}

const updateTerrain = Math.random() > .5 ? shake : wave

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)

  planet.rotation.y += 0.002
  orbit(moon, t)
  updateTerrain(terrain.geometry, t)
  updateStars(stars.geometry)

  t += 0.015
  renderer.render(scene, camera)
}()
