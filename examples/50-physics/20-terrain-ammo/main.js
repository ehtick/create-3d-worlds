/* global Ammo */
import * as THREE from 'three'
import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'

createOrbitControls()

// Heightfield parameters
const mapWidth = 100
const mapDepth = 100
const width = 128
const depth = 128
const maxHeight = 8
const minHeight = - 2

// Physics variables
let physicsWorld
const dynamicObjects = []
let transformAux1

let time = 0
const objectTimePeriod = 3
let timeNextSpawn = time + objectTimePeriod
const maxNumObjects = 30

const AMMO = await Ammo()

const data = generateHeight(width, depth, minHeight, maxHeight)
initGraphics()
initPhysics()

function initGraphics() {
  const index = width * .5 + depth * .5 * width
  camera.position.y = data[index] * (maxHeight - minHeight) + 5
  camera.position.z = mapDepth / 2

  const geometry = new THREE.PlaneGeometry(mapWidth, mapDepth, width - 1, depth - 1)
  geometry.rotateX(- Math.PI / 2)

  const vertices = geometry.attributes.position.array
  for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3)
    vertices[j + 1] = data[i] // j + 1 is y component

  geometry.computeVertexNormals()

  const groundMaterial = new THREE.MeshPhongMaterial({ color: 0xC7C7C7 })
  const terrain = new THREE.Mesh(geometry, groundMaterial)
  terrain.receiveShadow = true
  terrain.castShadow = true

  scene.add(terrain)

  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(100, 100, 50)
  light.castShadow = true

  scene.add(light)
}

function initPhysics() {
  // Physics configuration
  const collisionConfiguration = new AMMO.btDefaultCollisionConfiguration()
  const dispatcher = new AMMO.btCollisionDispatcher(collisionConfiguration)
  const broadphase = new AMMO.btDbvtBroadphase()
  const solver = new AMMO.btSequentialImpulseConstraintSolver()
  physicsWorld = new AMMO.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration)
  physicsWorld.setGravity(new AMMO.btVector3(0, - 6, 0))

  // Create the terrain body
  const groundShape = createTerrainShape()
  const groundTransform = new AMMO.btTransform()
  groundTransform.setIdentity()
  // Shifts the terrain, since bullet re-centers it on its bounding box.
  groundTransform.setOrigin(new AMMO.btVector3(0, (maxHeight + minHeight) / 2, 0))
  const groundMass = 0
  const groundLocalInertia = new AMMO.btVector3(0, 0, 0)
  const groundMotionState = new AMMO.btDefaultMotionState(groundTransform)
  const groundBody = new AMMO.btRigidBody(new AMMO.btRigidBodyConstructionInfo(groundMass, groundMotionState, groundShape, groundLocalInertia))
  physicsWorld.addRigidBody(groundBody)

  transformAux1 = new AMMO.btTransform()
}

function generateHeight(width, depth, minHeight, maxHeight) {
  // Generates the height data (a sinus wave)
  const size = width * depth
  const data = new Float32Array(size)

  const hRange = maxHeight - minHeight
  const w2 = width / 2
  const d2 = depth / 2
  const phaseMult = 12

  let p = 0

  for (let j = 0; j < depth; j++)
    for (let i = 0; i < width; i++) {
      const radius = Math.sqrt(
        Math.pow((i - w2) / w2, 2.0) +
        Math.pow((j - d2) / d2, 2.0))

      const height = (Math.sin(radius * phaseMult) + 1) * 0.5 * hRange + minHeight
      data[p] = height
      p++
    }

  return data
}

function createTerrainShape() {
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

  mesh.userData.physicsBody = body
  mesh.receiveShadow = mesh.castShadow = true

  scene.add(mesh)
  dynamicObjects.push(mesh)

  physicsWorld.addRigidBody(body)
}

function createObjectMaterial() {
  const c = Math.floor(Math.random() * (1 << 24))
  return new THREE.MeshPhongMaterial({ color: c })
}

function updatePhysics(deltaTime) {
  physicsWorld.stepSimulation(deltaTime, 10)
  for (let i = 0, il = dynamicObjects.length; i < il; i++) {
    const objThree = dynamicObjects[i]
    const objPhys = objThree.userData.physicsBody
    const ms = objPhys.getMotionState()
    if (ms) {
      ms.getWorldTransform(transformAux1)
      const p = transformAux1.getOrigin()
      const q = transformAux1.getRotation()
      objThree.position.set(p.x(), p.y(), p.z())
      objThree.quaternion.set(q.x(), q.y(), q.z(), q.w())
    }
  }
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const deltaTime = clock.getDelta()

  if (dynamicObjects.length < maxNumObjects && time > timeNextSpawn) {
    generateObject()
    timeNextSpawn = time + objectTimePeriod
  }

  updatePhysics(deltaTime)
  renderer.render(scene, camera)
  time += deltaTime
}()
