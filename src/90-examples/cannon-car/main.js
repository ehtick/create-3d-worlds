import * as THREE from '/node_modules/three127/build/three.module.js'
import * as CANNON from './cannon-es.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import keyboard from '/classes/Keyboard.js'
import { createObstacles, createGround, createCar, createChaseCam, createFrontLeftWheel, createFrontRightWheel, createBackLeftWheel, createBackRightWheel } from './cannon-utils.js'

const physicMeshes = []

initLights()

const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)

const chaseCam = createChaseCam()
const camPivot = chaseCam.getObjectByName('pivot')

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

const car = createCar()
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

// rear wheel drive
constraintLB.enableMotor()
constraintRB.enableMotor()
let forwardVelocity = 0
let sideVelocity = 0

/* LOOP */

const v = new THREE.Vector3()
let thrusting = false

const updateCar = () => physicMeshes.forEach(mesh => {
  mesh.position.copy(mesh.body.position)
  mesh.quaternion.copy(mesh.body.quaternion)
})

void function loop() {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()
  world.step(delta)
  updateCar()
  thrusting = false

  if (keyboard.up) {
    if (forwardVelocity < 100.0) forwardVelocity += 1
    thrusting = true
  }
  if (keyboard.down) {
    if (forwardVelocity > -100.0) forwardVelocity -= 1
    thrusting = true
  }
  if (keyboard.left)
    if (sideVelocity > -1.0) sideVelocity -= 0.1

  if (keyboard.right)
    if (sideVelocity < 1.0) sideVelocity += 0.1

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
  constraintLB.setMotorSpeed(forwardVelocity)
  constraintRB.setMotorSpeed(forwardVelocity)
  constraintLF.axisA.z = sideVelocity
  constraintRF.axisA.z = sideVelocity
  camera.lookAt(car.position)
  camPivot.getWorldPosition(v)

  if (v.y < 1) v.y = 1

  camera.position.lerpVectors(camera.position, v, 0.05)
  renderer.render(scene, camera)
}()