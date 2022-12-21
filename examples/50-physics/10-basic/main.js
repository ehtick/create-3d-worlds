import * as THREE from 'three'

import { Ammo, createRigidBody } from '/utils/physics.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import keyboard from '/utils/classes/Keyboard.js'
import PhysicsWorld from '/utils/classes/PhysicsWorld.js'
import { createGround } from '/utils/ground.js'
import { createSphere, createBox } from '/utils/geometry.js'

const world = new PhysicsWorld()

const mouseCoords = new THREE.Vector2(), raycaster = new THREE.Raycaster()

camera.position.set(0, 30, 70)
scene.add(createSun({ transparent: true }))

const ground = createGround()
world.add(ground, 0)

const box = createBox({ size: 10 })
box.position.set(40, 5, 5)
box.userData.body = createRigidBody({ mesh: box, mass: 1, friction: 4, kinematic: true })
world.add(box)

const bigBall = createSphere({ r: 2 })
bigBall.position.set(0, 4, 0)
bigBall.userData.body = createRigidBody({ mesh: bigBall, mass: 1, friction: 4 })
bigBall.userData.body.setRollingFriction(10)
world.add(bigBall)

/* FUNCTIONS */

function moveBall() {
  const scalingFactor = 10

  const moveX = +Boolean(keyboard.pressed.KeyD) - +Boolean(keyboard.pressed.KeyA)
  const moveZ = +Boolean(keyboard.pressed.KeyS) - +Boolean(keyboard.pressed.KeyW)

  if (moveX == 0 && moveZ == 0) return

  const resultantImpulse = new Ammo.btVector3(moveX, 0, moveZ)
  resultantImpulse.op_mul(scalingFactor)

  bigBall.userData.body.setLinearVelocity(resultantImpulse)
}

function moveBox() {
  const scalingFactor = 0.3

  const moveX = +Boolean(keyboard.pressed.ArrowRight) - +Boolean(keyboard.pressed.ArrowLeft)
  const moveZ = +Boolean(keyboard.pressed.ArrowDown) - +Boolean(keyboard.pressed.ArrowUp)

  const target = new THREE.Vector3()
  target.set(moveX, 0, moveZ)
  target.multiplyScalar(scalingFactor)

  box.translateX(target.x)
  box.translateZ(target.z)
}

/* LOOP */

void function renderFrame() {
  requestAnimationFrame(renderFrame)
  const dt = clock.getDelta()
  moveBall()
  moveBox()
  world.update(dt)
  renderer.render(scene, camera)
}()

/* EVENTS */

function onMouseDown(event) {
  mouseCoords.set(
    (event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1
  )

  raycaster.setFromCamera(mouseCoords, camera)

  const tmpPos = new THREE.Vector3()
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
