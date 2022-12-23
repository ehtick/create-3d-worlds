import * as THREE from 'three'
import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { dirLight } from '/utils/light.js'
import { generateSineWaveData, createTerrainFromData } from '/utils/ground.js'
import { createTerrainBodyFromData } from '/utils/physics.js'
import PhysicsWorld from '/utils/classes/PhysicsWorld.js'
import { randomColor } from '/utils/helpers.js'

const { randFloatSpread } = THREE.MathUtils

const world = new PhysicsWorld()

createOrbitControls()
camera.position.set(0, 50, 50)
scene.add(dirLight({ position: [100, 100, 50] }))

const mapWidth = 100
const mapDepth = 100
const width = 128
const depth = 128
const maxHeight = 8
const minHeight = - 2

const data = generateSineWaveData(width, depth, minHeight, maxHeight)

const terrain = createTerrainFromData({ data, width: mapWidth, height: mapDepth, widthSegments: width - 1, heightSegments: depth - 1 })
terrain.userData.body = createTerrainBodyFromData({ data, width, depth, mapWidth, mapDepth, minHeight, maxHeight })
world.add(terrain, 0)

/* FUNCTIONS */

const getGeometry = (num, size) => {
  switch (num) {
    case 1: return new THREE.SphereGeometry(size.x, 20, 20)
    case 2: return new THREE.BoxGeometry(size.x, size.y, size.z, 1, 1, 1)
    case 3: return new THREE.CylinderGeometry(size.x, size.x, size.y, 20, 1)
  }
}

function generateObject() {
  const total = 3
  const randNum = Math.ceil(Math.random() * total)
  const size = new THREE.Vector3(1 + Math.random() * total, 1 + Math.random() * total, 1 + Math.random() * total)

  const geometry = getGeometry(randNum, size)
  const material = new THREE.MeshPhongMaterial({ color: randomColor() })
  const mesh = new THREE.Mesh(geometry, material)

  mesh.position.set(randFloatSpread(mapWidth), maxHeight * 1.2, randFloatSpread(mapDepth))
  world.add(mesh)
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const dt = clock.getDelta()
  world.update(dt)
  renderer.render(scene, camera)
}()

/* EVENTS */

document.addEventListener('click', generateObject)