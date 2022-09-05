import * as THREE from 'three'
import keyboard from '/utils/classes/Keyboard.js'
import { RIGHT_ANGLE } from '/data/constants.js'

const GRAVITY = .9
const FRICTION = .5
const velocity = new THREE.Vector3()

let jumpImpulse = 0
let onGround = false

function startJump() {
  velocity.y = jumpImpulse
  jumpImpulse = 0
}

const checkGround = mesh => {
  if (mesh.position.y < 0) {
    mesh.position.y = 0
    velocity.y = 0
    onGround = true
  }
}

const updateMove = (mesh, deltaTime) => {
  velocity.y -= GRAVITY
  mesh.translateY(velocity.y * deltaTime)
  velocity.z *= FRICTION
  mesh.translateZ(velocity.z * deltaTime)
  checkGround(mesh)
}

export function handleInput(mesh, deltaTime, speed = 4, maxJumpImpulse = speed * 4) {
  const rotateDelta = RIGHT_ANGLE * deltaTime // 90 degrees per second

  if (keyboard.pressed.Space && onGround && jumpImpulse < maxJumpImpulse) {
    jumpImpulse += maxJumpImpulse * .1
    onGround = false
  }

  if (keyboard.up)
    velocity.z -= speed
  if (keyboard.down)
    velocity.z += speed

  if (keyboard.left)
    mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotateDelta)
  if (keyboard.right)
    mesh.rotateOnAxis(new THREE.Vector3(0, 1, 0), -rotateDelta)

  updateMove(mesh, deltaTime)
}

/* EVENTS */

window.addEventListener('keyup', e => {
  if (e.code == 'Space') startJump()
})