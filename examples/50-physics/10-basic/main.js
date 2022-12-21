import * as THREE from 'three'
import { Ammo } from '/utils/physics.js'

import { scene, camera, renderer, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import keyboard from '/utils/classes/Keyboard.js'
import PhysicsWorld from '/utils/classes/PhysicsWorld.js'

const world = new PhysicsWorld()

let physicsWorld, rigidBodies = [], tmpTrans = null
let ballObject = null
let kObject = null, tmpPos = new THREE.Vector3(), tmpQuat = new THREE.Quaternion()
let ammoTmpPos = null, ammoTmpQuat = null
const mouseCoords = new THREE.Vector2(), raycaster = new THREE.Raycaster()

const STATE = { DISABLE_DEACTIVATION: 4 }
const FLAGS = { CF_KINEMATIC_OBJECT: 2 }

tmpTrans = new Ammo.btTransform()
ammoTmpPos = new Ammo.btVector3()
ammoTmpQuat = new Ammo.btQuaternion()

setupPhysicsWorld()

camera.position.set(0, 30, 70)
scene.add(createSun({ transparent: true }))

createBlock()
createBall()
createKinematicBox()

setupEventHandlers()
renderFrame()

function setupPhysicsWorld() {
  const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(),
    dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration),
    overlappingPairCache = new Ammo.btDbvtBroadphase(),
    solver = new Ammo.btSequentialImpulseConstraintSolver()

  physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration)
  physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0))
}

function setupEventHandlers() {
  window.addEventListener('mousedown', onMouseDown, false)
}

function onMouseDown(event) {
  mouseCoords.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    - (event.clientY / window.innerHeight) * 2 + 1
  )

  raycaster.setFromCamera(mouseCoords, camera)

  tmpPos.copy(raycaster.ray.direction)
  tmpPos.add(raycaster.ray.origin)

  const pos = { x: tmpPos.x, y: tmpPos.y, z: tmpPos.z }
  const radius = 1
  const quat = { x: 0, y: 0, z: 0, w: 1 }
  const mass = 1

  const ball = new THREE.Mesh(new THREE.SphereGeometry(radius), new THREE.MeshPhongMaterial({ color: 0x6b246e }))
  ball.position.set(pos.x, pos.y, pos.z)
  ball.castShadow = ball.receiveShadow = true

  scene.add(ball)

  const transform = new Ammo.btTransform()
  transform.setIdentity()
  transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z))
  transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w))
  const motionState = new Ammo.btDefaultMotionState(transform)

  const colShape = new Ammo.btSphereShape(radius)
  colShape.setMargin(0.05)

  const localInertia = new Ammo.btVector3(0, 0, 0)
  colShape.calculateLocalInertia(mass, localInertia)

  const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia)
  const body = new Ammo.btRigidBody(rbInfo)

  physicsWorld.addRigidBody(body)

  tmpPos.copy(raycaster.ray.direction)
  tmpPos.multiplyScalar(100)

  body.setLinearVelocity(new Ammo.btVector3(tmpPos.x, tmpPos.y, tmpPos.z))

  ball.userData.physicsBody = body
  rigidBodies.push(ball)
}

function createBlock() {
  const pos = { x: 0, y: 0, z: 0 }
  const scale = { x: 100, y: 2, z: 100 }
  const quat = { x: 0, y: 0, z: 0, w: 1 }
  const mass = 0

  const blockPlane = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshPhongMaterial({ color: 0xa0afa4 }))
  blockPlane.position.set(pos.x, pos.y, pos.z)
  blockPlane.scale.set(scale.x, scale.y, scale.z)
  blockPlane.castShadow = blockPlane.receiveShadow = true

  scene.add(blockPlane)

  const transform = new Ammo.btTransform()
  transform.setIdentity()
  transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z))
  transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w))
  const motionState = new Ammo.btDefaultMotionState(transform)

  const colShape = new Ammo.btBoxShape(new Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5))
  colShape.setMargin(0.05)

  const localInertia = new Ammo.btVector3(0, 0, 0)
  colShape.calculateLocalInertia(mass, localInertia)

  const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia)
  const body = new Ammo.btRigidBody(rbInfo)

  body.setFriction(4)
  body.setRollingFriction(10)

  physicsWorld.addRigidBody(body)
}

function createBall() {
  const pos = { x: 0, y: 4, z: 0 }
  const radius = 2
  const quat = { x: 0, y: 0, z: 0, w: 1 }
  const mass = 1

  const ball = ballObject = new THREE.Mesh(new THREE.SphereGeometry(radius), new THREE.MeshPhongMaterial({ color: 0xff0505 }))

  ball.position.set(pos.x, pos.y, pos.z)

  ball.castShadow = true
  ball.receiveShadow = true

  scene.add(ball)

  const transform = new Ammo.btTransform()
  transform.setIdentity()
  transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z))
  transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w))
  const motionState = new Ammo.btDefaultMotionState(transform)

  const colShape = new Ammo.btSphereShape(radius)
  colShape.setMargin(0.05)

  const localInertia = new Ammo.btVector3(0, 0, 0)
  colShape.calculateLocalInertia(mass, localInertia)

  const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia)
  const body = new Ammo.btRigidBody(rbInfo)

  body.setFriction(4)
  body.setRollingFriction(10)

  body.setActivationState(STATE.DISABLE_DEACTIVATION)

  physicsWorld.addRigidBody(body)

  ball.userData.physicsBody = body
  rigidBodies.push(ball)
}

function createKinematicBox() {
  const pos = { x: 40, y: 6, z: 5 }
  const scale = { x: 10, y: 10, z: 10 }
  const quat = { x: 0, y: 0, z: 0, w: 1 }
  const mass = 1

  kObject = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshPhongMaterial({ color: 0x30ab78 }))

  kObject.position.set(pos.x, pos.y, pos.z)
  kObject.scale.set(scale.x, scale.y, scale.z)

  kObject.castShadow = true
  kObject.receiveShadow = true

  scene.add(kObject)

  const transform = new Ammo.btTransform()
  transform.setIdentity()
  transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z))
  transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w))
  const motionState = new Ammo.btDefaultMotionState(transform)

  const colShape = new Ammo.btBoxShape(new Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5))
  colShape.setMargin(0.05)

  const localInertia = new Ammo.btVector3(0, 0, 0)
  colShape.calculateLocalInertia(mass, localInertia)

  const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia)
  const body = new Ammo.btRigidBody(rbInfo)

  body.setFriction(4)
  body.setRollingFriction(10)

  body.setActivationState(STATE.DISABLE_DEACTIVATION)
  body.setCollisionFlags(FLAGS.CF_KINEMATIC_OBJECT)

  physicsWorld.addRigidBody(body)
  kObject.userData.physicsBody = body
}

function moveBall() {
  const scalingFactor = 20

  const moveX = +Boolean(keyboard.pressed.KeyD) - +Boolean(keyboard.pressed.KeyA)
  const moveZ = +Boolean(keyboard.pressed.KeyS) - +Boolean(keyboard.pressed.KeyW)
  const moveY = 0

  if (moveX == 0 && moveY == 0 && moveZ == 0) return

  const resultantImpulse = new Ammo.btVector3(moveX, moveY, moveZ)
  resultantImpulse.op_mul(scalingFactor)

  const { physicsBody } = ballObject.userData
  physicsBody.setLinearVelocity(resultantImpulse)
}

function moveKinematic() {
  const scalingFactor = 0.3

  const moveX = +Boolean(keyboard.pressed.ArrowRight) - +Boolean(keyboard.pressed.ArrowLeft)
  const moveZ = +Boolean(keyboard.pressed.ArrowDown) - +Boolean(keyboard.pressed.ArrowUp)
  const moveY = 0

  const translateFactor = tmpPos.set(moveX, moveY, moveZ)

  translateFactor.multiplyScalar(scalingFactor)

  kObject.translateX(translateFactor.x)
  kObject.translateY(translateFactor.y)
  kObject.translateZ(translateFactor.z)

  kObject.getWorldPosition(tmpPos)
  kObject.getWorldQuaternion(tmpQuat)

  const { physicsBody } = kObject.userData

  const ms = physicsBody.getMotionState()
  if (ms) {

    ammoTmpPos.setValue(tmpPos.x, tmpPos.y, tmpPos.z)
    ammoTmpQuat.setValue(tmpQuat.x, tmpQuat.y, tmpQuat.z, tmpQuat.w)

    tmpTrans.setIdentity()
    tmpTrans.setOrigin(ammoTmpPos)
    tmpTrans.setRotation(ammoTmpQuat)

    ms.setWorldTransform(tmpTrans)
  }
}

function updatePhysics(deltaTime) {
  physicsWorld.stepSimulation(deltaTime, 10)

  for (let i = 0; i < rigidBodies.length; i++) {
    const objThree = rigidBodies[i]
    const objAmmo = objThree.userData.physicsBody
    const ms = objAmmo.getMotionState()
    if (ms) {
      ms.getWorldTransform(tmpTrans)
      const p = tmpTrans.getOrigin()
      const q = tmpTrans.getRotation()
      objThree.position.set(p.x(), p.y(), p.z())
      objThree.quaternion.set(q.x(), q.y(), q.z(), q.w())
    }
  }
}

function renderFrame() {
  const deltaTime = clock.getDelta()

  moveBall()
  moveKinematic()

  updatePhysics(deltaTime)

  renderer.render(scene, camera)

  requestAnimationFrame(renderFrame)
}
