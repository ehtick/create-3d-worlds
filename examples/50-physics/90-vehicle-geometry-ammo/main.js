import * as THREE from 'three'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { AMMO, createPhysicsWorld } from '/utils/physics.js'
import { createVehicle, updateVehicle } from './vehicle.js'

const DISABLE_DEACTIVATION = 4

const rigidBodies = []

const ambientLight = new THREE.AmbientLight(0x404040)
scene.add(ambientLight)

const dirLight = new THREE.DirectionalLight(0xffffff, 1)
dirLight.position.set(10, 10, 5)
scene.add(dirLight)

const physicsWorld = createPhysicsWorld()

const ground = createBox({ pos: [0, -0.5, 0], w: 100, l: 1, h: 100, friction: 2 })
addRigidBody(ground)

const quat = new THREE.Quaternion(0, 0, 0, 1)
quat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 18)

const jumpBoard = createBox({ pos: [0, -1.5, 0], quat, w: 8, l: 4, h: 10, mass: 0 })
addRigidBody(jumpBoard)

createWall()

const { vehicle, wheels, chassis } = createVehicle(new THREE.Vector3(0, 4, -20), physicsWorld)
scene.add(...wheels, chassis) // bez točkova kao tenk

camera.position.set(0, 1.5, -1)
chassis.add(camera)

const lookAt = new THREE.Vector3(chassis.position.x, chassis.position.y, chassis.position.z + 4)
camera.lookAt(lookAt)

/* FUNCTIONS */

function addRigidBody({ mesh, body, mass }) {
  scene.add(mesh)
  if (mass > 0) rigidBodies.push(mesh)
  physicsWorld.addRigidBody(body)
}

function createRigidBody({ mesh, shape, mass, pos, quat = { x: 0, y: 0, z: 0, w: 1 }, friction } = {}) {
  mesh.position.copy(pos)
  mesh.quaternion.copy(quat)

  const transform = new AMMO.btTransform()
  transform.setOrigin(new AMMO.btVector3(pos.x, pos.y, pos.z))
  transform.setRotation(new AMMO.btQuaternion(quat.x, quat.y, quat.z, quat.w))
  const motionState = new AMMO.btDefaultMotionState(transform)

  const inertia = new AMMO.btVector3(0, 0, 0)
  shape.calculateLocalInertia(mass, inertia)

  const rbInfo = new AMMO.btRigidBodyConstructionInfo(mass, motionState, shape, inertia)
  const body = new AMMO.btRigidBody(rbInfo)
  body.setFriction(friction)
  mesh.userData.body = body

  if (mass > 0) body.setActivationState(4) // Disable deactivation

  // addRigidBody({ mesh, body, mass })
  return { mesh, body, mass }
}

function createBox({ pos, quat = new THREE.Quaternion(0, 0, 0, 1), w, l, h, mass = 0, friction = 1 }) {
  pos = new THREE.Vector3(...pos)
  const color = mass > 0 ? 0xfca400 : 0x999999
  const geometry = new THREE.BoxGeometry(w, l, h, 1, 1, 1)
  const shape = new AMMO.btBoxShape(new AMMO.btVector3(w * 0.5, l * 0.5, h * 0.5))
  const mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color }))

  return createRigidBody({ mesh, shape, mass, pos, quat, friction })
}

function updateBox(mesh) {
  const ms = mesh.userData.body.getMotionState()
  if (!ms) return
  const transform = new AMMO.btTransform()
  ms.getWorldTransform(transform)
  const p = transform.getOrigin()
  const q = transform.getRotation()
  mesh.position.set(p.x(), p.y(), p.z())
  mesh.quaternion.set(q.x(), q.y(), q.z(), q.w())
}

function createWall(size = .75, nw = 8, nh = 6) {
  for (let j = 0; j < nw; j++)
    for (let i = 0; i < nh; i++) {
      const brick = createBox({
        pos: [size * j - (size * (nw - 1)) / 2, size * i, 10],
        w: size, l: size, h: size, mass: 10
      })
      addRigidBody(brick)
    }
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const dt = clock.getDelta()
  updateVehicle({ vehicle, wheels, chassis })
  rigidBodies.forEach(updateBox)
  physicsWorld.stepSimulation(dt, 10)
  renderer.render(scene, camera)
}()
