import * as THREE from 'three'
import { randomGray, getSize } from '/utils/helpers.js'
import { geometryFromData } from '/utils/terrain/heightmap.js'
import { generateSimplePlayground } from '/utils/terrain/utils.js'

export const Ammo = typeof window.Ammo == 'function' ? await window.Ammo() : window.Ammo

const margin = 0.05

/* WORLD */

export function createPhysicsWorld({ gravity = 9.82, softBody = false } = {}) {
  const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration()
  const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration)
  const broadphase = new Ammo.btDbvtBroadphase()
  const solver = new Ammo.btSequentialImpulseConstraintSolver()
  const softBodySolver = softBody && new Ammo.btDefaultSoftBodySolver()

  const physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration, softBodySolver)
  physicsWorld.setGravity(new Ammo.btVector3(0, -gravity, 0))
  return physicsWorld
}

/* SHAPE */

const getMesh = obj => {
  if (obj.isMesh) return obj
  let mesh
  obj.traverse(child => {
    if (child.isMesh) mesh = child
    return
  })
  return mesh
}

const guessMassFromMesh = obj => {
  const mesh = getMesh(obj)
  const { geometry, scale: s } = mesh
  const p = geometry.parameters
  let mass
  if (geometry.type === 'BoxGeometry')
    mass = p.width * s.x * p.height * s.y * p.depth * s.z
  else if (geometry.type === 'SphereGeometry')
    mass = 4 / 3 * Math.PI * Math.pow(p.radius * s.x, 3)
  else if (geometry.type === 'CylinderGeometry')
  // from http://jwilson.coe.uga.edu/emt725/Frustum/Frustum.cone.html
    mass = Math.PI * p.height / 3 * (p.radiusBottom * p.radiusBottom * s.x * s.x
                  + p.radiusBottom * p.radiusTop * s.y * s.y
                  + p.radiusTop * p.radiusTop * s.x * s.x)
  else {
    const { x, y, z } = getSize(mesh)
    mass = x * s.x * y * s.y * z * s.z
  }
  console.log(mass)
  return mass
}

export const createShape = obj => {
  const mesh = getMesh(obj)
  const { scale } = mesh
  const { parameters, type } = mesh.geometry
  const btVector3 = new Ammo.btVector3()
  switch (type) {
    case 'BoxGeometry':
      btVector3.setX(parameters.width / 2 * scale.x)
      btVector3.setY(parameters.height / 2 * scale.y)
      btVector3.setZ(parameters.depth / 2 * scale.z)
      return new Ammo.btBoxShape(btVector3)
    case 'SphereGeometry':
    case 'DodecahedronGeometry':
      const radius = parameters.radius * scale.x
      return new Ammo.btSphereShape(radius)
    case 'CylinderGeometry':
      const size = new Ammo.btVector3(parameters.radiusTop * scale.x,
        parameters.height * 0.5 * scale.y,
        parameters.radiusBottom * scale.x)
      return new Ammo.btCylinderShape(size)
    default:
      const { x, y, z } = getSize(mesh)
      btVector3.setX(x / 2 * scale.x)
      btVector3.setY(y / 2 * scale.y)
      btVector3.setZ(z / 2 * scale.z)
      return new Ammo.btBoxShape(btVector3)
  }
}

export const createShapeFromMesh = mesh => {
  const shape = createShape(mesh)
  shape.setMargin(.05)
  return shape
}

/* BODIES */

export function createRigidBody({ mesh, mass = guessMassFromMesh(mesh), shape = createShapeFromMesh(mesh), friction }) {
  const { position, quaternion } = mesh

  const transform = new Ammo.btTransform()
  transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z))
  transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w))
  const motionState = new Ammo.btDefaultMotionState(transform)
  const inertia = new Ammo.btVector3(0, 0, 0)
  shape.calculateLocalInertia(mass, inertia)

  const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, inertia)
  const body = new Ammo.btRigidBody(rbInfo)

  if (friction) body.setFriction(friction)
  if (mass > 0) body.setActivationState(4) // Disable deactivation

  return body
}

export function createBall({ radius = 0.6, mass = 1.2, pos, quat, color = 0x202020 }) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 20, 20), new THREE.MeshPhongMaterial({ color })
  )
  if (pos) mesh.position.copy(pos)
  if (quat) mesh.quaternion.copy(quat)
  mesh.castShadow = mesh.receiveShadow = true

  const shape = new Ammo.btSphereShape(radius)
  shape.setMargin(margin)

  mesh.userData.body = createRigidBody({ mesh, mass, shape, friction: .5 })
  return mesh
}

export function createBox({ width, height, depth, mass = 0, pos, quat, color = randomGray(), friction }) {
  const geometry = new THREE.BoxGeometry(width, height, depth, 1, 1, 1)
  const mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color }))
  if (pos) mesh.position.copy(pos)
  if (quat) mesh.quaternion.copy(quat)
  mesh.castShadow = mesh.receiveShadow = true

  const shape = new Ammo.btBoxShape(new Ammo.btVector3(width * 0.5, height * 0.5, depth * 0.5))
  shape.setMargin(margin)

  mesh.userData.body = createRigidBody({ mesh, mass, shape, friction })
  return mesh
}

export const createGround = ({ size = 100, color = 0xFFFFFF } = {}) =>
  createBox({ width: size, height: 1, depth: size, mass: 0, pos: new THREE.Vector3(0, -0.5, 0), color })

/* STRUCTURES */

export function createCrates({ size = .75, columns = 18, rows = 6, z = -10 } = {}) {
  const crates = []
  for (let j = 0; j < columns; j++)
    for (let i = 0; i < rows; i++) {
      const x = size * j - (size * (columns - 1)) / 2
      const crate = createBox({
        pos: new THREE.Vector3(x, size * i, z),
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

  for (let j = 0; j < rows; j++) {
    const oddRow = (j % 2) == 1
    const nRow = oddRow ? columns + 1 : columns

    pos.z = oddRow ? z - brickDepth * .25 : z

    for (let i = 0; i < nRow; i++) {
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

  for (let j = 0; j < rows; j++) {
    const oddRow = (j % 2) == 1
    const nRow = oddRow ? columns + 1 : columns

    pos.x = oddRow ? x - brickDepth * .25 : x

    for (let i = 0; i < nRow; i++) {
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

function createTerrainShape({ data, width, depth, minHeight, maxHeight }) {
  const heightScale = 1 // ignored for PHY_FLOAT
  const upAxis = 1 // 0=X, 1=Y, 2=Z
  const hdt = 'PHY_FLOAT' // possible values: PHY_FLOAT, PHY_UCHAR, PHY_SHORT
  const flipQuadEdges = false
  const ammoHeightData = Ammo._malloc(4 * width * depth)
  // copy javascript data array to the Ammo one
  let p = 0
  let p2 = 0
  for (let j = 0; j < depth; j++)
    for (let i = 0; i < width; i++) {
      // write 32-bit float data to memory
      Ammo.HEAPF32[ammoHeightData + p2 >> 2] = data[p]
      p++
      p2 += 4 // 4 bytes/float
    }

  const shape = new Ammo.btHeightfieldTerrainShape(
    width, depth, ammoHeightData, heightScale,
    minHeight, maxHeight, upAxis, hdt, flipQuadEdges
  )
  shape.setMargin(0.05)
  return shape
}

export function createTerrainShapeAlt({ data, width, depth, mapWidth, mapDepth, minHeight, maxHeight }) {
  const heightScale = 1
  const upAxis = 1 // 0: X, 1: Y, 2: Z. normally Y is used.
  const hdt = 'PHY_FLOAT' // height data type
  const flipQuadEdges = false // inverts the triangles
  const ammoHeightData = Ammo._malloc(4 * width * depth) // Creates height data buffer in Ammo heap
  // Copy the javascript height data array to the Ammo one
  let p = 0
  let p2 = 0
  for (let j = 0; j < depth; j++)
    for (let i = 0; i < width; i++) {
      // write 32-bit float data to memory
      Ammo.HEAPF32[ammoHeightData + p2 >> 2] = data[p]
      p++
      // 4 bytes/float
      p2 += 4
    }

  const terrainShape = new Ammo.btHeightfieldTerrainShape(
    width, depth, ammoHeightData, heightScale, minHeight, maxHeight, upAxis, hdt, flipQuadEdges
  )

  const scaleX = mapWidth / (width - 1)
  const scaleZ = mapDepth / (depth - 1)
  terrainShape.setLocalScaling(new Ammo.btVector3(scaleX, 1, scaleZ))
  terrainShape.setMargin(0.05)

  return terrainShape
}

export function createTerrain({
  maxHeight = 24, minHeight = 0, width = 90, depth = 150, data = generateSimplePlayground(width, depth, (maxHeight + minHeight) / 2)
} = {}) {
  const averageHeight = (maxHeight + minHeight) / 2

  const geometry = geometryFromData({ data, width, depth })
  const material = new THREE.MeshLambertMaterial({ color: 0xfffacd })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.translateY(-averageHeight)
  mesh.receiveShadow = true

  const shape = createTerrainShape({ data, width, depth, minHeight, maxHeight })

  const transform = new Ammo.btTransform()
  transform.setIdentity()
  transform.setOrigin(new Ammo.btVector3(mesh.position.x, mesh.position.y + averageHeight, mesh.position.z))
  const mass = 0
  const inertia = new Ammo.btVector3(0, 0, 0)
  const motionState = new Ammo.btDefaultMotionState(transform)
  const body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, inertia))
  body.setRestitution(0.9)

  mesh.userData.body = body
  return mesh
}

/* TERRAIN ALT */

export function createTerrainBody(shape, minHeight, maxHeight) {
  const transform = new Ammo.btTransform()
  transform.setIdentity()
  // shifts the terrain, since bullet centers it on its bounding box.
  transform.setOrigin(new Ammo.btVector3(0, (maxHeight + minHeight) / 2, 0))
  const mass = 0
  const inertia = new Ammo.btVector3(0, 0, 0)
  const motionState = new Ammo.btDefaultMotionState(transform)
  const body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, inertia))
  return body
}

export function createTerrainBodyFromData({ data, width, depth, mapWidth, mapDepth, minHeight, maxHeight }) {
  const shape = createTerrainShapeAlt({ data, width, depth, mapWidth, mapDepth, minHeight, maxHeight })
  const body = createTerrainBody(shape, minHeight, maxHeight)
  return body
}

export function chaseCam({ body, camHeight = 4, distance = 8, camera } = {}) {
  const row = n => body.getWorldTransform().getBasis().getRow(n)
  const dist = new Ammo.btVector3(0, camHeight, -distance)
  const camPointer = new Ammo.btVector3(
    row(0).x() * dist.x() + row(0).y() * dist.y() + row(0).z() * dist.z(),
    row(1).x() * dist.x() + row(1).y() * dist.y() + row(1).z() * dist.z(),
    row(2).x() * dist.x() + row(2).y() * dist.y() + row(2).z() * dist.z()
  )

  const target = body.getWorldTransform().getOrigin()
  camera.position.set(
    camPointer.x() + target.x(),
    camPointer.y() + target.y(),
    camPointer.z() + target.z()
  )
  camera.lookAt(new THREE.Vector3(target.x(), target.y(), target.z()))
}

export function findGround(body, physicsWorld) {
  const transform = new Ammo.btTransform()
  body.getMotionState().getWorldTransform(transform)
  const pos = transform.getOrigin()
  const downRayDir = new Ammo.btVector3(pos.x(), pos.y() - 2000, pos.z())
  let downRay = new Ammo.ClosestRayResultCallback(pos, downRayDir)
  physicsWorld.rayTest(pos, downRayDir, downRay)

  if (downRay.hasHit())
    body.setDamping(0, 0)
  else {
    const cp = new Ammo.btVector3(pos.x(), pos.y() + 1, pos.z())
    downRayDir.setY(pos.y() + 400)
    downRay = new Ammo.ClosestRayResultCallback(cp, downRayDir)
    physicsWorld.rayTest(cp, downRayDir, downRay)
    if (downRay.hasHit()) {
      const pointAbove = downRay.get_m_hitPointWorld()
      body.setDamping(.99, .99)
      body.getMotionState().getWorldTransform(transform)
      pointAbove.setY(pointAbove.y() + 1.5)
      transform.setOrigin(pointAbove)
      body.setWorldTransform(transform)
    }
  }
}

/* UPDATE */

export function updateMesh(mesh) {
  const { body } = mesh.userData
  const motionState = body.getMotionState()
  if (!motionState || body.isStaticObject()) return
  const transform = new Ammo.btTransform()
  motionState.getWorldTransform(transform)
  const p = transform.getOrigin()
  const q = transform.getRotation()
  mesh.position.set(p.x(), p.y(), p.z())
  mesh.quaternion.set(q.x(), q.y(), q.z(), q.w())
}
