/* global Ammo */
import * as THREE from 'three'
import keyboard from '/utils/classes/Keyboard.js'

let gEngineForce = 0
let gBreakingForce = 0
let gVehicleSteering = 0

export function createVehicle({
  physicsWorld, pos = new THREE.Vector3(0, 1, 0), width = 2.4, height = 1, length = 4.8, mass = 680 } = {}
) {
  const suspensionStiffness = 50
  const suspensionDamping = 4
  const suspensionCompression = 2.4
  const maxSuspensionTravelCm = 1500.0
  const maxSuspensionForce = 50000.0
  const CUBE_HALF_EXTENTS = 1
  const suspensionRestLength = 1.3
  const connectionHeight = 1.2

  const wheelRadius = .39
  const wheelWidth = .35
  const frictionSlip = 3.5
  const rearWheelFriction = 4.5

  const rightIndex = 0
  const upIndex = 1
  const forwardIndex = 2

  const startTransform = new Ammo.btTransform()

  startTransform.setIdentity()
  const shape = new Ammo.btBoxShape(new Ammo.btVector3(width * .5, height * .5, length * .5))
  const compound = new Ammo.btCompoundShape()
  const transform = new Ammo.btTransform()
  transform.setIdentity()
  transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z))
  compound.addChildShape(transform, shape)

  const inertia = new Ammo.btVector3(1, 1, 1)
  compound.calculateLocalInertia(mass, inertia)
  const motionState = new Ammo.btDefaultMotionState(startTransform)
  const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, compound, inertia)
  const body = new Ammo.btRigidBody(rbInfo)

  const m_tuning = new Ammo.btVehicleTuning()
  const wheelAxleCS = new Ammo.btVector3(-1, 0, 0)
  const wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0)
  m_tuning.set_m_suspensionStiffness(suspensionStiffness)
  m_tuning.set_m_suspensionCompression(suspensionCompression)
  m_tuning.set_m_suspensionDamping(suspensionDamping)
  m_tuning.set_m_maxSuspensionTravelCm(maxSuspensionTravelCm)
  m_tuning.set_m_frictionSlip(frictionSlip)
  m_tuning.set_m_maxSuspensionForce(maxSuspensionForce)

  const m_vehicleRayCaster = new Ammo.btDefaultVehicleRaycaster(physicsWorld)
  const vehicle = new Ammo.btRaycastVehicle(m_tuning, body, m_vehicleRayCaster)
  body.setActivationState(4)
  body.setFriction(1)
  physicsWorld.addAction(vehicle)

  // choose coordinate system
  vehicle.setCoordinateSystem(rightIndex, upIndex, forwardIndex)

  // front wheels
  let isFrontWheel = true
  const connectionPointCS0 = new Ammo.btVector3(0, 0, 0)

  connectionPointCS0.setValue(CUBE_HALF_EXTENTS - (0.3 * wheelWidth), connectionHeight, 2 * CUBE_HALF_EXTENTS - wheelRadius)

  vehicle.addWheel(connectionPointCS0, wheelDirectionCS0, wheelAxleCS, suspensionRestLength, wheelRadius, m_tuning, isFrontWheel)

  connectionPointCS0.setValue(-CUBE_HALF_EXTENTS + (0.3 * wheelWidth), connectionHeight, 2 * CUBE_HALF_EXTENTS - wheelRadius)

  vehicle.addWheel(connectionPointCS0, wheelDirectionCS0, wheelAxleCS, suspensionRestLength, wheelRadius, m_tuning, isFrontWheel)

  isFrontWheel = true // for all wheel drive?

  m_tuning.set_m_frictionSlip(rearWheelFriction)

  connectionPointCS0.setValue(-CUBE_HALF_EXTENTS + (0.3 * wheelWidth), connectionHeight, -2 * CUBE_HALF_EXTENTS + wheelRadius)

  vehicle.addWheel(connectionPointCS0, wheelDirectionCS0, wheelAxleCS, suspensionRestLength, wheelRadius, m_tuning, isFrontWheel)

  connectionPointCS0.setValue(CUBE_HALF_EXTENTS - (0.3 * wheelWidth), connectionHeight, -2 * CUBE_HALF_EXTENTS + wheelRadius)

  vehicle.addWheel(connectionPointCS0, wheelDirectionCS0, wheelAxleCS, suspensionRestLength, wheelRadius, m_tuning, isFrontWheel)

  physicsWorld.addRigidBody(body)

  return { vehicle, body }
}

export function handleInput({ vehicle }) {
  const maxSpeed = 150.0
  const turboForce = 1.7
  const maxEngineForce = 8000.0
  const maxBreakingForce = maxEngineForce * 2

  const steeringIncrement = 0.09
  const steeringClamp = .44
  const steeringReturnRate = .6

  const kmh = vehicle.getCurrentSpeedKmHour()
  const steering = keyboard.left || keyboard.right
  const accelerating = keyboard.up || keyboard.down

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

export function updateTires(tires, vehicle) {
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
