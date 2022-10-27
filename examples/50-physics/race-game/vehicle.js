/* global Ammo */

const suspensionStiffness = [58.0, 45.0, 58.0, 36.0, 58.0, 58.0, 58.0]
const suspensionDamping = 4
const suspensionCompression = 2.4
const maxSuspensionTravelCm = 1500.0
const maxSuspensionForce = 50000.0
const CUBE_HALF_EXTENTS = [.96, 1.12, .97, 1., .94, .99, .99]
const suspensionRestLength = [1.1, 1.05, 1.1, 1.25, 1.1, 1.2, 1.2]
const connectionHeight = 1.2

const wheelRadius = [.36, .42, .36, .41, .36, .36, .36]
const wheelWidth = [.2, .5, .2, -.05, .2, .2, .2]
const frictionSlip = 3.5
const rearWheelFriction = 4.5

const rightIndex = 0
const upIndex = 1
const forwardIndex = 2

export function makeVehicle(c, physicsWorld, bodies) {
  const m_tuning = new Ammo.btVehicleTuning()
  const wheelAxleCS = new Ammo.btVector3(-1, 0, 0)
  const wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0)
  m_tuning.set_m_suspensionStiffness(suspensionStiffness[c])
  m_tuning.set_m_suspensionCompression(suspensionCompression)
  m_tuning.set_m_suspensionDamping(suspensionDamping)
  m_tuning.set_m_maxSuspensionTravelCm(maxSuspensionTravelCm)
  m_tuning.set_m_frictionSlip(frictionSlip)
  m_tuning.set_m_maxSuspensionForce(maxSuspensionForce)

  const m_vehicleRayCaster = new Ammo.btDefaultVehicleRaycaster(physicsWorld)
  const vehicle = new Ammo.btRaycastVehicle(m_tuning, bodies[c], m_vehicleRayCaster)
  bodies[c].setActivationState(4)
  physicsWorld.addAction(vehicle)

  // choose coordinate system
  vehicle.setCoordinateSystem(rightIndex, upIndex, forwardIndex)

  // front wheels
  let isFrontWheel = true
  const connectionPointCS0 = new Ammo.btVector3(0, 0, 0)

  connectionPointCS0.setValue(CUBE_HALF_EXTENTS[c] - (0.3 * wheelWidth[c]), connectionHeight, 2 * CUBE_HALF_EXTENTS[c] - wheelRadius[c])

  vehicle.addWheel(connectionPointCS0, wheelDirectionCS0, wheelAxleCS, suspensionRestLength[c], wheelRadius[c], m_tuning, isFrontWheel)

  connectionPointCS0.setValue(-CUBE_HALF_EXTENTS[c] + (0.3 * wheelWidth[c]), connectionHeight, 2 * CUBE_HALF_EXTENTS[c] - wheelRadius[c])

  vehicle.addWheel(connectionPointCS0, wheelDirectionCS0, wheelAxleCS, suspensionRestLength[c], wheelRadius[c], m_tuning, isFrontWheel)

  isFrontWheel = true // for all wheel drive?

  m_tuning.set_m_frictionSlip(rearWheelFriction)

  connectionPointCS0.setValue(-CUBE_HALF_EXTENTS[c] + (0.3 * wheelWidth[c]), connectionHeight, -2 * CUBE_HALF_EXTENTS[c] + wheelRadius[c])

  vehicle.addWheel(connectionPointCS0, wheelDirectionCS0, wheelAxleCS, suspensionRestLength[c], wheelRadius[c], m_tuning, isFrontWheel)

  connectionPointCS0.setValue(CUBE_HALF_EXTENTS[c] - (0.3 * wheelWidth[c]), connectionHeight, -2 * CUBE_HALF_EXTENTS[c] + wheelRadius[c])

  vehicle.addWheel(connectionPointCS0, wheelDirectionCS0, wheelAxleCS, suspensionRestLength[c], wheelRadius[c], m_tuning, isFrontWheel)

  // these last two of the six total wheels are for rendering
  // m_tuning.set_m_frictionSlip(rearWheelFriction)

  // isFrontWheel = true
  // connectionPointCS0.setValue(-CUBE_HALF_EXTENTS[c] + (0.3 * wheelWidth[c]), connectionHeight, -2 * CUBE_HALF_EXTENTS[c] + wheelRadius[c])

  // vehicle.addWheel(connectionPointCS0, wheelDirectionCS0, wheelAxleCS, suspensionRestLength[c], wheelRadius[c], m_tuning, isFrontWheel)

  // connectionPointCS0.setValue(CUBE_HALF_EXTENTS[c] - (0.3 * wheelWidth[c]), connectionHeight, -2 * CUBE_HALF_EXTENTS[c] + wheelRadius[c])

  // vehicle.addWheel(connectionPointCS0, wheelDirectionCS0, wheelAxleCS, suspensionRestLength[c], wheelRadius[c], m_tuning, isFrontWheel)

  return vehicle
}
