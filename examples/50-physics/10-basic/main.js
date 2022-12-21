import * as THREE from 'three'

import { Ammo, createRigidBody } from '/utils/physics.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import keyboard from '/utils/classes/Keyboard.js'
import PhysicsWorld from '/utils/classes/PhysicsWorld.js'
import { createGround } from '/utils/ground.js'
import { createSphere, createBox } from '/utils/geometry.js'
import { normalizeMouse } from '/utils/helpers.js'

const world = new PhysicsWorld()

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

const raycaster = new THREE.Raycaster()

window.addEventListener('mousedown', e => {
  const mouse = normalizeMouse(e)
  raycaster.setFromCamera(mouse, camera)

  const mesh = createSphere()
  mesh.position.copy(raycaster.ray.origin)

  mesh.userData.body = createRigidBody({ mesh, mass: 1 })
  world.add(mesh)

  const target = new THREE.Vector3()
  target.copy(raycaster.ray.direction)
  target.multiplyScalar(100)
  mesh.userData.body.setLinearVelocity(new Ammo.btVector3(target.x, target.y, target.z))
})
