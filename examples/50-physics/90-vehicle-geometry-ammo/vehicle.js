/* global Ammo */
import * as THREE from 'three'
import keyboard from '/utils/classes/Keyboard.js'

const AMMO = await Ammo()

const FRONT_LEFT = 0
const FRONT_RIGHT = 1
const BACK_LEFT = 2
const BACK_RIGHT = 3
const maxSpeed = 40
const steeringIncrement = .04
const steeringClamp = .5
const maxEngineForce = 2000
const maxBreakingForce = 100
let engineForce = 0
let vehicleSteering = 0
let breakingForce = 0

const carMaterial = new THREE.MeshPhongMaterial({ color: 0x990000 })

function createWheel(radius, width) {
  const t = new THREE.CylinderGeometry(radius, radius, width, 24, 1)
  t.rotateZ(Math.PI / 2)
  const mesh = new THREE.Mesh(t, carMaterial)
  mesh.add(new THREE.Mesh(new THREE.BoxGeometry(width * 1.5, radius * 1.75, radius * .25, 1, 1, 1), carMaterial))
  return mesh
}

function createChassis(w, l, h) {
  const geometry = new THREE.BoxGeometry(w, l, h, 1, 1, 1)
  const mesh = new THREE.Mesh(geometry, carMaterial)
  return mesh
}

export function createVehicle(pos, physicsWorld) {
  // Vehicle contants
  const chassisWidth = 1.8
  const chassisHeight = .6
  const chassisLength = 4
  const massVehicle = 800

  const wheelAxisPositionBack = -1
  const wheelRadiusBack = .4
  const wheelWidthBack = .3
  const wheelHalfTrackBack = 1
  const wheelAxisHeightBack = .3

  const wheelAxisFrontPosition = 1.7
  const wheelHalfTrackFront = 1
  const wheelAxisHeightFront = .3
  const wheelRadiusFront = .35
  const wheelWidthFront = .2

  const friction = 1000
  const suspensionStiffness = 20.0
  const suspensionDamping = 2.3
  const suspensionCompression = 4.4
  const suspensionRestLength = 0.6
  const rollInfluence = 0.2

  // Chassis
  const shape = new AMMO.btBoxShape(new AMMO.btVector3(chassisWidth * .5, chassisHeight * .5, chassisLength * .5))
  const transform = new AMMO.btTransform()
  transform.setIdentity()
  transform.setOrigin(new AMMO.btVector3(pos.x, pos.y, pos.z))
  const motionState = new AMMO.btDefaultMotionState(transform)
  const inertia = new AMMO.btVector3(0, 0, 0)
  shape.calculateLocalInertia(massVehicle, inertia)
  const body = new AMMO.btRigidBody(new AMMO.btRigidBodyConstructionInfo(massVehicle, motionState, shape, inertia))
  body.setActivationState(4)
  physicsWorld.addRigidBody(body)
  const chassis = createChassis(chassisWidth, chassisHeight, chassisLength)

  // Raycast Vehicle
  const tuning = new AMMO.btVehicleTuning()
  const rayCaster = new AMMO.btDefaultVehicleRaycaster(physicsWorld)
  const vehicle = new AMMO.btRaycastVehicle(tuning, body, rayCaster)
  vehicle.setCoordinateSystem(0, 1, 2)
  physicsWorld.addAction(vehicle)

  // Wheels
  const wheels = []
  const wheelDirectionCS0 = new AMMO.btVector3(0, -1, 0)
  const wheelAxleCS = new AMMO.btVector3(-1, 0, 0)

  function addWheel(isFront, pos, radius, width, index) {
    const wheelInfo = vehicle.addWheel(
      pos,
      wheelDirectionCS0,
      wheelAxleCS,
      suspensionRestLength,
      radius,
      tuning,
      isFront)

    wheelInfo.set_m_suspensionStiffness(suspensionStiffness)
    wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping)
    wheelInfo.set_m_wheelsDampingCompression(suspensionCompression)
    wheelInfo.set_m_frictionSlip(friction)
    wheelInfo.set_m_rollInfluence(rollInfluence)
    wheels[index] = createWheel(radius, width)
  }

  addWheel(true, new AMMO.btVector3(wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront, wheelWidthFront, FRONT_LEFT)
  addWheel(true, new AMMO.btVector3(-wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront, wheelWidthFront, FRONT_RIGHT)
  addWheel(false, new AMMO.btVector3(-wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, wheelWidthBack, BACK_LEFT)
  addWheel(false, new AMMO.btVector3(wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, wheelWidthBack, BACK_RIGHT)

  return { vehicle, wheels, chassis }
}

export function updateVehicle({ vehicle, wheels, chassis }) {
  const speed = vehicle.getCurrentSpeedKmHour()
  breakingForce = 0
  engineForce = 0

  // if (keyboard.up && speed < maxSpeed)
  //   engineForce = maxEngineForce

  // if (keyboard.down && speed > -maxSpeed * .5)
  //   engineForce = -maxEngineForce / 2

  // if (keyboard.space)
  //   breakingForce = maxBreakingForce

  // if (keyboard.left && vehicleSteering < steeringClamp)
  //   vehicleSteering += steeringIncrement

  // if (keyboard.right && vehicleSteering > -steeringClamp)
  //   vehicleSteering -= steeringIncrement

  if (keyboard.up)
    if (speed < -1)
      breakingForce = maxBreakingForce
    else engineForce = maxEngineForce

  if (keyboard.down)
    if (speed > 1)
      breakingForce = maxBreakingForce
    else engineForce = -maxEngineForce / 2

  if (keyboard.left) {
    if (vehicleSteering < steeringClamp)
      vehicleSteering += steeringIncrement
  } else if (keyboard.right) {
    if (vehicleSteering > -steeringClamp)
      vehicleSteering -= steeringIncrement
  } else if (vehicleSteering < -steeringIncrement)
    vehicleSteering += steeringIncrement
  else if (vehicleSteering > steeringIncrement)
    vehicleSteering -= steeringIncrement
  else
    vehicleSteering = 0

  vehicle.applyEngineForce(engineForce, BACK_LEFT)
  vehicle.applyEngineForce(engineForce, BACK_RIGHT)

  vehicle.setBrake(breakingForce / 2, FRONT_LEFT)
  vehicle.setBrake(breakingForce / 2, FRONT_RIGHT)
  vehicle.setBrake(breakingForce, BACK_LEFT)
  vehicle.setBrake(breakingForce, BACK_RIGHT)

  vehicle.setSteeringValue(vehicleSteering, FRONT_LEFT)
  vehicle.setSteeringValue(vehicleSteering, FRONT_RIGHT)

  let tm, p, q, i
  const n = vehicle.getNumWheels()
  for (i = 0; i < n; i++) {
    vehicle.updateWheelTransform(i, true)
    tm = vehicle.getWheelTransformWS(i)
    p = tm.getOrigin()
    q = tm.getRotation()
    wheels[i].position.set(p.x(), p.y(), p.z())
    wheels[i].quaternion.set(q.x(), q.y(), q.z(), q.w())
  }
  tm = vehicle.getChassisWorldTransform()
  p = tm.getOrigin()
  q = tm.getRotation()
  chassis.position.set(p.x(), p.y(), p.z())
  chassis.quaternion.set(q.x(), q.y(), q.z(), q.w())
}