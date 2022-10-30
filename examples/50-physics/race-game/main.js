/* global Ammo */
import * as THREE from 'three'

import keyboard from '/utils/classes/Keyboard.js'
import { scene, camera, renderer, fixColors } from '/utils/scene.js'
import { createSun, hemLight } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'
import { leaveDecals, fadeDecals } from './utils.js'
import { makeVehicle } from './vehicle.js'

hemLight({ groundColor: 0xf0d7bb })
scene.add(createSun({ position: [10, 195, 0] }))

fixColors()

const physicsWorld = createPhysicsWorld()

const center = new Ammo.btVector3(0, -38, 0)
const worldScale = 25

const DISABLE_DEACTIVATION = 4

const maxSpeed = 150.0
const turboForce = 1.7
const maxEngineForce = 8000.0
const maxBreakingForce = maxEngineForce * 2

const steeringIncrement = 0.09
const steeringClamp = .44
const steeringReturnRate = .6

const bodies = []
const vehicles = []
let gEngineForce = 0
let gBreakingForce = 0
let gVehicleSteering = 0

// ako se nešto od ovoga obriše ili premesti nestaje lada??
const obTrans = new Ammo.btTransform() // eslint-disable-line no-unused-vars
const triMeshBodyTrans = new Ammo.btTransform()
const tempVector = new Ammo.btVector3()

initVehicle(0)
initVehicle(1)

const { mesh: hummerMesh } = await loadModel({ file: 'racing/hummer.obj', mtl: 'racing/hummer.mtl', scale: .57 })

const { mesh: ladaMesh } = await loadModel({ file: 'racing/ladavaz.obj', mtl: 'racing/ladavaz.mtl', scale: .57 })

const { mesh: hummerTireMesh } = await loadModel({ file: 'racing/hummerTire.obj', mtl: 'racing/hummerTire.mtl', scale: .57 })
const hummerTires = []
for (let j = 0; j < 4; j++) hummerTires.push(hummerTireMesh.clone())

const { mesh: ladaTireMesh } = await loadModel({ file: 'racing/ladavazTire.obj', mtl: 'racing/ladavazTire.mtl', scale: .57 })
const ladaTires = []
for (let j = 0; j < 4; j++) ladaTires.push(ladaTireMesh.clone())

scene.add(hummerMesh, ladaMesh, ...hummerTires, ...ladaTires)

const { mesh: worldMesh } = await loadModel({ file: 'racing/courser14a.obj', mtl: 'racing/courser14a.mtl', receiveShadow: true, castShadow: false, scale: worldScale })
const worldModel = worldMesh.children[0]
worldModel.position.set(0, -38, 0)
bodyBuilder(worldModel, worldScale)
scene.add(worldModel)

/* FUNCTION */

function createPhysicsWorld() {
  const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration()
  const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration)
  const worldMin = new Ammo.btVector3(-1000, -1000, -1000)
  const worldMax = new Ammo.btVector3(1000, 1000, 1000)
  const overlappingPairCache = new Ammo.btAxisSweep3(worldMin, worldMax)
  const solver = new Ammo.btSequentialImpulseConstraintSolver()

  const physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration)
  physicsWorld.setGravity(new Ammo.btVector3(0, -40, 0))
  return physicsWorld
}

function setChaseCam(camHeight = 4, camDist = 8) {
  const carRot = bodies[0].getWorldTransform().getBasis()
  const c2 = new Ammo.btVector3(0, camHeight, -camDist)
  const camPointer = new Ammo.btVector3(
    carRot.getRow(0).x() * c2.x() + carRot.getRow(0).y() * c2.y() + carRot.getRow(0).z() * c2.z(),
    carRot.getRow(1).x() * c2.x() + carRot.getRow(1).y() * c2.y() + carRot.getRow(1).z() * c2.z(),
    carRot.getRow(2).x() * c2.x() + carRot.getRow(2).y() * c2.y() + carRot.getRow(2).z() * c2.z()
  )

  const carOrigin = bodies[0].getWorldTransform().getOrigin()
  camera.position.set(
    camPointer.x() + carOrigin.x(),
    camPointer.y() + carOrigin.y(),
    camPointer.z() + carOrigin.z()
  )
  tempVector.setValue(0, 0, 0)
  camera.lookAt(new THREE.Vector3(carOrigin.x(), carOrigin.y(), carOrigin.z()))
}

function bodyBuilder(model, scale) {
  const triangleMesh = new Ammo.btTriangleMesh()
  const pos = model.children[0].geometry.attributes.position.array
  for (let c = 0; c < pos.length; c += 9) {
    const v0 = pos[c] * scale
    const v1 = pos[c + 1] * scale
    const v2 = pos[c + 2] * scale
    const v3 = pos[c + 3] * scale
    const v4 = pos[c + 4] * scale
    const v5 = pos[c + 5] * scale
    const v6 = pos[c + 6] * scale
    const v7 = pos[c + 7] * scale
    const v8 = pos[c + 8] * scale

    triangleMesh.addTriangle(
      new Ammo.btVector3(v0, v1, v2),
      new Ammo.btVector3(v3, v4, v5),
      new Ammo.btVector3(v6, v7, v8)
    )
  }

  const shape = new Ammo.btBvhTriangleMeshShape(triangleMesh, true)
  triMeshBodyTrans.setIdentity()
  triMeshBodyTrans.setOrigin(center)
  const motionStated = new Ammo.btDefaultMotionState(triMeshBodyTrans)
  tempVector.setValue(0, 0, 0)
  const body = new Ammo.btRigidBody(0, motionStated, shape, tempVector)
  body.setCollisionFlags(body.getCollisionFlags() | 1)
  body.setActivationState(DISABLE_DEACTIVATION)
  body.setFriction(.1)
  physicsWorld.addRigidBody(body)
}

function initVehicle(c) {
  const startTransform = new Ammo.btTransform()
  startTransform.setIdentity()
  tempVector.setValue(1.2, .5, 2.4)
  const chassisShape = new Ammo.btBoxShape(tempVector)
  const compound = new Ammo.btCompoundShape()
  const transform = new Ammo.btTransform()
  transform.setIdentity()
  tempVector.setValue(0, 1, 0)
  transform.setOrigin(tempVector)
  compound.addChildShape(transform, chassisShape)
  const mass = 680

  const inertia = new Ammo.btVector3(1, 1, 1)
  compound.calculateLocalInertia(mass, inertia)
  const motionState = new Ammo.btDefaultMotionState(startTransform)
  const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, compound, inertia)
  bodies[c] = new Ammo.btRigidBody(rbInfo)
  bodies[c].setFriction(1)
  physicsWorld.addRigidBody(bodies[c])
  vehicles[c] = makeVehicle(physicsWorld, bodies[c])
}

function findGround(c) {
  const body = bodies[c]
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

/* LOOP */

function handleInput() {
  const vehicle = vehicles[0]
  const kmh = vehicle.getCurrentSpeedKmHour()

  if (vehicle.getWheelInfo(2).get_m_skidInfo() < .9 || ((keyboard.up || keyboard.down) && Math.abs(kmh) < maxSpeed / 4))
    leaveDecals(worldModel, bodies[0], hummerTires, scene)

  const steering = (keyboard.left || keyboard.right)

  if (!steering) gVehicleSteering *= steeringReturnRate
  else if (steering)
    if (keyboard.left) {
      if (gVehicleSteering < .05) gVehicleSteering += .01; else
        gVehicleSteering *= 1 + steeringIncrement

      if (gVehicleSteering > steeringClamp) gVehicleSteering = steeringClamp
    } else
    if (keyboard.right) {
      if (gVehicleSteering > -.05) gVehicleSteering -= .01; else
        gVehicleSteering *= 1 + steeringIncrement

      if (gVehicleSteering < -steeringClamp) gVehicleSteering = -steeringClamp
    }

  const accelerating = keyboard.up || keyboard.down

  if (!accelerating) {
    gEngineForce = 0
    if (Math.abs(kmh) > 20) gBreakingForce += 5
  } else if (accelerating)
    if (keyboard.up && kmh < maxSpeed) {
      if (kmh < maxSpeed / 5) gEngineForce = maxEngineForce * turboForce; else gEngineForce = maxEngineForce
      gBreakingForce = 0.0
    } else if (keyboard.up && kmh >= maxSpeed) {
      gEngineForce = 0.0
      gBreakingForce = 0.0
    } else if (keyboard.down && kmh > -maxSpeed) {
      gEngineForce = -maxEngineForce
      gBreakingForce = 0.0
    } else if (keyboard.down && kmh <= maxSpeed) {
      gEngineForce = 0.0
      gBreakingForce = 0.0
    }

  if (keyboard.space) {
    gBreakingForce = maxBreakingForce * 2
    gEngineForce = 0.0
  }

  // 0,1 front; 2,3 back
  vehicle.applyEngineForce(gEngineForce, 0)
  vehicle.setBrake(gBreakingForce, 0)
  vehicle.setSteeringValue(gVehicleSteering, 0)
  vehicle.setSteeringValue(-gVehicleSteering * 1.2, 4)// for drifting, 5th wheel (rear)

  vehicle.applyEngineForce(gEngineForce, 4)
  vehicle.applyEngineForce(gEngineForce, 1)
  vehicle.setBrake(gBreakingForce, 1)
  vehicle.setSteeringValue(gVehicleSteering, 1)
  vehicle.setSteeringValue(-gVehicleSteering * 1.2, 5) // for drifting, 6th wheel (rear)
  vehicle.applyEngineForce(gEngineForce, 5)
}

function updateTires(tires, vehicle) {
  tires.forEach((tire, i) => {
    vehicle.updateWheelTransform(i, true)
    const wheelTrans = vehicle.getWheelInfo(i).get_m_worldTransform()
    const p = wheelTrans.getOrigin()
    const q = wheelTrans.getRotation()
    tire.position.set(p.x(), p.y(), p.z())
    tire.quaternion.set(q.x(), q.y(), q.z(), q.w())
    if (i == 0) tire.rotateY(-Math.PI)
  })
}

function updatePhysics() {
  physicsWorld.stepSimulation(1 / 60)
  const transform = new Ammo.btTransform()
  ;[hummerMesh, ladaMesh].forEach((car, i) => {
    findGround(i)
    bodies[i].getMotionState().getWorldTransform(transform)
    const pos = transform.getOrigin()
    const quat = transform.getRotation()
    if (car) {
      car.position.set(pos.x(), pos.y(), pos.z())
      car.quaternion.set(quat.x(), quat.y(), quat.z(), quat.w())
    }
  })
  updateTires(hummerTires, vehicles[0])
  updateTires(ladaTires, vehicles[1])
}

void function animate() {
  requestAnimationFrame(animate)
  handleInput()
  updatePhysics()
  fadeDecals(scene)
  setChaseCam()
  renderer.render(scene, camera)
}()
