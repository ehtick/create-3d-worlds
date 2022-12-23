import * as THREE from 'three'

import { Ammo, createRigidBody } from '/utils/physics.js'
import keyboard from '/utils/classes/Keyboard.js'
import { getSize } from '/utils/helpers.js'

const FRONT_LEFT = 0
const FRONT_RIGHT = 1
const BACK_LEFT = 2
const BACK_RIGHT = 3

const steeringIncrement = .04
const steeringClamp = .5
const maxEngineForce = 2000
const maxBreakingForce = 100

function updateMesh(mesh, transform) {
  const position = transform.getOrigin()
  const quaternion = transform.getRotation()
  mesh.position.set(position.x(), position.y(), position.z())
  mesh.quaternion.set(quaternion.x(), quaternion.y(), quaternion.z(), quaternion.w())
}

export default class Vehicle {
  constructor({ physicsWorld, chassisMesh, wheelMesh, position, quaternion, mass = 800 }) {
    this.mesh = new THREE.Group
    this.mesh.add(chassisMesh)
    this.chassisMesh = chassisMesh
    this.wheelMesh = wheelMesh

    if (position) chassisMesh.position.copy(position)
    if (quaternion) chassisMesh.quaternion.copy(quaternion)

    const { x: width, y: height, z: length } = getSize(chassisMesh)
    const shape = new Ammo.btBoxShape(new Ammo.btVector3(width * .5, height * .25, length * .5))
    this.body = createRigidBody({ mesh: chassisMesh, mass, shape })
    physicsWorld.addRigidBody(this.body)

    const tuning = new Ammo.btVehicleTuning()
    const rayCaster = new Ammo.btDefaultVehicleRaycaster(physicsWorld)
    this.vehicle = new Ammo.btRaycastVehicle(tuning, this.body, rayCaster)
    this.vehicle.setCoordinateSystem(0, 1, 2)
    physicsWorld.addAction(this.vehicle)

    this.createWheels(tuning)
    this.addWheelMeshes(wheelMesh)

    this.vehicleSteering = 0
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
    const { y } = getSize(this.wheelMesh)
    const wheelFront = { x: 1.15, y: y * .25, z: 1.55 }
    const wheelBack = { x: 1.15, y: y * .25, z: -1.8 }
    const wheelRadiusFront = y * .5
    const wheelRadiusBack = y * .5

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

  updateMeshes() {
    const { vehicle, wheelMeshes } = this

    const numWheels = vehicle.getNumWheels()
    for (let i = 0; i < numWheels; i++) {
      vehicle.updateWheelTransform(i, true)
      updateMesh(wheelMeshes[i], vehicle.getWheelTransformWS(i))
    }

    updateMesh(this.chassisMesh, vehicle.getChassisWorldTransform())
  }

  updatePhysics(engineForce, breakingForce) {
    const { vehicle } = this
    vehicle.applyEngineForce(engineForce, BACK_LEFT)
    vehicle.applyEngineForce(engineForce, BACK_RIGHT)

    vehicle.setBrake(breakingForce / 2, FRONT_LEFT)
    vehicle.setBrake(breakingForce / 2, FRONT_RIGHT)
    vehicle.setBrake(breakingForce, BACK_LEFT)
    vehicle.setBrake(breakingForce, BACK_RIGHT)

    vehicle.setSteeringValue(this.vehicleSteering, FRONT_LEFT)
    vehicle.setSteeringValue(this.vehicleSteering, FRONT_RIGHT)
  }

  update() {
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
      if (this.vehicleSteering < steeringClamp)
        this.vehicleSteering += steeringIncrement
    } else if (keyboard.right) {
      if (this.vehicleSteering > -steeringClamp)
        this.vehicleSteering -= steeringIncrement
    } else if (this.vehicleSteering < -steeringIncrement)
      this.vehicleSteering += steeringIncrement
    else if (this.vehicleSteering > steeringIncrement)
      this.vehicleSteering -= steeringIncrement
    else
      this.vehicleSteering = 0

    this.updatePhysics(engineForce, breakingForce)
    this.updateMeshes()
  }
}