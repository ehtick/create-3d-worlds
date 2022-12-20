import * as THREE from 'three'
import { Ammo, createRigidBody } from '/utils/physics.js'
import keyboard from '/utils/classes/Keyboard.js'

const FRONT_LEFT = 0
const FRONT_RIGHT = 1
const BACK_LEFT = 2
const BACK_RIGHT = 3

const steeringIncrement = .04
const steeringClamp = .5
const maxEngineForce = 2000
const maxBreakingForce = 100

let vehicleSteering = 0

export default class AmmoVehicle {
  constructor({
    physicsWorld,
    chassisMesh,
    wheelMesh,
    position,
    quaternion
  }) {
    chassisMesh.position.y = .25
    this.mesh = new THREE.Group
    this.mesh.add(chassisMesh)
    this.chassisMesh = chassisMesh

    if (position) this.chassisMesh.position.copy(position)
    if (quaternion) this.chassisMesh.quaternion.copy(quaternion)

    const width = 1.8, height = .6, length = 4
    const size = new Ammo.btVector3(width * .5, height * .5, length * .5)
    const shape = new Ammo.btBoxShape(size)
    this.chassisBody = createRigidBody({ mesh: chassisMesh, mass: 800, shape })
    physicsWorld.addRigidBody(this.chassisBody)

    const tuning = new Ammo.btVehicleTuning()
    const rayCaster = new Ammo.btDefaultVehicleRaycaster(physicsWorld)
    this.vehicle = new Ammo.btRaycastVehicle(tuning, this.chassisBody, rayCaster)
    this.vehicle.setCoordinateSystem(0, 1, 2)
    physicsWorld.addAction(this.vehicle)

    this.addWheelMeshes(wheelMesh)
    this.createWheels(tuning)
  }

  addWheelMeshes(wheelMesh) {
    this.wheelMeshes = []
    for (let i = 0; i < 4; i++) {
      const mesh = wheelMesh.clone()
      if (i == 0 || i == 3) mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI)
      this.wheelMeshes.push(mesh)
      this.mesh.add(mesh)
    }
  }

  createWheels(tuning) {
    const wheelFront = { x: 1.15, y: .3, z: 1.55 }
    const wheelBack = { x: 1.15, y: .3, z: -1.8 }
    const wheelRadiusFront = .45
    const wheelRadiusBack = .45

    this.createWheel(true, new Ammo.btVector3(wheelFront.x, wheelFront.y, wheelFront.z), wheelRadiusFront, tuning)
    this.createWheel(true, new Ammo.btVector3(-wheelFront.x, wheelFront.y, wheelFront.z), wheelRadiusFront, tuning)
    this.createWheel(false, new Ammo.btVector3(-wheelBack.x, wheelBack.y, wheelBack.z), wheelRadiusBack, tuning)
    this.createWheel(false, new Ammo.btVector3(wheelBack.x, wheelBack.y, wheelBack.z), wheelRadiusBack, tuning)
  }

  createWheel(isFront, position, radius, tuning) {
    const friction = 1000
    const suspensionStiffness = 20.0
    const suspensionDamping = 2.3
    const suspensionCompression = 4.4
    const suspensionRestLength = 0.6
    const rollInfluence = 0.2

    const wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0)
    const wheelAxleCS = new Ammo.btVector3(-1, 0, 0)

    const wheelInfo = this.vehicle.addWheel(
      position, wheelDirectionCS0, wheelAxleCS, suspensionRestLength,
      radius, tuning, isFront
    )

    wheelInfo.set_m_suspensionStiffness(suspensionStiffness)
    wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping)
    wheelInfo.set_m_wheelsDampingCompression(suspensionCompression)

    wheelInfo.set_m_frictionSlip(friction)
    wheelInfo.set_m_rollInfluence(rollInfluence)
  }

  updatePhysics() {
    const { vehicle, wheelMeshes } = this

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
    this.chassisMesh.position.set(position.x(), position.y(), position.z())
    this.chassisMesh.quaternion.set(quaternion.x(), quaternion.y(), quaternion.z(), quaternion.w())
  }

  updateKeyboard() {
    const { vehicle } = this
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

    vehicle.applyEngineForce(engineForce, BACK_LEFT)
    vehicle.applyEngineForce(engineForce, BACK_RIGHT)

    vehicle.setBrake(breakingForce / 2, FRONT_LEFT)
    vehicle.setBrake(breakingForce / 2, FRONT_RIGHT)
    vehicle.setBrake(breakingForce, BACK_LEFT)
    vehicle.setBrake(breakingForce, BACK_RIGHT)

    vehicle.setSteeringValue(vehicleSteering, FRONT_LEFT)
    vehicle.setSteeringValue(vehicleSteering, FRONT_RIGHT)

    this.updatePhysics()
  }
}