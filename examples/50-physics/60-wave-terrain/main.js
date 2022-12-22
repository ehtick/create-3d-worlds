import * as THREE from 'three'
import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { dirLight } from '/utils/light.js'
import { generateSineWaveData, createTerrainFromData } from '/utils/ground.js'
import { createTerrainBodyFromData } from '/utils/physics.js'
import PhysicsWorld from '/utils/classes/PhysicsWorld.js'

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

function generateObject() {
  const randNum = Math.ceil(Math.random() * 3)
  const objectSize = 3

  const rand1 = 1 + Math.random() * objectSize
  const rand2 = 1 + Math.random() * objectSize
  const rand3 = 1 + Math.random() * objectSize

  const color = Math.floor(Math.random() * (1 << 24))
  const material = new THREE.MeshPhongMaterial({ color })

  let mesh = null
  switch (randNum) {
    case 1:
      mesh = new THREE.Mesh(new THREE.SphereGeometry(rand1, 20, 20), material)
      break
    case 2:
      mesh = new THREE.Mesh(new THREE.BoxGeometry(rand1, rand2, rand3, 1, 1, 1), material)
      break
    case 3:
      mesh = new THREE.Mesh(new THREE.CylinderGeometry(rand1, rand1, rand2, 20, 1), material)
      break
  }

  mesh.position.set((Math.random() - 0.5) * width * 0.6, maxHeight + objectSize + 2, (Math.random() - 0.5) * depth * 0.6)
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