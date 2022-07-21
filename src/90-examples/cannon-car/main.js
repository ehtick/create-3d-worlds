import * as THREE from '/node_modules/three127/build/three.module.js'
import * as CANNON from './cannon-es.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import keyboard from '/classes/Keyboard.js'
import { createObstacles, createGround, createCar, createChaseCam, createFrontLeftWheel, createFrontRightWheel, createBackLeftWheel, createBackRightWheel } from './cannon-utils.js'

initLights()

const chaseCam = createChaseCam()

const phongMaterial = new THREE.MeshPhongMaterial()
const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)

const wheelMaterial = new CANNON.Material()
wheelMaterial.friction = 0.25
wheelMaterial.restitution = 0.25

const add = mesh => {
  scene.add(mesh)
  world.addBody(mesh.body)
}

add(createGround({ size: 100 }))

createObstacles().forEach(add)

const car = createCar()
car.add(chaseCam)
add(car)

const wheelLF = createFrontLeftWheel()
add(wheelLF)

const wheelRF = createFrontRightWheel()
add(wheelRF)

const wheelLB = createBackLeftWheel()
add(wheelLB)

const wheelRB = createBackRightWheel()
add(wheelRB)

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

const physicMeshes = [car, wheelLF, wheelRF, wheelLB, wheelRB]

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
  chaseCam.children[0].getWorldPosition(v) // pivot

  if (v.y < 1) v.y = 1

  camera.position.lerpVectors(camera.position, v, 0.05)
  renderer.render(scene, camera)
}()