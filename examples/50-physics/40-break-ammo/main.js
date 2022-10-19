/* global Ammo */
import * as THREE from 'three'
import { ConvexObjectBreaker } from '/node_modules/three/examples/jsm/misc/ConvexObjectBreaker.js'
import { ConvexGeometry } from '/node_modules/three/examples/jsm/geometries/ConvexGeometry.js'
import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { normalizeMouse } from '/utils/helpers.js'

const { Vector3 } = THREE

const AMMO = await Ammo()

camera.position.set(-14, 8, 16)
createOrbitControls()

const sun = createSun({ position: [5, 15, 15] })
scene.add(sun)

const GRAVITY = 7.8
const margin = 0.05

const convexBreaker = new ConvexObjectBreaker()
const rigidBodies = []

const pos = new Vector3()

const objectsToRemove = []
let numObjectsToRemove = 0

const impactPoint = new Vector3()
const impactNormal = new Vector3()

const transform = new AMMO.btTransform()
const tempBtVec3 = new AMMO.btVector3(0, 0, 0)

const physicsWorld = createPhysicsWorld()

createGround(40, 1, 40, 0, new Vector3(0, -0.5, 0), 0xFFFFFF)

// towers
createBox(1000, new Vector3(4, 10, 4), new Vector3(-8, 5, 0), 0xB03014)
createBox(1000, new Vector3(4, 10, 4), new Vector3(8, 5, 0), 0xB03014)

// bridge
createBox(100, new Vector3(14, 0.4, 3), new Vector3(0, 10.2, 0), 0xB3B865)

// stones
const numStones = 8
for (let i = 0; i < numStones; i++) {
  pos.set(0, 2, 15 * (0.5 - i / (numStones + 1)))
  createBox(120, new Vector3(2, 4, 0.3), pos, 0xB0B0B0)
}

createPyramid()

/* FUNCTION */

function createPhysicsWorld() {
  const collisionConfiguration = new AMMO.btDefaultCollisionConfiguration()
  const dispatcher = new AMMO.btCollisionDispatcher(collisionConfiguration)
  const broadphase = new AMMO.btDbvtBroadphase()
  const solver = new AMMO.btSequentialImpulseConstraintSolver()
  const physicsWorld = new AMMO.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration)
  physicsWorld.setGravity(new AMMO.btVector3(0, - GRAVITY, 0))
  return physicsWorld
}

function createBox(mass, size, pos, color = createRandomColor()) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(size.x, size.y, size.z),
    new THREE.MeshPhongMaterial({ color }))
  mesh.position.copy(pos)
  convexBreaker.prepareBreakableObject(mesh, mass, new Vector3(), new Vector3(), true)
  createDebrisFromBreakableObject(mesh)
}

function createPyramid() {
  const pyramidMass = 860
  const pyramidHalfExtents = new Vector3(4, 5, 4)
  pos.set(5, pyramidHalfExtents.y * 0.5, - 7)
  const pyramidPoints = []
  pyramidPoints.push(new Vector3(pyramidHalfExtents.x, - pyramidHalfExtents.y, pyramidHalfExtents.z))
  pyramidPoints.push(new Vector3(- pyramidHalfExtents.x, - pyramidHalfExtents.y, pyramidHalfExtents.z))
  pyramidPoints.push(new Vector3(pyramidHalfExtents.x, - pyramidHalfExtents.y, - pyramidHalfExtents.z))
  pyramidPoints.push(new Vector3(- pyramidHalfExtents.x, - pyramidHalfExtents.y, - pyramidHalfExtents.z))
  pyramidPoints.push(new Vector3(0, pyramidHalfExtents.y, 0))
  const pyramid = new THREE.Mesh(new ConvexGeometry(pyramidPoints), new THREE.MeshPhongMaterial({ color: 0xB03814 }))
  pyramid.position.copy(pos)
  convexBreaker.prepareBreakableObject(pyramid, pyramidMass, new Vector3(), new Vector3(), true)
  createDebrisFromBreakableObject(pyramid)
}

function createGround(sx, sy, sz, mass, pos, color) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1), new THREE.MeshPhongMaterial({ color }))
  const shape = new AMMO.btBoxShape(new AMMO.btVector3(sx * 0.5, sy * 0.5, sz * 0.5))
  shape.setMargin(margin)
  createRigidBody(mesh, shape, mass, pos)
  mesh.receiveShadow = true
  return mesh
}

function createDebrisFromBreakableObject(mesh) {
  mesh.castShadow = mesh.receiveShadow = true
  const shape = createConvexHullPhysicsShape(mesh.geometry.attributes.position.array)
  shape.setMargin(margin)
  // set pointer back to the three mesh
  const btVecUserData = new AMMO.btVector3(0, 0, 0)
  btVecUserData.threeObject = mesh
  const { body } = createRigidBody(mesh, shape, mesh.userData.mass, mesh.position, mesh.userData.velocity, mesh.userData.angularVelocity)
  body.setUserPointer(btVecUserData)
}

function removeDebris(mesh) {
  scene.remove(mesh)
  physicsWorld.removeRigidBody(mesh.userData.physicsBody)
}

function createConvexHullPhysicsShape(coords) {
  const shape = new AMMO.btConvexHullShape()
  for (let i = 0, il = coords.length; i < il; i += 3) {
    tempBtVec3.setValue(coords[i], coords[i + 1], coords[i + 2])
    const lastOne = (i >= (il - 3))
    shape.addPoint(tempBtVec3, lastOne)
  }
  return shape
}

function createRigidBody(mesh, physicsShape, mass, pos, vel, angVel) {
  mesh.position.copy(pos)
  const transform = new AMMO.btTransform()
  transform.setIdentity()
  transform.setOrigin(new AMMO.btVector3(pos.x, pos.y, pos.z))
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

  addRigidBody({ mesh, body, mass })

  return { mesh, body, mass }
}

function addRigidBody({ mesh, body, mass }) {
  scene.add(mesh)
  if (mass > 0) rigidBodies.push(mesh)
  physicsWorld.addRigidBody(body)
}

function createRandomColor() {
  return Math.floor(Math.random() * (1 << 24))
}

function updatePhysics(deltaTime) {
  physicsWorld.stepSimulation(deltaTime, 10)
  rigidBodies.forEach(mesh => {
    const ms = mesh.userData.physicsBody.getMotionState()
    if (!ms) return
    ms.getWorldTransform(transform)
    const p = transform.getOrigin()
    const q = transform.getRotation()
    mesh.position.set(p.x(), p.y(), p.z())
    mesh.quaternion.set(q.x(), q.y(), q.z(), q.w())
    mesh.userData.collided = false
  })

  const dispatcher = physicsWorld.getDispatcher()
  for (let i = 0, il = dispatcher.getNumManifolds(); i < il; i++) {
    const contactManifold = dispatcher.getManifoldByIndexInternal(i)
    const rb0 = AMMO.castObject(contactManifold.getBody0(), AMMO.btRigidBody)
    const rb1 = AMMO.castObject(contactManifold.getBody1(), AMMO.btRigidBody)
    const mesh0 = AMMO.castObject(rb0.getUserPointer(), AMMO.btVector3).threeObject
    const mesh1 = AMMO.castObject(rb1.getUserPointer(), AMMO.btVector3).threeObject
    if (!mesh0 && !mesh1)
      continue
    const userData0 = mesh0 ? mesh0.userData : null
    const userData1 = mesh1 ? mesh1.userData : null
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
      const debris = convexBreaker.subdivideByImpact(mesh0, impactPoint, impactNormal, 1, 2, 1.5)
      const numObjects = debris.length
      for (let j = 0; j < numObjects; j++) {
        const vel = rb0.getLinearVelocity()
        const angVel = rb0.getAngularVelocity()
        const fragment = debris[j]
        fragment.userData.velocity.set(vel.x(), vel.y(), vel.z())
        fragment.userData.angularVelocity.set(angVel.x(), angVel.y(), angVel.z())
        createDebrisFromBreakableObject(fragment)
      }
      objectsToRemove[numObjectsToRemove++] = mesh0
      userData0.collided = true
    }
    if (breakable1 && !collided1 && maxImpulse > fractureImpulse) {
      const debris = convexBreaker.subdivideByImpact(mesh1, impactPoint, impactNormal, 1, 2, 1.5)
      const numObjects = debris.length
      for (let j = 0; j < numObjects; j++) {
        const vel = rb1.getLinearVelocity()
        const angVel = rb1.getAngularVelocity()
        const fragment = debris[j]
        fragment.userData.velocity.set(vel.x(), vel.y(), vel.z())
        fragment.userData.angularVelocity.set(angVel.x(), angVel.y(), angVel.z())
        createDebrisFromBreakableObject(fragment)
      }
      objectsToRemove[numObjectsToRemove++] = mesh1
      userData1.collided = true
    }
  }
  for (let i = 0; i < numObjectsToRemove; i++) removeDebris(objectsToRemove[i])
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

const raycaster = new THREE.Raycaster()
const ballMaterial = new THREE.MeshPhongMaterial({ color: 0x202020 })

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
  const { body } = createRigidBody(ball, ballShape, ballMass, pos)
  pos.copy(raycaster.ray.direction)
  pos.multiplyScalar(24)
  body.setLinearVelocity(new AMMO.btVector3(pos.x, pos.y, pos.z))
})