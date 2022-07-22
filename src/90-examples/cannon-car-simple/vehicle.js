import * as THREE from '/node_modules/three127/build/three.module.js'
import * as CANNON from '/libs/cannon-es.js'
import keyboard from '/classes/Keyboard.js'

function createChassis() {
  const shape = new CANNON.Box(new CANNON.Vec3(1, 0.3, 2))
  const chassisBody = new CANNON.Body({ mass: 150 })
  chassisBody.addShape(shape)
  chassisBody.position.set(0, 0.2, 0)

  const geometry = new THREE.BoxGeometry(2, 0.6, 4)
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide })
  const chassis = new THREE.Mesh(geometry, material)
  chassis.body = chassisBody
  return { chassis }
}

function createWheels(vehicle) {
  const params = {
    radius: 0.3,
    directionLocal: new CANNON.Vec3(0, -1, 0),
    chassisConnectionPointLocal: new CANNON.Vec3(0, 0, 0),
    suspensionRestLength: 0.6,
    frictionSlip: 0.5,
  }
  const width = 0.75
  const length = 1.1

  params.chassisConnectionPointLocal.set(width, 0, -length)
  vehicle.addWheel(params)

  params.chassisConnectionPointLocal.set(-width, 0, -length)
  vehicle.addWheel(params)

  params.chassisConnectionPointLocal.set(width, 0, length)
  vehicle.addWheel(params)

  params.chassisConnectionPointLocal.set(-width, 0, length)
  vehicle.addWheel(params)

  const wheelMeshes = []

  vehicle.wheelInfos.forEach(wheel => {
    const shape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20)
    const body = new CANNON.Body({ mass: 1, material: new CANNON.Material() })
    const q = new CANNON.Quaternion()
    q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
    body.addShape(shape, new CANNON.Vec3(), q)
    const geometry = new THREE.CylinderGeometry(wheel.radius, wheel.radius, 0.4, 32)
    const material = new THREE.MeshPhongMaterial({
      color: 0x444444,
      side: THREE.DoubleSide,
      flatShading: true,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.geometry.rotateZ(Math.PI / 2)
    mesh.body = body
    wheelMeshes.push(mesh)
  })
  return { wheelMeshes }
}

function createVehicle(chassisBody) {
  const vehicle = new CANNON.RaycastVehicle({
    chassisBody,
    indexRightAxis: 0, // x
    indexUpAxis: 1, // y
    indexForwardAxis: 2, // z
  })
  return { vehicle }
}

export default class Car {
  constructor() {
    const { chassis } = createChassis()
    const { vehicle } = createVehicle(chassis.body)
    const { wheelMeshes } = createWheels(vehicle)
    this.vehicle = vehicle
    this.chassis = chassis
    this.wheelMeshes = wheelMeshes
  }

  handleInput() {
    const { vehicle } = this
    const brakeForce = keyboard.pressed.Space ? 10 : 0
    const engineForce = 800
    const maxSteerVal = 0.5

    if (!keyboard.keyPressed) {
      vehicle.applyEngineForce(0, 1)
      vehicle.applyEngineForce(0, 1)
      return
    }

    vehicle.setBrake(brakeForce, 0)
    vehicle.setBrake(brakeForce, 1)
    vehicle.setBrake(brakeForce, 2)
    vehicle.setBrake(brakeForce, 3)

    if (keyboard.down) {
      vehicle.applyEngineForce(-engineForce, 0)
      vehicle.applyEngineForce(-engineForce, 1)
    }

    if (keyboard.up) {
      vehicle.applyEngineForce(engineForce, 0)
      vehicle.applyEngineForce(engineForce, 1)
    }

    if (keyboard.left) {
      vehicle.setSteeringValue(maxSteerVal, 0)
      vehicle.setSteeringValue(maxSteerVal, 1)
    }

    if (keyboard.right) {
      vehicle.setSteeringValue(-maxSteerVal, 0)
      vehicle.setSteeringValue(-maxSteerVal, 1)
    }
  }

  update() {
    const { wheelMeshes, chassis } = this
    this.handleInput()
    this.vehicle.wheelInfos.forEach((wheel, i) => {
      const t = wheel.worldTransform
      const mesh = wheelMeshes[i]
      mesh.position.copy(t.position)
      mesh.quaternion.copy(t.quaternion)
      mesh.body.position.copy(t.position)
      mesh.body.quaternion.copy(t.quaternion)
    })
    chassis.position.copy(chassis.body.position)
    chassis.quaternion.copy(chassis.body.quaternion)
  }
}
