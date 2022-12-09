/* global Ammo */

export function makeVehicle(physicsWorld) {

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
  const tempVector = new Ammo.btVector3()

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
