import * as THREE from 'three'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { AMMO, createPhysicsWorld, createBox } from '/utils/physics.js'
import { createVehicle, updateVehicle } from './vehicle.js'

const { Vector3 } = THREE

const rigidBodies = []

const ambientLight = new THREE.AmbientLight(0x404040)
scene.add(ambientLight)

const dirLight = new THREE.DirectionalLight(0xffffff, 1)
dirLight.position.set(10, 10, 5)
scene.add(dirLight)

const physicsWorld = createPhysicsWorld()

const ground = createBox({ pos: new Vector3(0, -0.5, 0), width: 100, height: 1, depth: 100, friction: 2, color: 0x999999 })
addRigidBody(ground)

const quat = new THREE.Quaternion(0, 0, 0, 1)
quat.setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 18)

const jumpBoard = createBox({ pos: new Vector3(0, -1.5, 0), quat, width: 8, height: 4, depth: 10, friction: 1, color: 0x999999 })
addRigidBody(jumpBoard)

createCrates()

const { vehicle, wheels, chassis } = createVehicle(new Vector3(0, 4, -20), physicsWorld)
scene.add(...wheels, chassis) // bez točkova kao tenk

camera.position.set(0, 1.5, -1)
chassis.add(camera)

const lookAt = new Vector3(chassis.position.x, chassis.position.y, chassis.position.z + 4)
camera.lookAt(lookAt)

/* FUNCTIONS */

function addRigidBody({ mesh, body, mass }) {
  scene.add(mesh)
  if (mass > 0) rigidBodies.push(mesh)
  physicsWorld.addRigidBody(body)
}

function createCrates(size = .75, nw = 8, nh = 6) {
  for (let j = 0; j < nw; j++)
    for (let i = 0; i < nh; i++) {
      const brick = createBox({
        pos: new Vector3(size * j - (size * (nw - 1)) / 2, size * i, 10),
        width: size, height: size, depth: size, mass: 10, color: 0xfca400, friction: 1
      })
      addRigidBody(brick)
    }
}

/* LOOP */

function updateBody(mesh) {
  const ms = mesh.userData.body.getMotionState()
  if (!ms) return
  const transform = new AMMO.btTransform()
  ms.getWorldTransform(transform)
  const p = transform.getOrigin()
  const q = transform.getRotation()
  mesh.position.set(p.x(), p.y(), p.z())
  mesh.quaternion.set(q.x(), q.y(), q.z(), q.w())
}

void function loop() {
  requestAnimationFrame(loop)
  const dt = clock.getDelta()
  updateVehicle({ vehicle, wheels, chassis })
  rigidBodies.forEach(updateBody)
  physicsWorld.stepSimulation(dt, 10)
  renderer.render(scene, camera)
}()
