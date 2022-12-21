import * as THREE from 'three'

import { Ammo, createRigidBody } from '/utils/physics.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import keyboard from '/utils/classes/Keyboard.js'
import PhysicsWorld from '/utils/classes/PhysicsWorld.js'

const world = new PhysicsWorld()

const tmpPos = new THREE.Vector3()
const mouseCoords = new THREE.Vector2(), raycaster = new THREE.Raycaster()

const CF_KINEMATIC_OBJECT = 2

camera.position.set(0, 30, 70)
scene.add(createSun({ transparent: true }))

createGround()

const bigBox = createKinematicBox()
world.add(bigBox)

const bigBall = createBall()
world.add(bigBall)

/* FUNCTIONS */

function createGround() {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshPhongMaterial({ color: 0xa0afa4 }))
  mesh.scale.set(100, 2, 100)
  mesh.castShadow = mesh.receiveShadow = true

  world.add(mesh, 0)
}

function createBall() {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(2), new THREE.MeshPhongMaterial({ color: 0xff0505 }))
  mesh.castShadow = mesh.receiveShadow = true
  mesh.position.set(0, 4, 0)

  const body = createRigidBody({ mesh, mass: 1 })
  body.setFriction(4)
  body.setRollingFriction(10)
  mesh.userData.body = body

  return mesh
}

function createKinematicBox() {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshPhongMaterial({ color: 0x30ab78 }))
  mesh.position.set(40, 6, 5)
  mesh.scale.set(10, 10, 10)
  mesh.castShadow = mesh.receiveShadow = true

  const body = createRigidBody({ mesh, mass: 1 })
  body.setFriction(4)
  body.setRollingFriction(10)
  body.setCollisionFlags(CF_KINEMATIC_OBJECT)

  mesh.userData.body = body
  return mesh
}

function moveBall() {
  const scalingFactor = 20

  const moveX = +Boolean(keyboard.pressed.KeyD) - +Boolean(keyboard.pressed.KeyA)
  const moveZ = +Boolean(keyboard.pressed.KeyS) - +Boolean(keyboard.pressed.KeyW)

  if (moveX == 0 && moveZ == 0) return

  const resultantImpulse = new Ammo.btVector3(moveX, 0, moveZ)
  resultantImpulse.op_mul(scalingFactor)

  bigBall.userData.body.setLinearVelocity(resultantImpulse)
}

function moveKinematicBox() {
  const scalingFactor = 0.3

  const moveX = +Boolean(keyboard.pressed.ArrowRight) - +Boolean(keyboard.pressed.ArrowLeft)
  const moveZ = +Boolean(keyboard.pressed.ArrowDown) - +Boolean(keyboard.pressed.ArrowUp)

  tmpPos.set(moveX, 0, moveZ)
  tmpPos.multiplyScalar(scalingFactor)

  bigBox.translateX(tmpPos.x)
  bigBox.translateZ(tmpPos.z)
}

/* LOOP */

void function renderFrame() {
  const deltaTime = clock.getDelta()
  moveBall()
  moveKinematicBox()
  world.update(deltaTime)
  renderer.render(scene, camera)
  requestAnimationFrame(renderFrame)
}()

/* EVENTS */

function onMouseDown(event) {
  mouseCoords.set(
    (event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1
  )

  raycaster.setFromCamera(mouseCoords, camera)

  tmpPos.copy(raycaster.ray.direction)
  tmpPos.add(raycaster.ray.origin)

  const pos = { x: tmpPos.x, y: tmpPos.y, z: tmpPos.z }
  const radius = 1
  const mass = 1

  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius), new THREE.MeshPhongMaterial({ color: 0x6b246e }))
  mesh.position.set(pos.x, pos.y, pos.z)
  mesh.castShadow = mesh.receiveShadow = true

  const body = createRigidBody({ mesh, mass })
  mesh.userData.body = body
  world.add(mesh)

  tmpPos.copy(raycaster.ray.direction)
  tmpPos.multiplyScalar(100)
  body.setLinearVelocity(new Ammo.btVector3(tmpPos.x, tmpPos.y, tmpPos.z))
}

window.addEventListener('mousedown', onMouseDown, false)
