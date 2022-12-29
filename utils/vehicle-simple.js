import * as THREE from 'three'
import { Ammo, createRigidBody, updateMeshTransform } from '/utils/physics.js'
import { getSize } from '/utils/helpers.js'
import keyboard from '/utils/classes/Keyboard.js'

const FRONT_LEFT = 0
const FRONT_RIGHT = 1
const BACK_LEFT = 2
const BACK_RIGHT = 3

const steeringIncrement = .04
const steeringClamp = .5
const maxEngineForce = 2000
const maxBreakingForce = 100

function createWheel(radius, width) {
  const geometry = new THREE.CylinderGeometry(radius, radius, width, 24, 1)
  geometry.rotateZ(Math.PI / 2)
  const mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color: 0x333333 }))
  return mesh
}

export function createSimpleVehicle({
  physicsWorld, position, width = 1.8, height = .6, length = 4, mass = 800,
} = {}
) {
  const friction = 1000
  const suspensionStiffness = 20.0
  const suspensionDamping = 2.3
  const suspensionCompression = 4.4
  const suspensionRestLength = 0.6
  const rollInfluence = 0.2

  // body
  const shape = new Ammo.btBoxShape(new Ammo.btVector3(width * .5, height * .25, length * .5))
  const body = createRigidBody({ mesh: { position }, mass, shape })
  physicsWorld.addRigidBody(body)

  // Raycast Vehicle
  const tuning = new Ammo.btVehicleTuning()
  const rayCaster = new Ammo.btDefaultVehicleRaycaster(physicsWorld)
  const vehicle = new Ammo.btRaycastVehicle(tuning, body, rayCaster)
  vehicle.setCoordinateSystem(0, 1, 2)
  physicsWorld.addAction(vehicle)

  // Wheels
  const wheelMeshes = []
  const wheelDirection = new Ammo.btVector3(0, -1, 0)
  const wheelAxle = new Ammo.btVector3(-1, 0, 0)

  function addWheel(isFront, position, radius, width, index) {
    const wheelInfo = vehicle.addWheel(
      position,
      wheelDirection,
      wheelAxle,
      suspensionRestLength,
      radius,
      tuning,
      isFront)

    wheelInfo.set_m_suspensionStiffness(suspensionStiffness)
    wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping)
    wheelInfo.set_m_wheelsDampingCompression(suspensionCompression)
    wheelInfo.set_m_frictionSlip(friction)
    wheelInfo.set_m_rollInfluence(rollInfluence)
    wheelMeshes[index] = createWheel(radius, width)
  }

  const wheelAxisFrontPosition = 1.7,
    wheelHalfTrackFront = 1,
    wheelAxisHeightFront = .3,
    wheelRadiusFront = .35,
    wheelWidthFront = .2,

    wheelAxisPositionBack = -1,
    wheelRadiusBack = .4,
    wheelWidthBack = .3,
    wheelHalfTrackBack = 1,
    wheelAxisHeightBack = .3

  addWheel(true, new Ammo.btVector3(wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront, wheelWidthFront, FRONT_LEFT)
  addWheel(true, new Ammo.btVector3(-wheelHalfTrackFront, wheelAxisHeightFront, wheelAxisFrontPosition), wheelRadiusFront, wheelWidthFront, FRONT_RIGHT)
  addWheel(false, new Ammo.btVector3(-wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, wheelWidthBack, BACK_LEFT)
  addWheel(false, new Ammo.btVector3(wheelHalfTrackBack, wheelAxisHeightBack, wheelAxisPositionBack), wheelRadiusBack, wheelWidthBack, BACK_RIGHT)

  return { vehicle, wheelMeshes }
}

export default class Vehicle {
  constructor({ physicsWorld, chassisMesh }) {
    const { x: width, y: height, z: length } = getSize(chassisMesh)
    const { vehicle, wheelMeshes } = createSimpleVehicle({ physicsWorld, width, height, length, position: chassisMesh.position })
    this.vehicle = vehicle
    this.wheelMeshes = wheelMeshes
    this.chassisMesh = chassisMesh

    this.vehicleSteering = 0
  }

  updateMeshes() {
    const { vehicle, wheelMeshes } = this

    const numWheels = vehicle.getNumWheels()
    for (let i = 0; i < numWheels; i++) {
      vehicle.updateWheelTransform(i, true)
      updateMeshTransform(wheelMeshes[i], vehicle.getWheelTransformWS(i))
    }

    updateMeshTransform(this.chassisMesh, vehicle.getChassisWorldTransform())
  }

  update() {
    const { vehicle } = this

    const speed = vehicle.getCurrentSpeedKmHour()
    let engineForce = 0
    let breakingForce = 0

    if (keyboard.up)
      if (speed < 0) breakingForce = maxBreakingForce
      else engineForce = maxEngineForce

    if (keyboard.down)
      if (speed > 0) breakingForce = maxBreakingForce
      else engineForce = -maxEngineForce / 2

    if (keyboard.left)
      if (this.vehicleSteering < steeringClamp)
        this.vehicleSteering += steeringIncrement

    if (keyboard.right)
      if (this.vehicleSteering > -steeringClamp)
        this.vehicleSteering -= steeringIncrement

    if (!keyboard.left && !keyboard.right)
      if (this.vehicleSteering < -steeringIncrement)
        this.vehicleSteering += steeringIncrement
      else if (this.vehicleSteering > steeringIncrement)
        this.vehicleSteering -= steeringIncrement
      else
        this.vehicleSteering = 0

    vehicle.applyEngineForce(engineForce, BACK_LEFT)
    vehicle.applyEngineForce(engineForce, BACK_RIGHT)

    vehicle.setBrake(breakingForce / 2, FRONT_LEFT)
    vehicle.setBrake(breakingForce / 2, FRONT_RIGHT)
    vehicle.setBrake(breakingForce, BACK_LEFT)
    vehicle.setBrake(breakingForce, BACK_RIGHT)

    vehicle.setSteeringValue(this.vehicleSteering, FRONT_LEFT)
    vehicle.setSteeringValue(this.vehicleSteering, FRONT_RIGHT)

    this.updateMeshes()
  }
}