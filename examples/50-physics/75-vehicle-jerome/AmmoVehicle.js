import * as THREE from 'three'
import { Ammo } from '/utils/physics.js'
import keyboard from '/utils/classes/Keyboard.js'

export default class AmmoVehicle {
  constructor(btPhysicsWorld, position, quaternion) {
    this.mesh = new THREE.Group

    const chassisWidth = 1.8
    const chassisHeight = .6
    const chassisLength = 4
    const massVehicle = 800

    const wheelAxisPositionBack = -1.8
    const wheelHalfTrackBack = 1.15
    const wheelAxisHeightBack = .3
    const wheelRadiusBack = .45

    const wheelAxisPositionFront = 1.55
    const wheelHalfTrackFront = 1.15
    const wheelAxisHeightFront = .3
    const wheelRadiusFront = .45

    const friction = 1000
    const suspensionStiffness = 20.0
    const suspensionDamping = 2.3
    const suspensionCompression = 4.4
    const suspensionRestLength = 0.6
    const rollInfluence = 0.2

    const steeringIncrement = .04
    const steeringClamp = .5
    const maxEngineForce = 2000
    const maxBreakingForce = 100

    // TODO should that be outside, built before this constructor
    const chassisMesh = new THREE.Group()
    chassisMesh.name = 'chassis'
    this.mesh.add(chassisMesh)
    const wheelMeshes = []
    for (let i = 0; i < 4; i++) {
      wheelMeshes[i] = new THREE.Group()
      wheelMeshes[i].name = 'wheel_' + i
      this.mesh.add(wheelMeshes[i])
    }

    // build chassis
    const geometry = new Ammo.btBoxShape(new Ammo.btVector3(chassisWidth * .5, chassisHeight * .5, chassisLength * .5))
    const transform = new Ammo.btTransform()
    transform.setIdentity()
    transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z))
    transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w))
    const motionState = new Ammo.btDefaultMotionState(transform)
    const localInertia = new Ammo.btVector3(0, 0, 0)
    geometry.calculateLocalInertia(massVehicle, localInertia)
    const chassisBody = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(massVehicle, motionState, geometry, localInertia))

    const DISABLE_DEACTIVATION = 4
    chassisBody.setActivationState(DISABLE_DEACTIVATION)
    this.chassisBody = chassisBody
    btPhysicsWorld.addRigidBody(chassisBody)

    // Raycast Vehicle
    const tuning = new Ammo.btVehicleTuning()
    const rayCaster = new Ammo.btDefaultVehicleRaycaster(btPhysicsWorld)
    const vehicle = new Ammo.btRaycastVehicle(tuning, chassisBody, rayCaster)
    vehicle.setCoordinateSystem(0, 1, 2)
    btPhysicsWorld.addAction(vehicle)

    this.vehicle = vehicle

    // build wheels physics
    const FRONT_LEFT = 0
    const FRONT_RIGHT = 1
    const BACK_LEFT = 2
    const BACK_RIGHT = 3
    createWheel(true, new Ammo.btVector3(wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisPositionFront), wheelRadiusFront)
    createWheel(true, new Ammo.btVector3(-wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisPositionFront), wheelRadiusFront)
    createWheel(false, new Ammo.btVector3(-wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack)
    createWheel(false, new Ammo.btVector3(wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack)

    let vehicleSteering = 0

    this.updateKeyboard = function() {
      const speed = vehicle.getCurrentSpeedKmHour()
      let breakingForce = 0
      let engineForce = 0

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
      } else
      if (keyboard.right) {
        if (vehicleSteering > -steeringClamp)
          vehicleSteering -= steeringIncrement
      } else
      if (vehicleSteering < -steeringIncrement)
        vehicleSteering += steeringIncrement
      else
      if (vehicleSteering > steeringIncrement)
        vehicleSteering -= steeringIncrement
      else
        vehicleSteering = 0

      if (keyboard.space) {
        const impulse = new Ammo.btVector3(0, massVehicle * .5, 0)
        chassisBody.applyCentralImpulse(impulse)
      }

      vehicle.applyEngineForce(engineForce, BACK_LEFT)
      vehicle.applyEngineForce(engineForce, BACK_RIGHT)

      vehicle.setBrake(breakingForce / 2, FRONT_LEFT)
      vehicle.setBrake(breakingForce / 2, FRONT_RIGHT)
      vehicle.setBrake(breakingForce, BACK_LEFT)
      vehicle.setBrake(breakingForce, BACK_RIGHT)

      vehicle.setSteeringValue(vehicleSteering, FRONT_LEFT)
      vehicle.setSteeringValue(vehicleSteering, FRONT_RIGHT)

      updatePhysics()
    }

    function updatePhysics() {
      const nWheels = vehicle.getNumWheels()
      for (let i = 0; i < nWheels; i++) {
        vehicle.updateWheelTransform(i, true)
        const transform = vehicle.getWheelTransformWS(i)
        const position = transform.getOrigin()
        const quaternion = transform.getRotation()
        wheelMeshes[i].position.set(position.x(), position.y(), position.z())
        wheelMeshes[i].quaternion.set(quaternion.x(), quaternion.y(), quaternion.z(), quaternion.w())
      }

      const transform = vehicle.getChassisWorldTransform()
      const position = transform.getOrigin()
      const quaternion = transform.getRotation()
      chassisMesh.position.set(position.x(), position.y(), position.z())
      chassisMesh.quaternion.set(quaternion.x(), quaternion.y(), quaternion.z(), quaternion.w())
    }

    function createWheel(isFront, position, radius) {
      const wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0)
      const wheelAxleCS = new Ammo.btVector3(-1, 0, 0)

      const wheelInfo = vehicle.addWheel(
        position, wheelDirectionCS0, wheelAxleCS, suspensionRestLength,
        radius, tuning, isFront
      )

      wheelInfo.set_m_suspensionStiffness(suspensionStiffness)
      wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping)
      wheelInfo.set_m_wheelsDampingCompression(suspensionCompression)

      wheelInfo.set_m_frictionSlip(friction)
      wheelInfo.set_m_rollInfluence(rollInfluence)
    }
  }
}