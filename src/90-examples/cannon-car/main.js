import * as THREE from '/node_modules/three127/build/three.module.js'
import * as CANNON from './cannon-es.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'
import keyboard from '/classes/Keyboard.js'

initLights()

const chaseCam = new THREE.Object3D()
chaseCam.position.set(0, 0, 0)
const chaseCamPivot = new THREE.Object3D()
chaseCamPivot.position.set(0, 2, 4)
chaseCam.add(chaseCamPivot)

const phongMaterial = new THREE.MeshPhongMaterial()
const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)
const groundMaterial = new CANNON.Material()
groundMaterial.friction = 0.25
groundMaterial.restitution = 0.25
const wheelMaterial = new CANNON.Material()
wheelMaterial.friction = 0.25
wheelMaterial.restitution = 0.25

const groundMesh = createFloor({ size: 100 })
scene.add(groundMesh)

const groundShape = new CANNON.Box(new CANNON.Vec3(50, 1, 50))
const groundBody = new CANNON.Body({ mass: 0, material: groundMaterial })
groundBody.addShape(groundShape)
groundBody.position.set(0, -1, 0)
world.addBody(groundBody)

// jumps (prepreke)
for (let i = 0; i < 100; i++) {
  const jump = new THREE.Mesh(new THREE.CylinderGeometry(0, 1, 0.5, 5), phongMaterial)
  jump.position.x = Math.random() * 100 - 50
  jump.position.y = 0.5
  jump.position.z = Math.random() * 100 - 50
  scene.add(jump)
  const cylinderShape = new CANNON.Cylinder(0.01, 1, 0.5, 5)
  const cylinderBody = new CANNON.Body({ mass: 0 })
  cylinderBody.addShape(cylinderShape, new CANNON.Vec3())
  cylinderBody.position.x = jump.position.x
  cylinderBody.position.y = jump.position.y
  cylinderBody.position.z = jump.position.z
  world.addBody(cylinderBody)
}

const carBodyGeometry = new THREE.BoxGeometry(1, 1, 2)
const car = new THREE.Mesh(carBodyGeometry, phongMaterial)
car.position.y = 3
car.castShadow = true
scene.add(car)
car.add(chaseCam)
const carBodyShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 1))
const carBody = new CANNON.Body({ mass: 1 })
carBody.addShape(carBodyShape)
carBody.position.x = car.position.x
carBody.position.y = car.position.y
carBody.position.z = car.position.z
world.addBody(carBody)

// front left wheel
const wheelLFGeometry = new THREE.CylinderGeometry(0.33, 0.33, 0.2)
wheelLFGeometry.rotateZ(Math.PI / 2)
const wheelLF = new THREE.Mesh(wheelLFGeometry, phongMaterial)
wheelLF.position.x = -1
wheelLF.position.y = 3
wheelLF.position.z = -1
wheelLF.castShadow = true
scene.add(wheelLF)
const wheelLFShape = new CANNON.Sphere(0.33)
const wheelLFBody = new CANNON.Body({ mass: 1, material: wheelMaterial })
wheelLFBody.addShape(wheelLFShape)
wheelLFBody.position.x = wheelLF.position.x
wheelLFBody.position.y = wheelLF.position.y
wheelLFBody.position.z = wheelLF.position.z
world.addBody(wheelLFBody)

// front right wheel
const wheelRFGeometry = new THREE.CylinderGeometry(0.33, 0.33, 0.2)
wheelRFGeometry.rotateZ(Math.PI / 2)
const wheelRF = new THREE.Mesh(wheelRFGeometry, phongMaterial)
wheelRF.position.y = 3
wheelRF.position.x = 1
wheelRF.position.z = -1
wheelRF.castShadow = true
scene.add(wheelRF)
const wheelRFShape = new CANNON.Sphere(0.33)
const wheelRFBody = new CANNON.Body({ mass: 1, material: wheelMaterial })
wheelRFBody.addShape(wheelRFShape)
wheelRFBody.position.x = wheelRF.position.x
wheelRFBody.position.y = wheelRF.position.y
wheelRFBody.position.z = wheelRF.position.z
world.addBody(wheelRFBody)

// back left wheel
const wheelLBGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.33)
wheelLBGeometry.rotateZ(Math.PI / 2)
const wheelLB = new THREE.Mesh(wheelLBGeometry, phongMaterial)
wheelLB.position.y = 3
wheelLB.position.x = -1
wheelLB.position.z = 1
wheelLB.castShadow = true
scene.add(wheelLB)
const wheelLBShape = new CANNON.Sphere(0.4)
const wheelLBBody = new CANNON.Body({ mass: 1, material: wheelMaterial })
wheelLBBody.addShape(wheelLBShape)
wheelLBBody.position.x = wheelLB.position.x
wheelLBBody.position.y = wheelLB.position.y
wheelLBBody.position.z = wheelLB.position.z
world.addBody(wheelLBBody)

// back right wheel
const wheelRBGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.33)
wheelRBGeometry.rotateZ(Math.PI / 2)
const wheelRB = new THREE.Mesh(wheelRBGeometry, phongMaterial)
wheelRB.position.y = 3
wheelRB.position.x = 1
wheelRB.position.z = 1
wheelRB.castShadow = true
scene.add(wheelRB)
const wheelRBShape = new CANNON.Sphere(0.4)
const wheelRBBody = new CANNON.Body({ mass: 1, material: wheelMaterial })
wheelRBBody.addShape(wheelRBShape)
wheelRBBody.position.x = wheelRB.position.x
wheelRBBody.position.y = wheelRB.position.y
wheelRBBody.position.z = wheelRB.position.z
world.addBody(wheelRBBody)
const leftFrontAxis = new CANNON.Vec3(1, 0, 0)
const rightFrontAxis = new CANNON.Vec3(1, 0, 0)
const leftBackAxis = new CANNON.Vec3(1, 0, 0)
const rightBackAxis = new CANNON.Vec3(1, 0, 0)
const constraintLF = new CANNON.HingeConstraint(carBody, wheelLFBody, {
  pivotA: new CANNON.Vec3(-1, -0.5, -1),
  axisA: leftFrontAxis,
  maxForce: 0.99,
})
world.addConstraint(constraintLF)
const constraintRF = new CANNON.HingeConstraint(carBody, wheelRFBody, {
  pivotA: new CANNON.Vec3(1, -0.5, -1),
  axisA: rightFrontAxis,
  maxForce: 0.99,
})
world.addConstraint(constraintRF)
const constraintLB = new CANNON.HingeConstraint(carBody, wheelLBBody, {
  pivotA: new CANNON.Vec3(-1, -0.5, 1),
  axisA: leftBackAxis,
  maxForce: 0.99,
})
world.addConstraint(constraintLB)
const constraintRB = new CANNON.HingeConstraint(carBody, wheelRBBody, {
  pivotA: new CANNON.Vec3(1, -0.5, 1),
  axisA: rightBackAxis,
  maxForce: 0.99,
})
world.addConstraint(constraintRB)

// rear wheel drive
constraintLB.enableMotor()
constraintRB.enableMotor()
let forwardVelocity = 0
let rightVelocity = 0

/* LOOP */

const v = new THREE.Vector3()
let thrusting = false

void function loop() {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()
  world.step(delta)
  car.position.copy(carBody.position)
  car.quaternion.copy(carBody.quaternion)
  wheelLF.position.copy(wheelLFBody.position)
  wheelLF.quaternion.copy(wheelLFBody.quaternion)
  wheelRF.position.copy(wheelRFBody.position)
  wheelRF.quaternion.copy(wheelRFBody.quaternion)
  wheelLB.position.copy(wheelLBBody.position)
  wheelLB.quaternion.copy(wheelLBBody.quaternion)
  wheelRB.position.copy(wheelRBBody.position)
  wheelRB.quaternion.copy(wheelRBBody.quaternion)
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
    if (rightVelocity > -1.0) rightVelocity -= 0.1

  if (keyboard.right)
    if (rightVelocity < 1.0) rightVelocity += 0.1

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
  constraintLF.axisA.z = rightVelocity
  constraintRF.axisA.z = rightVelocity
  camera.lookAt(car.position)
  chaseCamPivot.getWorldPosition(v)

  if (v.y < 1) v.y = 1

  camera.position.lerpVectors(camera.position, v, 0.05)
  renderer.render(scene, camera)
}()