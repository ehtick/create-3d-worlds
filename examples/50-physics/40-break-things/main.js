import * as THREE from 'three'
import { ConvexObjectBreaker } from '/node_modules/three/examples/jsm/misc/ConvexObjectBreaker.js'
import { ConvexGeometry } from '/node_modules/three/examples/jsm/geometries/ConvexGeometry.js'

import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { normalizeMouse } from '/utils/helpers.js'
import { AMMO, createPhysicsWorld, updateMesh, createRigidBody, createBall, createGround } from '/utils/physics.js'

const { Vector3 } = THREE

camera.position.set(-14, 8, 16)
createOrbitControls()

const sun = createSun({ position: [5, 15, 15] })
scene.add(sun)

const margin = 0.05

const convexBreaker = new ConvexObjectBreaker()
const rigidBodies = []

const objectsToRemove = []
let numObjectsToRemove = 0

const physicsWorld = createPhysicsWorld({ gravity: 7.8 })

addRigidBody(createGround({ size: 100 }))

createBreakableBox({ mass: 1000, size: new Vector3(4, 10, 4), pos: new Vector3(-8, 5, 0), color: 0xB03014 })
createBreakableBox({ mass: 1000, size: new Vector3(4, 10, 4), pos: new Vector3(8, 5, 0), color: 0xB03014 })
createBreakableBox({ mass: 100, size: new Vector3(14, 0.4, 3), pos: new Vector3(0, 10.2, 0), color: 0xB3B865 })

const numDominos = 8
for (let i = 0; i < numDominos; i++) {
  const pos = new Vector3()
  pos.set(0, 2, 15 * (0.5 - i / (numDominos + 1)))
  createBreakableBox({ mass: 120, size: new Vector3(2, 4, .3), pos, color: 0xB0B0B0 })
}

createPyramid()

/* FUNCTION */

function createBreakableBox({ mass, size, pos, color }) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), new THREE.MeshPhongMaterial({ color }))
  mesh.position.copy(pos)
  convexBreaker.prepareBreakableObject(mesh, mass, new Vector3(), new Vector3(), true)
  createDebrisFromBreakableObject(mesh)
}

function createPyramid() {
  const mass = 860
  const half = new Vector3(4, 5, 4)
  const pos = new Vector3().set(5, half.y * 0.5, -7)
  const points = [
    new Vector3(half.x, -half.y, half.z),
    new Vector3(-half.x, -half.y, half.z),
    new Vector3(half.x, -half.y, -half.z),
    new Vector3(-half.x, -half.y, -half.z),
    new Vector3(0, half.y, 0),
  ]
  const pyramid = new THREE.Mesh(new ConvexGeometry(points), new THREE.MeshPhongMaterial({ color: 0xB03814 }))
  pyramid.position.copy(pos)
  convexBreaker.prepareBreakableObject(pyramid, mass, new Vector3(), new Vector3(), true)
  createDebrisFromBreakableObject(pyramid)
}

function createDebrisFromBreakableObject(mesh) {
  mesh.castShadow = mesh.receiveShadow = true
  const shape = createConvexHullPhysicsShape(mesh.geometry.attributes.position.array)
  shape.setMargin(margin)
  const btVecUserData = new AMMO.btVector3(0, 0, 0)
  btVecUserData.threeObject = mesh // set pointer back to mesh
  const obj = createRigidBody({ mesh, shape, mass: mesh.userData.mass, pos: mesh.position, vel: mesh.userData.velocity, angVel: mesh.userData.angularVelocity })
  addRigidBody(obj)
  obj.mesh.userData.body.setUserPointer(btVecUserData)
}

function removeDebris(mesh) {
  scene.remove(mesh)
  physicsWorld.removeRigidBody(mesh.userData.body)
}

function createConvexHullPhysicsShape(positions) {
  const shape = new AMMO.btConvexHullShape()
  const tempBtVec3 = new AMMO.btVector3(0, 0, 0)
  for (let i = 0, il = positions.length; i < il; i += 3) {
    tempBtVec3.setValue(positions[i], positions[i + 1], positions[i + 2])
    const lastOne = (i >= (il - 3))
    shape.addPoint(tempBtVec3, lastOne)
  }
  return shape
}

function addRigidBody({ mesh }) {
  mesh.userData.collided = false
  scene.add(mesh)
  rigidBodies.push(mesh)
  physicsWorld.addRigidBody(mesh.userData.body)
}

function updatePhysics(dt) {
  physicsWorld.stepSimulation(dt, 10)
  rigidBodies.forEach(updateMesh)

  const impactPoint = new Vector3()
  const impactNormal = new Vector3()
  const dispatcher = physicsWorld.getDispatcher()

  for (let i = 0, il = dispatcher.getNumManifolds(); i < il; i++) {
    const contactManifold = dispatcher.getManifoldByIndexInternal(i)
    const rb0 = AMMO.castObject(contactManifold.getBody0(), AMMO.btRigidBody)
    const rb1 = AMMO.castObject(contactManifold.getBody1(), AMMO.btRigidBody)
    const mesh0 = AMMO.castObject(rb0.getUserPointer(), AMMO.btVector3).threeObject
    const mesh1 = AMMO.castObject(rb1.getUserPointer(), AMMO.btVector3).threeObject
    if (!mesh0 && !mesh1) continue

    const breakable0 = mesh0?.userData?.breakable
    const breakable1 = mesh1?.userData?.breakable
    const collided0 = mesh0?.userData?.collided
    const collided1 = mesh1?.userData?.collided
    if ((!breakable0 && !breakable1) || (collided0 && collided1)) continue

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
    if (!contact) continue // if no point has contact

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
      mesh0.userData.collided = true
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
      mesh1.userData.collided = true
    }
  }
  for (let i = 0; i < numObjectsToRemove; i++) removeDebris(objectsToRemove[i])
  numObjectsToRemove = 0
}

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const dt = clock.getDelta()
  updatePhysics(dt)
  renderer.render(scene, camera)
}()

/* EVENTS */

const raycaster = new THREE.Raycaster()

window.addEventListener('pointerdown', e => {
  const mouse = normalizeMouse(e)
  raycaster.setFromCamera(mouse, camera)
  const pos = new Vector3().copy(raycaster.ray.direction).add(raycaster.ray.origin)
  const obj = createBall({ radius: 0.4, mass: 35, pos })
  addRigidBody(obj)
  pos.copy(raycaster.ray.direction).multiplyScalar(24)
  obj.mesh.userData.body.setLinearVelocity(new AMMO.btVector3(pos.x, pos.y, pos.z))
})