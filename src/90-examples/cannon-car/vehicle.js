import * as THREE from '/node_modules/three127/build/three.module.js'
import * as CANNON from './cannon-es.js'
import keyboard from '/classes/Keyboard.js'

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
  const carBodyShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 1))
  const body = new CANNON.Body({ mass: 5 })
  body.addShape(carBodyShape)
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
  const shape = new CANNON.Sphere(size)
  const wheelMaterial = new CANNON.Material()
  wheelMaterial.friction = 0.25
  wheelMaterial.restitution = 0.25
  const body = new CANNON.Body({ mass: 1, material: wheelMaterial })
  body.addShape(shape)
  body.position.set(...position)
  mesh.body = body
  return mesh
}

const createConstraint = (chassis, wheel, pos) => new CANNON.HingeConstraint(chassis.body, wheel.body, {
  pivotA: new CANNON.Vec3(...pos),
  axisA: new CANNON.Vec3(1, 0, 0),
  maxForce: 0.99,
})

const maxAngle = .75
const maxVelocity = 30

export class Car {
  constructor() {
    this.turnAngle = 0
    this.velocity = 0
    this.thrusting = false

    this.chassis = createChassis()
    this.wheelLF = createWheel({ size: .33, width: .2, position: [-1, 3, -1] })
    this.wheelRF = createWheel({ size: .33, width: .2, position: [1, 3, -1] })
    this.wheelLB = createWheel({ size: .5, width: .33, position: [-1, 3, 1] })
    this.wheelRB = createWheel({ size: .5, width: .33, position: [1, 3, 1] })
    this.meshes = [this.chassis, this.wheelLF, this.wheelRF, this.wheelLB, this.wheelRB]

    this.frontLeftWheel = createConstraint(this.chassis, this.wheelLF, [-.8, -0.5, -1])
    this.frontRightWheel = createConstraint(this.chassis, this.wheelRF, [.8, -0.5, -1])
    this.backLeftWheel = createConstraint(this.chassis, this.wheelLB, [-.8, -0.33, 1])
    this.backRightWheel = createConstraint(this.chassis, this.wheelRB, [.8, -0.33, 1])

    this.frontLeftWheel.enableMotor()
    this.frontRightWheel.enableMotor()
  }

  handleInput() {
    this.thrusting = false

    if (keyboard.up) {
      if (this.velocity < maxVelocity) this.velocity += 1
      this.thrusting = true
    }
    if (keyboard.down) {
      if (this.velocity > -maxVelocity) this.velocity -= 1
      this.thrusting = true
    }
    if (keyboard.left)
      if (this.turnAngle > -maxAngle) this.turnAngle -= 0.1

    if (keyboard.right)
      if (this.turnAngle < maxAngle) this.turnAngle += 0.1

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