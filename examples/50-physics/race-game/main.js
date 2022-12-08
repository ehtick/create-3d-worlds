/* global Ammo */
import * as THREE from 'three'

import keyboard from '/utils/classes/Keyboard.js'
import { scene, camera, renderer } from '/utils/scene.js'
import { createSun, hemLight } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'
import { leaveDecals, fadeDecals } from './decals.js'
import { Car } from './Car.js'
import { createPhysicsWorld, updateMesh } from '/utils/physics.js'

hemLight({ groundColor: 0xf0d7bb })
scene.add(createSun({ position: [10, 195, 0] }))

const physicsWorld = createPhysicsWorld()
const worldScale = 25

const maxSpeed = 150.0
const turboForce = 1.7
const maxEngineForce = 8000.0
const maxBreakingForce = maxEngineForce * 2

const steeringIncrement = 0.09
const steeringClamp = .44
const steeringReturnRate = .6

let gEngineForce = 0
let gBreakingForce = 0
let gVehicleSteering = 0

const { mesh: worldMesh } = await loadModel({ file: 'racing/courser14a.obj', mtl: 'racing/courser14a.mtl', receiveShadow: true, castShadow: false, scale: worldScale })

const worldModel = worldMesh.children[0]
worldModel.position.set(0, -38, 0)
addWorldBody(worldModel, worldScale)

const cars = [
  await new Car({ objFile: 'hummer', tireFile: 'hummerTire', physicsWorld }),
  await new Car({ objFile: 'ladavaz', tireFile: 'ladavazTire', physicsWorld }),
]

cars.forEach(car => scene.add(car.mesh, ...car.tires))
scene.add(worldModel)

/* FUNCTION */

function addWorldBody(model, scale) {
  const triangleMesh = new Ammo.btTriangleMesh()
  const pos = model.children[0].geometry.attributes.position.array
  for (let i = 0; i < pos.length; i += 9) {
    const v0 = pos[i] * scale
    const v1 = pos[i + 1] * scale
    const v2 = pos[i + 2] * scale
    const v3 = pos[i + 3] * scale
    const v4 = pos[i + 4] * scale
    const v5 = pos[i + 5] * scale
    const v6 = pos[i + 6] * scale
    const v7 = pos[i + 7] * scale
    const v8 = pos[i + 8] * scale
    triangleMesh.addTriangle(
      new Ammo.btVector3(v0, v1, v2),
      new Ammo.btVector3(v3, v4, v5),
      new Ammo.btVector3(v6, v7, v8)
    )
  }

  const transform = new Ammo.btTransform()
  transform.setIdentity()
  const center = new Ammo.btVector3(0, -38, 0)
  transform.setOrigin(center)
  const motionState = new Ammo.btDefaultMotionState(transform)
  const shape = new Ammo.btBvhTriangleMeshShape(triangleMesh, true)
  const body = new Ammo.btRigidBody(0, motionState, shape)
  body.setCollisionFlags(body.getCollisionFlags() | 1)
  body.setActivationState(4) // DISABLE_DEACTIVATION
  body.setFriction(.5)
  physicsWorld.addRigidBody(body)
}

function findGround(body) {
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

function chaseCam(body, camHeight = 4, distance = 8) {
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

/* LOOP */

function handleInput(car) {
  const { vehicle, mesh, tires } = car
  const kmh = vehicle.getCurrentSpeedKmHour()
  const { body } = mesh.userData

  const steering = keyboard.left || keyboard.right
  const accelerating = keyboard.up || keyboard.down

  if (vehicle.getWheelInfo(2).get_m_skidInfo() < .9 || (accelerating && Math.abs(kmh) < maxSpeed / 4))
    leaveDecals(worldModel, body, tires, scene)

  if (!steering) gVehicleSteering *= steeringReturnRate

  if (steering)
    if (keyboard.left) {
      if (gVehicleSteering < .05) gVehicleSteering += .01; else
        gVehicleSteering *= 1 + steeringIncrement

      if (gVehicleSteering > steeringClamp) gVehicleSteering = steeringClamp
    } else if (keyboard.right) {
      if (gVehicleSteering > -.05) gVehicleSteering -= .01; else
        gVehicleSteering *= 1 + steeringIncrement

      if (gVehicleSteering < -steeringClamp) gVehicleSteering = -steeringClamp
    }

  if (!accelerating) {
    gEngineForce = 0
    if (Math.abs(kmh) > 20) gBreakingForce += 5
  }

  if (accelerating)
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

function updateCars() {
  cars.forEach(({ mesh, tires, vehicle }) => {
    findGround(mesh.userData.body)
    updateMesh(mesh)
    updateTires(tires, vehicle)
  })
}

void function animate() {
  requestAnimationFrame(animate)
  handleInput(cars[0])
  physicsWorld.stepSimulation(1 / 60)
  updateCars()
  fadeDecals(scene)
  chaseCam(cars[0].mesh.userData.body)
  renderer.render(scene, camera)
}()
