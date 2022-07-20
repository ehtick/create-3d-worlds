/* global Ammo */
import * as THREE from '/node_modules/three127/build/three.module.js'
import {camera, scene, renderer, clock} from '/utils/scene.js'
import {initLights} from '/utils/light.js'

initLights()

Ammo().then(AmmoLib => {
  Ammo = AmmoLib
  init()
  animate()
})

const terrainWidthExtents = 100
const terrainDepthExtents = 100
const terrainWidth = 128
const terrainDepth = 128
const terrainMaxHeight = 8
const terrainMinHeight = - 2

let terrainMesh
let collisionConfiguration
let dispatcher
let broadphase
let solver
let physicsWorld

let heightData = null
let ammoHeightData = null

function init() {
  heightData = generateHeight(terrainWidth, terrainDepth, terrainMinHeight, terrainMaxHeight)
  initGraphics()
  initPhysics()
}

function initGraphics() {
  scene.background = new THREE.Color(0xbfd1e5)

  camera.position.y = 35
  camera.position.z = 50
  camera.lookAt(0, 0, 0)

  const geometry = new THREE.PlaneGeometry(terrainWidthExtents, terrainDepthExtents, terrainWidth - 1, terrainDepth - 1)
  geometry.rotateX(- Math.PI / 2)

  const vertices = geometry.attributes.position.array

  for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3)
    vertices[j + 1] = heightData[i]

  geometry.computeVertexNormals()

  const groundMaterial = new THREE.MeshPhongMaterial({ color: 0xC7C7C7 })
  terrainMesh = new THREE.Mesh(geometry, groundMaterial)
  terrainMesh.receiveShadow = true
  terrainMesh.castShadow = true

  scene.add(terrainMesh)
}

function initPhysics() {
  collisionConfiguration = new Ammo.btDefaultCollisionConfiguration()
  dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration)
  broadphase = new Ammo.btDbvtBroadphase()
  solver = new Ammo.btSequentialImpulseConstraintSolver()
  physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration)
  physicsWorld.setGravity(new Ammo.btVector3(0, - 6, 0))

  const groundShape = createTerrainShape()
  const groundTransform = new Ammo.btTransform()
  groundTransform.setIdentity()
  groundTransform.setOrigin(new Ammo.btVector3(0, (terrainMaxHeight + terrainMinHeight) / 2, 0))
  const groundMass = 0
  const groundLocalInertia = new Ammo.btVector3(0, 0, 0)
  const groundMotionState = new Ammo.btDefaultMotionState(groundTransform)
  const groundBody = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(groundMass, groundMotionState, groundShape, groundLocalInertia))
  physicsWorld.addRigidBody(groundBody)
}

function generateHeight(width, depth, minHeight, maxHeight) {
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
  const upAxis = 1
  const hdt = 'PHY_FLOAT'
  const flipQuadEdges = false
  ammoHeightData = Ammo._malloc(4 * terrainWidth * terrainDepth)
  let p = 0
  let p2 = 0

  for (let j = 0; j < terrainDepth; j++)
    for (let i = 0; i < terrainWidth; i++) {
      Ammo.HEAPF32[ammoHeightData + p2 >> 2] = heightData[p]
      p++
      p2 += 4
    }

  const heightFieldShape = new Ammo.btHeightfieldTerrainShape(
    terrainWidth,
    terrainDepth,
    ammoHeightData,
    heightScale,
    terrainMinHeight,
    terrainMaxHeight,
    upAxis,
    hdt,
    flipQuadEdges
  )

  const scaleX = terrainWidthExtents / (terrainWidth - 1)
  const scaleZ = terrainDepthExtents / (terrainDepth - 1)
  heightFieldShape.setLocalScaling(new Ammo.btVector3(scaleX, 1, scaleZ))
  heightFieldShape.setMargin(0.05)
  return heightFieldShape
}

function animate() {
  requestAnimationFrame(animate)
  const deltaTime = clock.getDelta()
  physicsWorld.stepSimulation(deltaTime, 10)
  renderer.render(scene, camera)
}
