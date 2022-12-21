import * as THREE from 'three'

import { Ammo, createRigidBody, updateMesh } from '/utils/physics.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import keyboard from '/utils/classes/Keyboard.js'
import PhysicsWorld from '/utils/classes/PhysicsWorld.js'

const world = new PhysicsWorld()

let bigBall = null
let bigBox = null, tmpPos = new THREE.Vector3(), tmpQuat = new THREE.Quaternion()
const mouseCoords = new THREE.Vector2(), raycaster = new THREE.Raycaster()

const FLAGS = { CF_KINEMATIC_OBJECT: 2 }

camera.position.set(0, 30, 70)
scene.add(createSun({ transparent: true }))

createBlock()
createBall()
createKinematicBox()

renderFrame()

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

function createBlock() {
  const mass = 0
  const scale = { x: 100, y: 2, z: 100 }

  const mesh = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshPhongMaterial({ color: 0xa0afa4 }))
  mesh.scale.set(scale.x, scale.y, scale.z)
  mesh.castShadow = mesh.receiveShadow = true

  const body = createRigidBody({ mesh, mass })
  body.setFriction(4)
  body.setRollingFriction(10)
  mesh.userData.body = body

  world.add(mesh)
}

function createBall() {
  const pos = { x: 0, y: 4, z: 0 }
  const radius = 2
  const mass = 1

  const mesh = bigBall = new THREE.Mesh(new THREE.SphereGeometry(radius), new THREE.MeshPhongMaterial({ color: 0xff0505 }))
  mesh.position.set(pos.x, pos.y, pos.z)
  mesh.castShadow = mesh.receiveShadow = true

  const body = createRigidBody({ mesh, mass })
  body.setFriction(4)
  body.setRollingFriction(10)
  mesh.userData.body = body

  world.add(mesh)
}

function createKinematicBox() {
  const pos = { x: 40, y: 6, z: 5 }
  const scale = { x: 10, y: 10, z: 10 }
  const mass = 1

  bigBox = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshPhongMaterial({ color: 0x30ab78 }))
  bigBox.position.set(pos.x, pos.y, pos.z)
  bigBox.scale.set(scale.x, scale.y, scale.z)
  bigBox.castShadow = bigBox.receiveShadow = true

  const body = createRigidBody({ mesh: bigBox, mass })
  body.setFriction(4)
  body.setRollingFriction(10)
  body.setCollisionFlags(FLAGS.CF_KINEMATIC_OBJECT)

  bigBox.userData.body = body
  world.add(bigBox)
}

function moveBall() {
  const scalingFactor = 20

  const moveX = +Boolean(keyboard.pressed.KeyD) - +Boolean(keyboard.pressed.KeyA)
  const moveZ = +Boolean(keyboard.pressed.KeyS) - +Boolean(keyboard.pressed.KeyW)
  const moveY = 0

  if (moveX == 0 && moveY == 0 && moveZ == 0) return

  const resultantImpulse = new Ammo.btVector3(moveX, moveY, moveZ)
  resultantImpulse.op_mul(scalingFactor)

  const { body } = bigBall.userData
  body.setLinearVelocity(resultantImpulse)
}

function moveKinematicBox() {
  const scalingFactor = 0.3

  const moveX = +Boolean(keyboard.pressed.ArrowRight) - +Boolean(keyboard.pressed.ArrowLeft)
  const moveZ = +Boolean(keyboard.pressed.ArrowDown) - +Boolean(keyboard.pressed.ArrowUp)
  const moveY = 0

  const translateFactor = tmpPos.set(moveX, moveY, moveZ)

  translateFactor.multiplyScalar(scalingFactor)

  bigBox.translateX(translateFactor.x)
  bigBox.translateY(translateFactor.y)
  bigBox.translateZ(translateFactor.z)

  bigBox.getWorldPosition(tmpPos)
  bigBox.getWorldQuaternion(tmpQuat)

  updateMesh(bigBox)
}

/* LOOP */

function renderFrame() {
  const deltaTime = clock.getDelta()
  moveBall()
  moveKinematicBox()
  world.update(deltaTime)
  renderer.render(scene, camera)
  requestAnimationFrame(renderFrame)
}

window.addEventListener('mousedown', onMouseDown, false)
