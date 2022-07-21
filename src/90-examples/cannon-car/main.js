import * as CANNON from './cannon-es.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import keyboard from '/classes/Keyboard.js'
import { createObstacles, createGround } from './cannon-utils.js'
import { createChaseCam, updateChaseCam } from './camera.js'
import { createChassis, createFrontLeftWheel, createFrontRightWheel, createBackLeftWheel, createBackRightWheel } from './vehicle.js'

const physicMeshes = []

initLights()

const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)

const chaseCam = createChaseCam()

const addPhysicMesh = mesh => {
  scene.add(mesh)
  world.addBody(mesh.body)
  physicMeshes.push(mesh)
}

addPhysicMesh(createGround({ size: 100 }))

createObstacles().forEach(mesh => {
  scene.add(mesh)
  world.addBody(mesh.body)
})

const car = createChassis()
car.add(chaseCam)
addPhysicMesh(car)

const wheelLF = createFrontLeftWheel()
addPhysicMesh(wheelLF)

const wheelRF = createFrontRightWheel()
addPhysicMesh(wheelRF)

const wheelLB = createBackLeftWheel()
addPhysicMesh(wheelLB)

const wheelRB = createBackRightWheel()
addPhysicMesh(wheelRB)

const constraintLF = new CANNON.HingeConstraint(car.body, wheelLF.body, {
  pivotA: new CANNON.Vec3(-1, -0.5, -1),
  axisA: new CANNON.Vec3(1, 0, 0),
  maxForce: 0.99,
})
world.addConstraint(constraintLF)

const constraintRF = new CANNON.HingeConstraint(car.body, wheelRF.body, {
  pivotA: new CANNON.Vec3(1, -0.5, -1),
  axisA: new CANNON.Vec3(1, 0, 0),
  maxForce: 0.99,
})
world.addConstraint(constraintRF)

const constraintLB = new CANNON.HingeConstraint(car.body, wheelLB.body, {
  pivotA: new CANNON.Vec3(-1, -0.5, 1),
  axisA: new CANNON.Vec3(1, 0, 0),
  maxForce: 0.99,
})
world.addConstraint(constraintLB)

const constraintRB = new CANNON.HingeConstraint(car.body, wheelRB.body, {
  pivotA: new CANNON.Vec3(1, -0.5, 1),
  axisA: new CANNON.Vec3(1, 0, 0),
  maxForce: 0.99,
})
world.addConstraint(constraintRB)

constraintLF.enableMotor()
constraintRF.enableMotor()
let forwardVelocity = 0
let turnAngle = 0

/* FUNCTIONS */

const updateCar = () => physicMeshes.forEach(mesh => {
  mesh.position.copy(mesh.body.position)
  mesh.quaternion.copy(mesh.body.quaternion)
})

/* LOOP */

let thrusting = false

void function loop() {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()
  world.step(delta)

  updateCar()
  thrusting = false

  if (keyboard.up) {
    if (forwardVelocity < 30.0) forwardVelocity += 1
    thrusting = true
  }
  if (keyboard.down) {
    if (forwardVelocity > -30.0) forwardVelocity -= 1
    thrusting = true
  }
  if (keyboard.left)
    if (turnAngle > -1.0) turnAngle -= 0.1

  if (keyboard.right)
    if (turnAngle < 1.0) turnAngle += 0.1

  if (keyboard.pressed.Space) {
    if (forwardVelocity > 0)
      forwardVelocity -= 1
    if (forwardVelocity < 0)
      forwardVelocity += 1
  }

  if (!thrusting) {
    if (forwardVelocity > 0)
      forwardVelocity -= 0.25
    if (forwardVelocity < 0)
      forwardVelocity += 0.25
  }

  constraintLF.setMotorSpeed(forwardVelocity)
  constraintRF.setMotorSpeed(forwardVelocity)
  constraintLF.axisA.z = turnAngle
  constraintRF.axisA.z = turnAngle

  updateChaseCam(chaseCam, car)

  renderer.render(scene, camera)
}()