/* global Ammo */
import * as THREE from 'three'
import { randomGray } from '/utils/helpers.js'

export const AMMO = await Ammo()

const margin = 0.05

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
  if (vel)
    body.setLinearVelocity(new AMMO.btVector3(vel.x, vel.y, vel.z))
  if (angVel)
    body.setAngularVelocity(new AMMO.btVector3(angVel.x, angVel.y, angVel.z))
  mesh.userData.body = body

  if (mass > 0) body.setActivationState(4) // Disable deactivation

  return mesh
}

export function createBall({ radius = 0.6, mass = 1.2, pos, quat }) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 20, 20), new THREE.MeshPhongMaterial({ color: 0x202020 }))
  mesh.castShadow = mesh.receiveShadow = true
  const shape = new AMMO.btSphereShape(radius)
  shape.setMargin(margin)
  const rigidMesh = createRigidBody({ mesh, shape, mass, pos, quat })
  rigidMesh.userData.body.setFriction(0.5)
  return rigidMesh
}

export function createBox({ width, height, depth, mass = 0, pos, quat, color = randomGray(), friction }) {
  const geometry = new THREE.BoxGeometry(width, height, depth, 1, 1, 1)
  const mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color }))
  mesh.castShadow = mesh.receiveShadow = true

  const shape = new AMMO.btBoxShape(new AMMO.btVector3(width * 0.5, height * 0.5, depth * 0.5))
  shape.setMargin(margin)
  return createRigidBody({ mesh, shape, mass, pos, quat, friction })
}

export const createGround = ({ size = 100, color = 0xFFFFFF } = {}) =>
  createBox({ width: size, height: 1, depth: size, mass: 0, pos: new THREE.Vector3(0, -0.5, 0), color })

/* STRUCTURES */

export function createCrates(size = .75, nw = 8, nh = 6) {
  const crates = []
  for (let j = 0; j < nw; j++)
    for (let i = 0; i < nh; i++) {
      const crate = createBox({
        pos: new THREE.Vector3(size * j - (size * (nw - 1)) / 2, size * i, 10),
        width: size, height: size, depth: size, mass: 10, color: 0xfca400, friction: 1
      })
      crates.push(crate)
    }
  return crates
}

export function createWall({ brickWidth = 0.6, brickDepth = 1, rows = 8, columns = 6, brickMass = 2, friction, startX = 0 } = {}) {
  const bricks = []
  const brickHeight = brickDepth * 0.5
  const z = -columns * brickDepth * 0.5
  const pos = new THREE.Vector3()
  pos.set(startX, brickHeight * 0.5, z)

  for (let j = 0; j < rows; j ++) {
    const oddRow = (j % 2) == 1
    const nRow = oddRow ? columns + 1 : columns

    pos.z = oddRow ? z - brickDepth * .25 : z

    for (let i = 0; i < nRow; i ++) {
      const firstOrLast = oddRow && (i == 0 || i == nRow - 1)
      const depth = firstOrLast ? brickDepth * .5 : brickDepth
      const mass = firstOrLast ? brickMass * .5 : brickMass
      const brick = createBox({ width: brickWidth, height: brickHeight, depth, mass, pos, friction })

      bricks.push(brick)

      pos.z = oddRow && (i == 0 || i == nRow - 2)
        ? pos.z + brickDepth * .75
        : pos.z + brickDepth
    }

    pos.y += brickHeight
  }
  return bricks
}

export function createSideWall({ brickWidth = 0.6, brickDepth = 1, rows = 8, columns = 6, brickMass = 2, friction, startZ = 0 } = {}) {
  const bricks = []
  const brickHeight = brickDepth * 0.5
  const x = -columns * brickDepth * 0.5
  const pos = new THREE.Vector3()
  pos.set(x, brickHeight * 0.5, startZ)

  for (let j = 0; j < rows; j ++) {
    const oddRow = (j % 2) == 1
    const nRow = oddRow ? columns + 1 : columns

    pos.x = oddRow ? x - brickDepth * .25 : x

    for (let i = 0; i < nRow; i ++) {
      const firstOrLast = oddRow && (i == 0 || i == nRow - 1)
      const depth = firstOrLast ? brickDepth * .5 : brickDepth
      const mass = firstOrLast ? brickMass * .5 : brickMass
      const brick = createBox({ width: depth, height: brickHeight, depth: brickWidth, mass, pos, friction })

      bricks.push(brick)

      pos.x = oddRow && (i == 0 || i == nRow - 2)
        ? pos.x + brickDepth * .75
        : pos.x + brickDepth
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

export function createTerrainBody(shape, minHeight, maxHeight) {
  const transform = new AMMO.btTransform()
  transform.setIdentity()
  // Shifts the terrain, since bullet re-centers it on its bounding box.
  transform.setOrigin(new AMMO.btVector3(0, (maxHeight + minHeight) / 2, 0))
  const groundMass = 0
  const inertia = new AMMO.btVector3(0, 0, 0)
  const motionState = new AMMO.btDefaultMotionState(transform)
  const body = new AMMO.btRigidBody(new AMMO.btRigidBodyConstructionInfo(groundMass, motionState, shape, inertia))
  return body
}

export function createTerrainBodyFromData({ data, width, depth, mapWidth, mapDepth, minHeight, maxHeight }) {
  const shape = createTerrainShape({ data, width, depth, mapWidth, mapDepth, minHeight, maxHeight })
  const body = createTerrainBody(shape, minHeight, maxHeight)
  return body
}

/* UPDATE */

export function updateMesh(mesh) {
  const ms = mesh.userData.body.getMotionState()
  if (!ms) return
  const transform = new AMMO.btTransform()
  ms.getWorldTransform(transform)
  const p = transform.getOrigin()
  const q = transform.getRotation()
  mesh.position.set(p.x(), p.y(), p.z())
  mesh.quaternion.set(q.x(), q.y(), q.z(), q.w())
}
