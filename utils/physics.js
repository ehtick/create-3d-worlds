/* global Ammo */
import * as THREE from 'three'

const AMMO = await Ammo()

const margin = 0.05

function randomColor() {
  return Math.floor(Math.random() * (1 << 24))
}

export function createRigidBody(mesh, shape, mass, pos, quat = { x: 0, y: 0, z: 0, w: 1 }, vel, angVel) {
  mesh.position.copy(pos)
  mesh.quaternion.copy(quat)

  const transform = new AMMO.btTransform()
  transform.setIdentity()
  transform.setOrigin(new AMMO.btVector3(pos.x, pos.y, pos.z))
  transform.setRotation(new AMMO.btQuaternion(quat.x, quat.y, quat.z, quat.w))
  const motionState = new AMMO.btDefaultMotionState(transform)

  const localInertia = new AMMO.btVector3(0, 0, 0)
  shape.calculateLocalInertia(mass, localInertia)

  const rbInfo = new AMMO.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia)
  const body = new AMMO.btRigidBody(rbInfo)

  mesh.userData.physicsBody = body
  if (mass > 0) body.setActivationState(4) // Disable deactivation

  return { mesh, body, mass }
}

export function createBall(radius = 0.6, mass = 1.2, pos, quat) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 20, 20), new THREE.MeshPhongMaterial({ color: 0x202020 }))
  mesh.castShadow = mesh.receiveShadow = true
  const shape = new AMMO.btSphereShape(radius)
  shape.setMargin(margin)
  const res = createRigidBody(mesh, shape, mass, pos, quat)
  res.body.setFriction(0.5)
  return res
}

export function createBox(width, height, depth, mass, pos, quat, color) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth, 1, 1, 1), new THREE.MeshPhongMaterial({ color: color || randomColor() }))
  mesh.castShadow = mesh.receiveShadow = true
  const shape = new AMMO.btBoxShape(new AMMO.btVector3(width * 0.5, height * 0.5, depth * 0.5))
  shape.setMargin(margin)
  return createRigidBody(mesh, shape, mass, pos, quat)
}

export function createBrick(length, height, depth, pos, halfBrick) {
  const mass = 0.5
  const lengthCurrent = halfBrick ? length * .5 : length
  const massCurrent = halfBrick ? mass * .5 : mass
  return createBox(depth, height, lengthCurrent, massCurrent, pos)
}

export function createWall() {
  const pos = new THREE.Vector3()
  const bricks = []

  const brickLength = 1.2
  const brickHeight = brickLength * 0.5
  const numBricksLength = 6
  const numBricksHeight = 8
  const z = -numBricksLength * brickLength * 0.5
  pos.set(0, brickHeight * 0.5, z)

  for (let j = 0; j < numBricksHeight; j ++) {
    const oddRow = (j % 2) == 1
    const nRow = oddRow ? numBricksLength + 1 : numBricksLength

    pos.z = oddRow ? z - brickLength * .25 : z

    for (let i = 0; i < nRow; i ++) {
      const firstOrLast = oddRow && (i == 0 || i == nRow - 1)
      const brick = createBrick(brickLength, brickHeight, 0.6, pos, firstOrLast)
      bricks.push(brick)

      pos.z = oddRow && (i == 0 || i == nRow - 2)
        ? pos.z + brickLength * .75
        : pos.z + brickLength
    }

    pos.y += brickHeight
  }
  return bricks
}