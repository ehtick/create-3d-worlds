/* global Ammo */
import * as THREE from 'three'
import { ConvexObjectBreaker } from '/node_modules/three/examples/jsm/misc/ConvexObjectBreaker.js'
import { ConvexGeometry } from '/node_modules/three/examples/jsm/geometries/ConvexGeometry.js'
import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { normalizeMouse } from '/utils/helpers.js'

const AMMO = await Ammo()

camera.position.set(-14, 8, 16)
createOrbitControls()

const sun = createSun({ position: [5, 15, 15] })
scene.add(sun)

const raycaster = new THREE.Raycaster()
const ballMaterial = new THREE.MeshPhongMaterial({ color: 0x202020 })

// Physics variables
const gravityConstant = 7.8
let collisionConfiguration
let dispatcher
let broadphase
let solver
const margin = 0.05

const convexBreaker = new ConvexObjectBreaker()
const rigidBodies = []

const pos = new THREE.Vector3()
const quat = new THREE.Quaternion()

const objectsToRemove = []

for (let i = 0; i < 500; i++)
  objectsToRemove[i] = null

let numObjectsToRemove = 0

const impactPoint = new THREE.Vector3()
const impactNormal = new THREE.Vector3()

const transformAux1 = new AMMO.btTransform()
const tempBtVec3_1 = new AMMO.btVector3(0, 0, 0)

const physicsWorld = createPhysicsWorld()

createObjects()

/* FUNCTION */

function createPhysicsWorld() {
  collisionConfiguration = new AMMO.btDefaultCollisionConfiguration()
  dispatcher = new AMMO.btCollisionDispatcher(collisionConfiguration)
  broadphase = new AMMO.btDbvtBroadphase()
  solver = new AMMO.btSequentialImpulseConstraintSolver()
  const physicsWorld = new AMMO.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration)
  physicsWorld.setGravity(new AMMO.btVector3(0, - gravityConstant, 0))
  return physicsWorld
}

function createObject(mass, halfExtents, pos, quat, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2), material)
  mesh.position.copy(pos)
  mesh.quaternion.copy(quat)
  convexBreaker.prepareBreakableObject(mesh, mass, new THREE.Vector3(), new THREE.Vector3(), true)
  createDebrisFromBreakableObject(mesh)
}

function createObjects() {
  // Ground
  pos.set(0, - 0.5, 0)
  quat.set(0, 0, 0, 1)
  const ground = createParalellepipedWithPhysics(40, 1, 40, 0, pos, quat, new THREE.MeshPhongMaterial({ color: 0xFFFFFF }))
  ground.receiveShadow = true
  // Tower 1
  const towerMass = 1000
  const towerHalfExtents = new THREE.Vector3(2, 5, 2)
  pos.set(- 8, 5, 0)
  quat.set(0, 0, 0, 1)
  createObject(towerMass, towerHalfExtents, pos, quat, createMaterial(0xB03014))
  // Tower 2
  pos.set(8, 5, 0)
  quat.set(0, 0, 0, 1)
  createObject(towerMass, towerHalfExtents, pos, quat, createMaterial(0xB03214))
  // Bridge
  const bridgeMass = 100
  const bridgeHalfExtents = new THREE.Vector3(7, 0.2, 1.5)
  pos.set(0, 10.2, 0)
  quat.set(0, 0, 0, 1)
  createObject(bridgeMass, bridgeHalfExtents, pos, quat, createMaterial(0xB3B865))
  // Stones
  const stoneMass = 120
  const stoneHalfExtents = new THREE.Vector3(1, 2, 0.15)
  const numStones = 8
  quat.set(0, 0, 0, 1)
  for (let i = 0; i < numStones; i++) {
    pos.set(0, 2, 15 * (0.5 - i / (numStones + 1)))
    createObject(stoneMass, stoneHalfExtents, pos, quat, createMaterial(0xB0B0B0))
  }
  // Mountain
  const mountainMass = 860
  const mountainHalfExtents = new THREE.Vector3(4, 5, 4)
  pos.set(5, mountainHalfExtents.y * 0.5, - 7)
  quat.set(0, 0, 0, 1)
  const mountainPoints = []
  mountainPoints.push(new THREE.Vector3(mountainHalfExtents.x, - mountainHalfExtents.y, mountainHalfExtents.z))
  mountainPoints.push(new THREE.Vector3(- mountainHalfExtents.x, - mountainHalfExtents.y, mountainHalfExtents.z))
  mountainPoints.push(new THREE.Vector3(mountainHalfExtents.x, - mountainHalfExtents.y, - mountainHalfExtents.z))
  mountainPoints.push(new THREE.Vector3(- mountainHalfExtents.x, - mountainHalfExtents.y, - mountainHalfExtents.z))
  mountainPoints.push(new THREE.Vector3(0, mountainHalfExtents.y, 0))
  const mountain = new THREE.Mesh(new ConvexGeometry(mountainPoints), createMaterial(0xB03814))
  mountain.position.copy(pos)
  mountain.quaternion.copy(quat)
  convexBreaker.prepareBreakableObject(mountain, mountainMass, new THREE.Vector3(), new THREE.Vector3(), true)
  createDebrisFromBreakableObject(mountain)
}

function createParalellepipedWithPhysics(sx, sy, sz, mass, pos, quat, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1), material)
  const shape = new AMMO.btBoxShape(new AMMO.btVector3(sx * 0.5, sy * 0.5, sz * 0.5))
  shape.setMargin(margin)
  createRigidBody(mesh, shape, mass, pos, quat)
  return mesh
}

function createDebrisFromBreakableObject(mesh) {
  mesh.castShadow = mesh.receiveShadow = true
  const shape = createConvexHullPhysicsShape(mesh.geometry.attributes.position.array)
  shape.setMargin(margin)
  const { body } = createRigidBody(mesh, shape, mesh.userData.mass, null, null, mesh.userData.velocity, mesh.userData.angularVelocity)
  // Set pointer back to the three mesh only in the debris objects
  const btVecUserData = new AMMO.btVector3(0, 0, 0)
  btVecUserData.threeObject = mesh
  body.setUserPointer(btVecUserData)
}

function removeDebris(mesh) {
  scene.remove(mesh)
  physicsWorld.removeRigidBody(mesh.userData.physicsBody)
}

function createConvexHullPhysicsShape(coords) {
  const shape = new AMMO.btConvexHullShape()
  for (let i = 0, il = coords.length; i < il; i += 3) {
    tempBtVec3_1.setValue(coords[i], coords[i + 1], coords[i + 2])
    const lastOne = (i >= (il - 3))
    shape.addPoint(tempBtVec3_1, lastOne)
  }
  return shape
}

function createRigidBody(mesh, physicsShape, mass, pos, quat, vel, angVel) {
  if (pos)
    mesh.position.copy(pos)
  else
    pos = mesh.position
  if (quat)
    mesh.quaternion.copy(quat)
  else
    quat = mesh.quaternion
  const transform = new AMMO.btTransform()
  transform.setIdentity()
  transform.setOrigin(new AMMO.btVector3(pos.x, pos.y, pos.z))
  transform.setRotation(new AMMO.btQuaternion(quat.x, quat.y, quat.z, quat.w))
  const motionState = new AMMO.btDefaultMotionState(transform)
  const localInertia = new AMMO.btVector3(0, 0, 0)
  physicsShape.calculateLocalInertia(mass, localInertia)
  const rbInfo = new AMMO.btRigidBodyConstructionInfo(mass, motionState, physicsShape, localInertia)
  const body = new AMMO.btRigidBody(rbInfo)
  body.setFriction(0.5)
  if (vel)
    body.setLinearVelocity(new AMMO.btVector3(vel.x, vel.y, vel.z))
  if (angVel)
    body.setAngularVelocity(new AMMO.btVector3(angVel.x, angVel.y, angVel.z))
  mesh.userData.physicsBody = body
  mesh.userData.collided = false

  if (mass > 0) body.setActivationState(4) // Disable deactivation

  scene.add(mesh)
  if (mass > 0) rigidBodies.push(mesh)
  physicsWorld.addRigidBody(body)

  return { mesh, body, mass }
}

function createRandomColor() {
  return Math.floor(Math.random() * (1 << 24))
}

function createMaterial(color) {
  color = color || createRandomColor()
  return new THREE.MeshPhongMaterial({ color })
}

function updatePhysics(deltaTime) {
  // Step world
  physicsWorld.stepSimulation(deltaTime, 10)
  // Update rigid bodies
  for (let i = 0, il = rigidBodies.length; i < il; i++) {
    const objThree = rigidBodies[i]
    const objPhys = objThree.userData.physicsBody
    const ms = objPhys.getMotionState()
    if (ms) {
      ms.getWorldTransform(transformAux1)
      const p = transformAux1.getOrigin()
      const q = transformAux1.getRotation()
      objThree.position.set(p.x(), p.y(), p.z())
      objThree.quaternion.set(q.x(), q.y(), q.z(), q.w())
      objThree.userData.collided = false
    }
  }
  for (let i = 0, il = dispatcher.getNumManifolds(); i < il; i++) {
    const contactManifold = dispatcher.getManifoldByIndexInternal(i)
    const rb0 = AMMO.castObject(contactManifold.getBody0(), AMMO.btRigidBody)
    const rb1 = AMMO.castObject(contactManifold.getBody1(), AMMO.btRigidBody)
    const threeObject0 = AMMO.castObject(rb0.getUserPointer(), AMMO.btVector3).threeObject
    const threeObject1 = AMMO.castObject(rb1.getUserPointer(), AMMO.btVector3).threeObject
    if (!threeObject0 && !threeObject1)
      continue
    const userData0 = threeObject0 ? threeObject0.userData : null
    const userData1 = threeObject1 ? threeObject1.userData : null
    const breakable0 = userData0 ? userData0.breakable : false
    const breakable1 = userData1 ? userData1.breakable : false
    const collided0 = userData0 ? userData0.collided : false
    const collided1 = userData1 ? userData1.collided : false
    if ((!breakable0 && !breakable1) || (collided0 && collided1))
      continue
    let contact = false
    let maxImpulse = 0
    for (let j = 0, jl = contactManifold.getNumContacts(); j < jl; j++) {
      const contactPoint = contactManifold.getContactPoint(j)
      if (contactPoint.getDistance() < 0) {
        contact = true
        const impulse = contactPoint.getAppliedImpulse()
        if (impulse > maxImpulse) {
          maxImpulse = impulse
          const pos = contactPoint.get_m_positionWorldOnB()
          const normal = contactPoint.get_m_normalWorldOnB()
          impactPoint.set(pos.x(), pos.y(), pos.z())
          impactNormal.set(normal.x(), normal.y(), normal.z())
        }
        break
      }
    }
    // If no point has contact, abort
    if (!contact) continue
    // Subdivision
    const fractureImpulse = 250
    if (breakable0 && !collided0 && maxImpulse > fractureImpulse) {
      const debris = convexBreaker.subdivideByImpact(threeObject0, impactPoint, impactNormal, 1, 2, 1.5)
      const numObjects = debris.length
      for (let j = 0; j < numObjects; j++) {
        const vel = rb0.getLinearVelocity()
        const angVel = rb0.getAngularVelocity()
        const fragment = debris[j]
        fragment.userData.velocity.set(vel.x(), vel.y(), vel.z())
        fragment.userData.angularVelocity.set(angVel.x(), angVel.y(), angVel.z())
        createDebrisFromBreakableObject(fragment)
      }
      objectsToRemove[numObjectsToRemove++] = threeObject0
      userData0.collided = true
    }
    if (breakable1 && !collided1 && maxImpulse > fractureImpulse) {
      const debris = convexBreaker.subdivideByImpact(threeObject1, impactPoint, impactNormal, 1, 2, 1.5)
      const numObjects = debris.length
      for (let j = 0; j < numObjects; j++) {
        const vel = rb1.getLinearVelocity()
        const angVel = rb1.getAngularVelocity()
        const fragment = debris[j]
        fragment.userData.velocity.set(vel.x(), vel.y(), vel.z())
        fragment.userData.angularVelocity.set(angVel.x(), angVel.y(), angVel.z())
        createDebrisFromBreakableObject(fragment)
      }
      objectsToRemove[numObjectsToRemove++] = threeObject1
      userData1.collided = true
    }
  }
  for (let i = 0; i < numObjectsToRemove; i++)
    removeDebris(objectsToRemove[i])
  numObjectsToRemove = 0
}

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const deltaTime = clock.getDelta()
  updatePhysics(deltaTime)
  renderer.render(scene, camera)
}()

/* EVENTS */

window.addEventListener('pointerdown', event => {
  const mouse = normalizeMouse(event)
  raycaster.setFromCamera(mouse, camera)
  // Creates a ball and throws it
  const ballMass = 35
  const ballRadius = 0.4
  const ball = new THREE.Mesh(new THREE.SphereGeometry(ballRadius, 14, 10), ballMaterial)
  ball.castShadow = true
  ball.receiveShadow = true
  const ballShape = new AMMO.btSphereShape(ballRadius)
  ballShape.setMargin(margin)
  pos.copy(raycaster.ray.direction)
  pos.add(raycaster.ray.origin)
  quat.set(0, 0, 0, 1)
  const { body } = createRigidBody(ball, ballShape, ballMass, pos, quat)
  pos.copy(raycaster.ray.direction)
  pos.multiplyScalar(24)
  body.setLinearVelocity(new AMMO.btVector3(pos.x, pos.y, pos.z))
})