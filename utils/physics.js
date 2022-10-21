/* global Ammo */
import * as THREE from 'three'
export const AMMO = await Ammo()

const margin = 0.05

function randomColor() {
  return Math.floor(Math.random() * (1 << 24))
}

/* WORLD */

export function createPhysicsWorld({ gravity = 9.82, softBody = false } = {}) {
  const collisionConfiguration = new AMMO.btSoftBodyRigidBodyCollisionConfiguration()
  const dispatcher = new AMMO.btCollisionDispatcher(collisionConfiguration)
  const broadphase = new AMMO.btDbvtBroadphase()
  const solver = new AMMO.btSequentialImpulseConstraintSolver()
  const softBodySolver = softBody && new AMMO.btDefaultSoftBodySolver()
  const physicsWorld = new AMMO.btSoftRigidDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration, softBodySolver)
  physicsWorld.setGravity(new AMMO.btVector3(0, -gravity, 0))
  return physicsWorld
}

/* BODIES */

export function createRigidBody({
  mesh, shape, mass, pos, quat = { x: 0, y: 0, z: 0, w: 1 }, friction, vel, angVel
}) {
  mesh.position.copy(pos)
  mesh.quaternion.copy(quat)

  const transform = new AMMO.btTransform()
  transform.setOrigin(new AMMO.btVector3(pos.x, pos.y, pos.z))
  transform.setRotation(new AMMO.btQuaternion(quat.x, quat.y, quat.z, quat.w))
  const motionState = new AMMO.btDefaultMotionState(transform)

  const inertia = new AMMO.btVector3(0, 0, 0)
  shape.calculateLocalInertia(mass, inertia)

  const rbInfo = new AMMO.btRigidBodyConstructionInfo(mass, motionState, shape, inertia)
  const body = new AMMO.btRigidBody(rbInfo)
  if (friction) body.setFriction(friction)
  mesh.userData.body = body

  if (mass > 0) body.setActivationState(4) // Disable deactivation

  return { mesh, body, mass }
}

export function createBall(radius = 0.6, mass = 1.2, pos, quat) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 20, 20), new THREE.MeshPhongMaterial({ color: 0x202020 }))
  mesh.castShadow = mesh.receiveShadow = true
  const shape = new AMMO.btSphereShape(radius)
  shape.setMargin(margin)
  const res = createRigidBody({ mesh, shape, mass, pos, quat })
  res.body.setFriction(0.5)
  return res
}

export function createBox({ width, height, depth, mass = 0, pos, quat, color = randomColor(), friction }) {
  const geometry = new THREE.BoxGeometry(width, height, depth, 1, 1, 1)
  const mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color }))
  mesh.castShadow = mesh.receiveShadow = true

  const shape = new AMMO.btBoxShape(new AMMO.btVector3(width * 0.5, height * 0.5, depth * 0.5))
  shape.setMargin(margin)
  return createRigidBody({ mesh, shape, mass, pos, quat, friction })
}

export function createBrick(length, height, width, pos, halfBrick) {
  const defaultMass = 0.5
  const depth = halfBrick ? length * .5 : length
  const mass = halfBrick ? defaultMass * .5 : defaultMass
  return createBox({ width, height, depth, mass, pos })
}

export function createWall() {
  const pos = new THREE.Vector3()
  const bricks = []

  const brickLength = 1.2
  const brickHeight = brickLength * 0.5
  const numBricksLength = 6
  const numBricksHeight = 8
  const z = -numBricksLength * brickLength * 0.5
  pos.set(0, brickHeight * 0.5, z)

  for (let j = 0; j < numBricksHeight; j ++) {
    const oddRow = (j % 2) == 1
    const nRow = oddRow ? numBricksLength + 1 : numBricksLength

    pos.z = oddRow ? z - brickLength * .25 : z

    for (let i = 0; i < nRow; i ++) {
      const firstOrLast = oddRow && (i == 0 || i == nRow - 1)
      const brick = createBrick(brickLength, brickHeight, 0.6, pos, firstOrLast)
      bricks.push(brick)

      pos.z = oddRow && (i == 0 || i == nRow - 2)
        ? pos.z + brickLength * .75
        : pos.z + brickLength
    }

    pos.y += brickHeight
  }
  return bricks
}

/* TERRAIN */

export function createTerrainShape({ data, width, depth, mapWidth, mapDepth, minHeight, maxHeight }) {
  const heightScale = 1
  const upAxis = 1 // 0: X, 1: Y, 2: Z. normally Y is used.
  const hdt = 'PHY_FLOAT' // height data type
  const flipQuadEdges = false // inverts the triangles
  const ammoHeightData = AMMO._malloc(4 * width * depth) // Creates height data buffer in AMMO heap
  // Copy the javascript height data array to the AMMO one
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

  const terrainShape = new AMMO.btHeightfieldTerrainShape(
    width, depth, ammoHeightData, heightScale, minHeight, maxHeight, upAxis, hdt, flipQuadEdges
  )

  const scaleX = mapWidth / (width - 1)
  const scaleZ = mapDepth / (depth - 1)
  terrainShape.setLocalScaling(new AMMO.btVector3(scaleX, 1, scaleZ))
  terrainShape.setMargin(0.05)

  return terrainShape
}