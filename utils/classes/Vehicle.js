import * as THREE from '/node_modules/three/build/three.module.js'
import * as CANNON from '/libs/cannon-es.js'
import keyboard from '/utils/classes/Keyboard.js'
import { world } from '/utils/physics-cannon.js'

const maxAngle = .75
const maxVelocity = 35

const frontWheelSize = .33
const frontWheelWidth = .25
const backWheelSize = .5
const backWheelWidth = .33

function createChassis() {
  const geometry = new THREE.BoxGeometry(1, 1, 2)
  const material = new THREE.MeshPhongMaterial({ color: 0xDC143C })
  const mesh = new THREE.Mesh(geometry, material)
  const box = new THREE.Mesh(new THREE.CylinderGeometry(.4, .4, .5), material)
  box.translateY(.5)
  box.translateZ(.3)
  mesh.add(box)
  mesh.position.y = 3
  mesh.castShadow = true
  const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 1))
  const body = new CANNON.Body({ mass: 5 })
  body.addShape(shape)
  body.position.copy(mesh.position)
  mesh.body = body
  return mesh
}

function createWheel({ size, width, position }) {
  const geometry = new THREE.CylinderGeometry(size, size, width)
  geometry.rotateZ(Math.PI / 2)
  const material = new THREE.MeshPhongMaterial({ color: 0x333333 })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = true
  mesh.position.set(...position)
  const shape = new CANNON.Cylinder(size, size, width, 20)
  const cannonMaterial = new CANNON.Material()
  cannonMaterial.friction = 0.4
  cannonMaterial.restitution = 0.25
  const body = new CANNON.Body({ mass: .1, material: cannonMaterial })
  const q = new CANNON.Quaternion()
  q.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI / 2)
  body.addShape(shape, new CANNON.Vec3(), q)
  body.position.set(...position)
  mesh.body = body
  return mesh
}

const createConstraint = (chassis, wheel, pos) => new CANNON.HingeConstraint(chassis.body, wheel.body, {
  pivotA: new CANNON.Vec3(...pos),
  axisA: new CANNON.Vec3(1, 0, 0),
  maxForce: 0.99,
})

export default class Vehicle {
  constructor() {
    this.turnAngle = 0
    this.velocity = 0
    this.thrusting = false

    this.chassis = createChassis()
    const wheelLF = createWheel({ size: frontWheelSize, width: frontWheelWidth, position: [-1, 3, -1] })
    const wheelRF = createWheel({ size: frontWheelSize, width: frontWheelWidth, position: [1, 3, -1] })
    const wheelLB = createWheel({ size: backWheelSize, width: backWheelWidth, position: [-1, 3, 1] })
    const wheelRB = createWheel({ size: backWheelSize, width: backWheelWidth, position: [1, 3, 1] })
    this.meshes = [this.chassis, wheelLF, wheelRF, wheelLB, wheelRB]

    this.frontLeftWheel = createConstraint(this.chassis, wheelLF, [-.8, -backWheelSize, -1])
    this.frontRightWheel = createConstraint(this.chassis, wheelRF, [.8, -backWheelSize, -1])
    this.backLeftWheel = createConstraint(this.chassis, wheelLB, [-.8, -frontWheelSize, 1])
    this.backRightWheel = createConstraint(this.chassis, wheelRB, [.8, -frontWheelSize, 1])

    this.frontLeftWheel.enableMotor()
    this.frontRightWheel.enableMotor()

    world.addConstraint(this.frontLeftWheel)
    world.addConstraint(this.frontRightWheel)
    world.addConstraint(this.backLeftWheel)
    world.addConstraint(this.backRightWheel)
  }

  handleInput() {
    this.thrusting = false

    if (keyboard.up) {
      if (this.velocity < maxVelocity) this.velocity += .3
      this.thrusting = true
    }
    if (keyboard.down) {
      if (this.velocity > -maxVelocity) this.velocity -= .3
      this.thrusting = true
    }
    if (keyboard.left)
      if (this.turnAngle > -maxAngle) this.turnAngle -= 0.05

    if (keyboard.right)
      if (this.turnAngle < maxAngle) this.turnAngle += 0.05

    if (keyboard.pressed.Space) {
      if (this.velocity > 0)
        this.velocity -= 1
      if (this.velocity < 0)
        this.velocity += 1
    }

    if (!this.thrusting) {
      if (this.velocity > 0)
        this.velocity -= 0.25
      if (this.velocity < 0)
        this.velocity += 0.25
    }
  }

  update() {
    this.handleInput()

    this.frontLeftWheel.setMotorSpeed(this.velocity)
    this.frontRightWheel.setMotorSpeed(this.velocity)
    this.frontLeftWheel.axisA.z = this.turnAngle
    this.frontRightWheel.axisA.z = this.turnAngle

    this.meshes.forEach(mesh => {
      mesh.position.copy(mesh.body.position)
      mesh.quaternion.copy(mesh.body.quaternion)
    })
  }
}