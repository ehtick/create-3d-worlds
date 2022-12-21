
import * as THREE from 'three'
import { Ammo } from '/utils/physics.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'

let physicsWorld, rigidBodies = [], tmpTrans = null
let ballObject = null, moveDirection = { left: 0, right: 0, forward: 0, back: 0 }
let kObject = null, kMoveDirection = { left: 0, right: 0, forward: 0, back: 0 }, tmpPos = new THREE.Vector3(), tmpQuat = new THREE.Quaternion()
let ammoTmpPos = null, ammoTmpQuat = null
const mouseCoords = new THREE.Vector2(), raycaster = new THREE.Raycaster()

const STATE = { DISABLE_DEACTIVATION: 4 }

const FLAGS = { CF_KINEMATIC_OBJECT: 2 }

tmpTrans = new Ammo.btTransform()
ammoTmpPos = new Ammo.btVector3()
ammoTmpQuat = new Ammo.btQuaternion()

setupPhysicsWorld()

setupGraphics()
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

function setupGraphics() {
  camera.position.set(0, 30, 70)
  camera.lookAt(new THREE.Vector3(0, 0, 0))

  // Add hemisphere light
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.1)
  hemiLight.color.setHSL(0.6, 0.6, 0.6)
  hemiLight.groundColor.setHSL(0.1, 1, 0.4)
  hemiLight.position.set(0, 50, 0)
  scene.add(hemiLight)

  // Add directional light
  const dirLight = new THREE.DirectionalLight(0xffffff, 1)
  dirLight.color.setHSL(0.1, 1, 0.95)
  dirLight.position.set(-1, 1.75, 1)
  dirLight.position.multiplyScalar(100)
  scene.add(dirLight)

  dirLight.castShadow = true

  dirLight.shadow.mapSize.width = 2048
  dirLight.shadow.mapSize.height = 2048

  const d = 50

  dirLight.shadow.camera.left = -d
  dirLight.shadow.camera.right = d
  dirLight.shadow.camera.top = d
  dirLight.shadow.camera.bottom = -d

  dirLight.shadow.camera.far = 13500
}

function renderFrame() {

  const deltaTime = clock.getDelta()

  moveBall()
  moveKinematic()

  updatePhysics(deltaTime)

  renderer.render(scene, camera)

  requestAnimationFrame(renderFrame)

}

function setupEventHandlers() {

  window.addEventListener('keydown', handleKeyDown, false)
  window.addEventListener('keyup', handleKeyUp, false)
  window.addEventListener('mousedown', onMouseDown, false)

}

function handleKeyDown(event) {

  const { keyCode } = event

  switch (keyCode) {

    case 87: // W: FORWARD
      moveDirection.forward = 1
      break

    case 83: // S: BACK
      moveDirection.back = 1
      break

    case 65: // A: LEFT
      moveDirection.left = 1
      break

    case 68: // D: RIGHT
      moveDirection.right = 1
      break

    case 38: // ↑: FORWARD
      kMoveDirection.forward = 1
      break

    case 40: // ↓: BACK
      kMoveDirection.back = 1
      break

    case 37: // ←: LEFT
      kMoveDirection.left = 1
      break

    case 39: // →: RIGHT
      kMoveDirection.right = 1
      break

  }
}

function handleKeyUp(event) {
  const { keyCode } = event

  switch (keyCode) {
    case 87: // FORWARD
      moveDirection.forward = 0
      break

    case 83: // BACK
      moveDirection.back = 0
      break

    case 65: // LEFT
      moveDirection.left = 0
      break

    case 68: // RIGHT
      moveDirection.right = 0
      break

    case 38: // ↑: FORWARD
      kMoveDirection.forward = 0
      break

    case 40: // ↓: BACK
      kMoveDirection.back = 0
      break

    case 37: // ←: LEFT
      kMoveDirection.left = 0
      break

    case 39: // →: RIGHT
      kMoveDirection.right = 0
      break
  }

}

function onMouseDown(event) {

  mouseCoords.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    - (event.clientY / window.innerHeight) * 2 + 1
  )

  raycaster.setFromCamera(mouseCoords, camera)

  // Creates a ball and throws it

  tmpPos.copy(raycaster.ray.direction)
  tmpPos.add(raycaster.ray.origin)

  const pos = { x: tmpPos.x, y: tmpPos.y, z: tmpPos.z }
  const radius = 1
  const quat = { x: 0, y: 0, z: 0, w: 1 }
  const mass = 1

  // threeJS Section
  const ball = new THREE.Mesh(new THREE.SphereGeometry(radius), new THREE.MeshPhongMaterial({ color: 0x6b246e }))

  ball.position.set(pos.x, pos.y, pos.z)

  ball.castShadow = true
  ball.receiveShadow = true

  scene.add(ball)

  // Ammojs Section
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

  // threeJS Section
  const blockPlane = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshPhongMaterial({ color: 0xa0afa4 }))

  blockPlane.position.set(pos.x, pos.y, pos.z)
  blockPlane.scale.set(scale.x, scale.y, scale.z)

  blockPlane.castShadow = true
  blockPlane.receiveShadow = true

  scene.add(blockPlane)

  // Ammojs Section
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

  // threeJS Section
  const ball = ballObject = new THREE.Mesh(new THREE.SphereGeometry(radius), new THREE.MeshPhongMaterial({ color: 0xff0505 }))

  ball.position.set(pos.x, pos.y, pos.z)

  ball.castShadow = true
  ball.receiveShadow = true

  scene.add(ball)

  // Ammojs Section
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

  // threeJS Section
  kObject = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshPhongMaterial({ color: 0x30ab78 }))

  kObject.position.set(pos.x, pos.y, pos.z)
  kObject.scale.set(scale.x, scale.y, scale.z)

  kObject.castShadow = true
  kObject.receiveShadow = true

  scene.add(kObject)

  // Ammojs Section
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

  const moveX = moveDirection.right - moveDirection.left
  const moveZ = moveDirection.back - moveDirection.forward
  const moveY = 0

  if (moveX == 0 && moveY == 0 && moveZ == 0) return

  const resultantImpulse = new Ammo.btVector3(moveX, moveY, moveZ)
  resultantImpulse.op_mul(scalingFactor)

  const { physicsBody } = ballObject.userData
  physicsBody.setLinearVelocity(resultantImpulse)

}

function moveKinematic() {

  const scalingFactor = 0.3

  const moveX = kMoveDirection.right - kMoveDirection.left
  const moveZ = kMoveDirection.back - kMoveDirection.forward
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
  // Step world
  physicsWorld.stepSimulation(deltaTime, 10)

  // Update rigid bodies
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
