/* global Ammo */

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

export function makeVehicle(physicsWorld, body) {
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

  return { vehicle }
}
