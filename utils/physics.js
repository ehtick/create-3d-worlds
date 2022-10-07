/* global Ammo */
import * as THREE from 'three'

const AMMO = await Ammo()

const margin = 0.05

function randomColor() {
  return Math.floor(Math.random() * (1 << 24))
}

function createRigidBody(mesh, shape, mass, pos, quat) {
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

export function createBox(sx, sy, sz, mass, pos, quat, color) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1), new THREE.MeshPhongMaterial({ color: color || randomColor() }))
  mesh.castShadow = mesh.receiveShadow = true
  const shape = new AMMO.btBoxShape(new AMMO.btVector3(sx * 0.5, sy * 0.5, sz * 0.5))
  shape.setMargin(margin)
  return createRigidBody(mesh, shape, mass, pos, quat)
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