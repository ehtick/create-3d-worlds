import * as THREE from 'three'
import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { AMMO, createPhysicsWorld } from '/utils/physics.js'
import { dirLight } from '/utils/light.js'
import { generateSineWaveData, createTerrainFromData } from '/utils/ground.js'

createOrbitControls()
camera.position.set(0, 50, 50)

// Heightfield parameters
const mapWidth = 100
const mapDepth = 100
const width = 128
const depth = 128
const maxHeight = 8
const minHeight = - 2

const rigidBodies = []
let transform

const data = generateSineWaveData(width, depth, minHeight, maxHeight)
const terrain = createTerrainFromData({ data, mapWidth, mapDepth, width, depth })
scene.add(terrain)

scene.add(dirLight({ position: [100, 100, 50] }))

const physicsWorld = createPhysicsWorld({ gravity: 6 })

initPhysics()

/* FUNCTIONS */

function initPhysics() {
  // Create the terrain body
  const groundShape = createTerrainShape(data)
  const groundTransform = new AMMO.btTransform()
  groundTransform.setIdentity()
  // Shifts the terrain, since bullet re-centers it on its bounding box.
  groundTransform.setOrigin(new AMMO.btVector3(0, (maxHeight + minHeight) / 2, 0))
  const groundMass = 0
  const groundLocalInertia = new AMMO.btVector3(0, 0, 0)
  const groundMotionState = new AMMO.btDefaultMotionState(groundTransform)
  const groundBody = new AMMO.btRigidBody(new AMMO.btRigidBodyConstructionInfo(groundMass, groundMotionState, groundShape, groundLocalInertia))
  physicsWorld.addRigidBody(groundBody)

  transform = new AMMO.btTransform()
}

function createTerrainShape(data) {
  const heightScale = 1
  // Up axis = 0 for X, 1 for Y, 2 for Z. Normally 1 = Y is used.
  const upAxis = 1
  // hdt, height data type. "PHY_FLOAT" is used. Possible values are "PHY_FLOAT", "PHY_UCHAR", "PHY_SHORT"
  const hdt = 'PHY_FLOAT'
  // inverts the triangles
  const flipQuadEdges = false
  // Creates height data buffer in AMMO heap
  const ammoHeightData = AMMO._malloc(4 * width * depth)
  // Copy the javascript height data array to the AMMO one.
  let p = 0
  let p2 = 0

  for (let j = 0; j < depth; j++)
    for (let i = 0; i < width; i++) {
      // write 32-bit float data to memory
      AMMO.HEAPF32[ammoHeightData + p2 >> 2] = data[p]
      p++
      // 4 bytes/float
      p2 += 4
    }

  // Creates the heightfield physics shape
  const heightFieldShape = new AMMO.btHeightfieldTerrainShape(
    width,
    depth,
    ammoHeightData,
    heightScale,
    minHeight,
    maxHeight,
    upAxis,
    hdt,
    flipQuadEdges
  )

  // Set horizontal scale
  const scaleX = mapWidth / (width - 1)
  const scaleZ = mapDepth / (depth - 1)
  heightFieldShape.setLocalScaling(new AMMO.btVector3(scaleX, 1, scaleZ))
  heightFieldShape.setMargin(0.05)

  return heightFieldShape
}

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
    const objThree = rigidBodies[i]
    const objPhys = objThree.userData.body
    const ms = objPhys.getMotionState()
    if (ms) {
      ms.getWorldTransform(transform)
      const p = transform.getOrigin()
      const q = transform.getRotation()
      objThree.position.set(p.x(), p.y(), p.z())
      objThree.quaternion.set(q.x(), q.y(), q.z(), q.w())
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