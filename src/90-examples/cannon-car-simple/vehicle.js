import * as THREE from '/node_modules/three127/build/three.module.js'
import * as CANNON from '/libs/cannon-es.js'
import keyboard from '/classes/Keyboard.js'

function createChassis() {
  const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.3, 2))
  const chassisBody = new CANNON.Body({ mass: 150 })
  chassisBody.addShape(chassisShape)
  chassisBody.position.set(0, 0.2, 0)
  chassisBody.angularVelocity.set(0, 0, 0) // initial velocity

  const geometry = new THREE.BoxGeometry(2, 0.6, 4)
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide })
  const chassis = new THREE.Mesh(geometry, material)
  return { chassis, chassisBody }
}

function createWheels(vehicle) {
  const wheelMaterial = new CANNON.Material()
  const wheelOptions = {
    radius: 0.3,
    directionLocal: new CANNON.Vec3(0, -1, 0),
    chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
    suspensionStiffness: 45,
    suspensionRestLength: 0.4,
    frictionSlip: 5,
    dampingRelaxation: 2.3,
    dampingCompression: 4.5,
    maxSuspensionForce: 200000,
    rollInfluence: 0.01,
    axleLocal: new CANNON.Vec3(-1, 0, 0),
    maxSuspensionTravel: 0.25,
    customSlidingRotationalSpeed: -30,
    useCustomSlidingRotationalSpeed: true,
  }

  const axlewidth = 0.7
  wheelOptions.chassisConnectionPointLocal.set(axlewidth, 0, -1)
  vehicle.addWheel(wheelOptions)

  wheelOptions.chassisConnectionPointLocal.set(-axlewidth, 0, -1)
  vehicle.addWheel(wheelOptions)

  wheelOptions.chassisConnectionPointLocal.set(axlewidth, 0, 1)
  vehicle.addWheel(wheelOptions)

  wheelOptions.chassisConnectionPointLocal.set(-axlewidth, 0, 1)
  vehicle.addWheel(wheelOptions)

  const wheelBodies = [], wheelMeshes = []

  vehicle.wheelInfos.forEach(wheel => {
    const shape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20)
    const body = new CANNON.Body({ mass: 1, material: wheelMaterial })
    const q = new CANNON.Quaternion()
    q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
    body.addShape(shape, new CANNON.Vec3(), q)
    wheelBodies.push(body)
    const geometry = new THREE.CylinderGeometry(wheel.radius, wheel.radius, 0.4, 32)
    const material = new THREE.MeshPhongMaterial({
      color: 0x444444,
      side: THREE.DoubleSide,
      flatShading: true,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.geometry.rotateZ(Math.PI / 2)
    wheelMeshes.push(mesh)
  })
  return { wheelBodies, wheelMeshes }
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
    const { chassis, chassisBody } = createChassis()
    const { vehicle } = createVehicle(chassisBody)
    const { wheelBodies, wheelMeshes } = createWheels(vehicle)
    this.vehicle = vehicle
    this.chassis = chassis
    this.chassisBody = chassisBody
    this.wheelBodies = wheelBodies
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
    const { wheelBodies, wheelMeshes, chassis, chassisBody } = this
    this.handleInput()
    this.vehicle.wheelInfos.forEach((wheel, i) => {
      const t = wheel.worldTransform
      wheelBodies[i].position.copy(t.position)
      wheelBodies[i].quaternion.copy(t.quaternion)
      wheelMeshes[i].position.copy(t.position)
      wheelMeshes[i].quaternion.copy(t.quaternion)
    })
    chassis.position.copy(chassisBody.position)
    chassis.quaternion.copy(chassisBody.quaternion)
  }
}
