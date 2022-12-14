/* global THREE, Ammo */

export default class AmmoVehicle {
  constructor(btPhysicsWorld, position, quaternion) {
    this.object3d = new THREE.Group

    this.parameters = {}
    const opt = this.parameters
    opt.chassisWidth = 1.8
    opt.chassisHeight = .6
    opt.chassisLength = 4
    opt.massVehicle = 800

    opt.wheelAxisPositionBack = -1.8
    opt.wheelHalfTrackBack = 1.15
    opt.wheelAxisHeightBack = .3
    opt.wheelRadiusBack = .45
    opt.wheelWidthBack = .2

    opt.wheelAxisPositionFront = 1.55
    opt.wheelHalfTrackFront = 1.15
    opt.wheelAxisHeightFront = .3
    opt.wheelRadiusFront = .45
    opt.wheelWidthFront = .2

    opt.friction = 1000
    opt.suspensionStiffness = 20.0
    opt.suspensionDamping = 2.3
    opt.suspensionCompression = 4.4
    opt.suspensionRestLength = 0.6
    opt.rollInfluence = 0.2

    opt.steeringIncrement = .04
    opt.steeringClamp = .5
    opt.maxEngineForce = 2000
    opt.maxBreakingForce = 100

    // TODO should that be outside, built before this constructor
    const chassisMesh = new THREE.Group()
    chassisMesh.name = 'chassis'
    this.object3d.add(chassisMesh)
    const wheelMeshes = []
    for (let i = 0; i < 4; i++) {
      wheelMeshes[i] = new THREE.Group()
      wheelMeshes[i].name = 'wheel_' + i
      this.object3d.add(wheelMeshes[i])
    }

    // build chassis
    const geometry = new Ammo.btBoxShape(new Ammo.btVector3(opt.chassisWidth * .5, opt.chassisHeight * .5, opt.chassisLength * .5))
    const transform = new Ammo.btTransform()
    transform.setIdentity()
    transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z))
    transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w))
    const motionState = new Ammo.btDefaultMotionState(transform)
    const localInertia = new Ammo.btVector3(0, 0, 0)
    geometry.calculateLocalInertia(opt.massVehicle, localInertia)
    const chassisBody = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(opt.massVehicle, motionState, geometry, localInertia))

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
    createWheel(true, new Ammo.btVector3(opt.wheelHalfTrackFront, opt.wheelAxisHeightFront, opt.wheelAxisPositionFront), opt.wheelRadiusFront)
    createWheel(true, new Ammo.btVector3(-opt.wheelHalfTrackFront, opt.wheelAxisHeightFront, opt.wheelAxisPositionFront), opt.wheelRadiusFront)
    createWheel(false, new Ammo.btVector3(-opt.wheelHalfTrackBack, opt.wheelAxisHeightBack, opt.wheelAxisPositionBack), opt.wheelRadiusBack)
    createWheel(false, new Ammo.btVector3(opt.wheelHalfTrackBack, opt.wheelAxisHeightBack, opt.wheelAxisPositionBack), opt.wheelRadiusBack)

    this.updateGamepad = function(actions) {
      if (actions.jump) {
        actions.jump = false
        const impulse = new Ammo.btVector3(0, opt.massVehicle * 5, 0)
        chassisBody.applyCentralImpulse(impulse)
      }

      const breakingForce = actions.breaking * opt.maxEngineForce
      vehicle.setBrake(breakingForce / 2, FRONT_LEFT)
      vehicle.setBrake(breakingForce / 2, FRONT_RIGHT)
      vehicle.setBrake(breakingForce, BACK_LEFT)
      vehicle.setBrake(breakingForce, BACK_RIGHT)

      const engineForce = actions.acceleration * opt.maxEngineForce
      vehicle.applyEngineForce(engineForce, BACK_LEFT)
      vehicle.applyEngineForce(engineForce, BACK_RIGHT)

      const vehicleSteering = actions.steering * opt.steeringClamp
      vehicle.setSteeringValue(vehicleSteering, FRONT_LEFT)
      vehicle.setSteeringValue(vehicleSteering, FRONT_RIGHT)

      updatePhysics()
    }

    // states
    this.updateKeyboard = (function() {
      let vehicleSteering = 0

      // Sync keybord actions and physics and graphics
      return function(actions) {
        const speed = vehicle.getCurrentSpeedKmHour()
        let breakingForce = 0
        let engineForce = 0

        if (actions.acceleration)
          if (speed < -1)
            breakingForce = opt.maxBreakingForce
          else engineForce = opt.maxEngineForce

        if (actions.braking)
          if (speed > 1)
            breakingForce = opt.maxBreakingForce
          else engineForce = -opt.maxEngineForce / 2

        if (actions.left) {
          if (vehicleSteering < opt.steeringClamp)
            vehicleSteering += opt.steeringIncrement
        } else
        if (actions.right) {
          if (vehicleSteering > -opt.steeringClamp)
            vehicleSteering -= opt.steeringIncrement
        } else
        if (vehicleSteering < -opt.steeringIncrement)
          vehicleSteering += opt.steeringIncrement
        else
        if (vehicleSteering > opt.steeringIncrement)
          vehicleSteering -= opt.steeringIncrement
        else
          vehicleSteering = 0

        if (actions.jump) {
          actions.jump = false
          const impulse = new Ammo.btVector3(0, opt.massVehicle * 5, 0)
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
    })()

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
        position,
        wheelDirectionCS0,
        wheelAxleCS,
        opt.suspensionRestLength,
        radius,
        tuning,
        isFront)

      wheelInfo.set_m_suspensionStiffness(opt.suspensionStiffness)
      wheelInfo.set_m_wheelsDampingRelaxation(opt.suspensionDamping)
      wheelInfo.set_m_wheelsDampingCompression(opt.suspensionCompression)

      wheelInfo.set_m_frictionSlip(opt.friction)
      wheelInfo.set_m_rollInfluence(opt.rollInfluence)
    }
  }
}