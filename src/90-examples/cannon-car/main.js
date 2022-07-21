import * as CANNON from './cannon-es.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import keyboard from '/classes/Keyboard.js'
import { createObstacles, createGround } from './cannon-utils.js'
import { createChaseCam, updateChaseCam } from './camera.js'
import { Car } from './vehicle.js'

initLights()

const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)

const chaseCam = createChaseCam()

const addPhysicMesh = mesh => {
  scene.add(mesh)
  world.addBody(mesh.body)
}

const ground = createGround({ size: 100 })
addPhysicMesh(ground)

const obstacles = createObstacles()
obstacles.forEach(addPhysicMesh)

const car = new Car()
car.meshes.forEach(addPhysicMesh)
car.chassis.add(chaseCam)

const constraintLF = new CANNON.HingeConstraint(car.chassis.body, car.wheelLF.body, {
  pivotA: new CANNON.Vec3(-1, -0.5, -1),
  axisA: new CANNON.Vec3(1, 0, 0),
  maxForce: 0.99,
})
world.addConstraint(constraintLF)

const constraintRF = new CANNON.HingeConstraint(car.chassis.body, car.wheelRF.body, {
  pivotA: new CANNON.Vec3(1, -0.5, -1),
  axisA: new CANNON.Vec3(1, 0, 0),
  maxForce: 0.99,
})
world.addConstraint(constraintRF)

const constraintLB = new CANNON.HingeConstraint(car.chassis.body, car.wheelLB.body, {
  pivotA: new CANNON.Vec3(-1, -0.5, 1),
  axisA: new CANNON.Vec3(1, 0, 0),
  maxForce: 0.99,
})
world.addConstraint(constraintLB)

const constraintRB = new CANNON.HingeConstraint(car.chassis.body, car.wheelRB.body, {
  pivotA: new CANNON.Vec3(1, -0.5, 1),
  axisA: new CANNON.Vec3(1, 0, 0),
  maxForce: 0.99,
})
world.addConstraint(constraintRB)

constraintLF.enableMotor()
constraintRF.enableMotor()
let forwardVelocity = 0
let turnAngle = 0

/* LOOP */

let thrusting = false

void function loop() {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()
  world.step(delta)

  car.update()
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

  updateChaseCam(chaseCam, car.chassis)

  renderer.render(scene, camera)
}()