import * as THREE from 'three'
import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { dirLight } from '/utils/light.js'
import { generateSineWaveData, createTerrainFromData } from '/utils/ground.js'
import { Ammo, createTerrainBodyFromData } from '/utils/physics.js'
import PhysicsWorld from '/utils/classes/PhysicsWorld.js'

const world = new PhysicsWorld()

createOrbitControls()
camera.position.set(0, 50, 50)
scene.add(dirLight({ position: [100, 100, 50] }))

// heightfield parameters
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
  const numTypes = 3
  const objectType = Math.ceil(Math.random() * numTypes)

  let mesh = null
  let shape = null

  const objectSize = 3
  const margin = 0.05

  const rand1 = 1 + Math.random() * objectSize
  const rand2 = 1 + Math.random() * objectSize
  const rand3 = 1 + Math.random() * objectSize

  const color = Math.floor(Math.random() * (1 << 24))
  const material = new THREE.MeshPhongMaterial({ color })

  switch (objectType) {
    case 1:
      mesh = new THREE.Mesh(new THREE.SphereGeometry(rand1, 20, 20), material)
      shape = new Ammo.btSphereShape(rand1)
      shape.setMargin(margin)
      break
    case 2:
      mesh = new THREE.Mesh(new THREE.BoxGeometry(rand1, rand2, rand3, 1, 1, 1), material)
      shape = new Ammo.btBoxShape(new Ammo.btVector3(rand1 * 0.5, rand2 * 0.5, rand3 * 0.5))
      shape.setMargin(margin)
      break
    case 3:
      mesh = new THREE.Mesh(new THREE.CylinderGeometry(rand1, rand1, rand2, 20, 1), material)
      shape = new Ammo.btCylinderShape(new Ammo.btVector3(rand1, rand2 * 0.5, rand1))
      shape.setMargin(margin)
      break
  }

  mesh.position.set((Math.random() - 0.5) * width * 0.6, maxHeight + objectSize + 2, (Math.random() - 0.5) * depth * 0.6)

  const mass = objectSize * 5
  const inertia = new Ammo.btVector3(0, 0, 0)
  shape.calculateLocalInertia(mass, inertia)
  const transform = new Ammo.btTransform()
  transform.setOrigin(new Ammo.btVector3(...mesh.position))
  const motionState = new Ammo.btDefaultMotionState(transform)
  const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, inertia)
  const body = new Ammo.btRigidBody(rbInfo)

  mesh.userData.body = body
  mesh.receiveShadow = mesh.castShadow = true

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