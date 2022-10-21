import * as THREE from 'three'
import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { dirLight } from '/utils/light.js'
import { generateSineWaveData, createTerrainFromData } from '/utils/ground.js'
import { AMMO, createPhysicsWorld, createTerrainBodyFromData } from '/utils/physics.js'

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

const rigidBodies = []
const physicsWorld = createPhysicsWorld({ gravity: 6 })

const data = generateSineWaveData(width, depth, minHeight, maxHeight)

const terrain = createTerrainFromData({ data, width: mapWidth, height: mapDepth, widthSegments: width - 1, heightSegments: depth - 1 })
scene.add(terrain)

const groundBody = createTerrainBodyFromData({ data, width, depth, mapWidth, mapDepth, minHeight, maxHeight })
physicsWorld.addRigidBody(groundBody)

/* FUNCTIONS */

function generateObject() {
  const numTypes = 4
  const objectType = Math.ceil(Math.random() * numTypes)

  let mesh = null
  let shape = null

  const objectSize = 3
  const margin = 0.05

  const rand1 = 1 + Math.random() * objectSize
  const rand2 = 1 + Math.random() * objectSize
  const rand3 = 1 + Math.random() * objectSize

  switch (objectType) {
    case 1:
      // Sphere
      mesh = new THREE.Mesh(new THREE.SphereGeometry(rand1, 20, 20), createObjectMaterial())
      shape = new AMMO.btSphereShape(rand1)
      shape.setMargin(margin)
      break
    case 2:
      // Box
      mesh = new THREE.Mesh(new THREE.BoxGeometry(rand1, rand2, rand3, 1, 1, 1), createObjectMaterial())
      shape = new AMMO.btBoxShape(new AMMO.btVector3(rand1 * 0.5, rand2 * 0.5, rand3 * 0.5))
      shape.setMargin(margin)
      break
    case 3:
      // Cylinder
      mesh = new THREE.Mesh(new THREE.CylinderGeometry(rand1, rand1, rand2, 20, 1), createObjectMaterial())
      shape = new AMMO.btCylinderShape(new AMMO.btVector3(rand1, rand2 * 0.5, rand1))
      shape.setMargin(margin)
      break
    default:
      // Cone
      mesh = new THREE.Mesh(new THREE.ConeGeometry(rand1, rand2, 20, 2), createObjectMaterial())
      shape = new AMMO.btConeShape(rand1, rand2)
      break
  }

  mesh.position.set((Math.random() - 0.5) * width * 0.6, maxHeight + objectSize + 2, (Math.random() - 0.5) * depth * 0.6)

  const mass = objectSize * 5
  const localInertia = new AMMO.btVector3(0, 0, 0)
  shape.calculateLocalInertia(mass, localInertia)
  const transform = new AMMO.btTransform()
  transform.setIdentity()
  const pos = mesh.position
  transform.setOrigin(new AMMO.btVector3(pos.x, pos.y, pos.z))
  const motionState = new AMMO.btDefaultMotionState(transform)
  const rbInfo = new AMMO.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia)
  const body = new AMMO.btRigidBody(rbInfo)

  mesh.userData.body = body
  mesh.receiveShadow = mesh.castShadow = true

  scene.add(mesh)
  rigidBodies.push(mesh)

  physicsWorld.addRigidBody(body)
}

function createObjectMaterial() {
  const c = Math.floor(Math.random() * (1 << 24))
  return new THREE.MeshPhongMaterial({ color: c })
}

function updatePhysics(dt) {
  physicsWorld.stepSimulation(dt, 10)
  for (let i = 0, il = rigidBodies.length; i < il; i++) {
    const mesh = rigidBodies[i]
    const ms = mesh.userData.body.getMotionState()
    if (ms) {
      const transform = new AMMO.btTransform()
      ms.getWorldTransform(transform)
      const p = transform.getOrigin()
      const q = transform.getRotation()
      mesh.position.set(p.x(), p.y(), p.z())
      mesh.quaternion.set(q.x(), q.y(), q.z(), q.w())
    }
  }
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const dt = clock.getDelta()
  updatePhysics(dt)
  renderer.render(scene, camera)
}()

/* EVENTS */

document.addEventListener('click', generateObject)