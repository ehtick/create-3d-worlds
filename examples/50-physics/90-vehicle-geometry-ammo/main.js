import * as THREE from 'three'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { AMMO, createPhysicsWorld, createRigidBody } from '/utils/physics.js'
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

const jumpBoard = createBox({ pos: new Vector3(0, -1.5, 0), quat, width: 8, height: 4, depth: 10, color: 0x999999 })
addRigidBody(jumpBoard)

createWall()

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

function createBox({ pos, quat = new THREE.Quaternion(0, 0, 0, 1), width, height, depth, mass = 0, color = 0x999999, friction = 1 }) {
  const geometry = new THREE.BoxGeometry(width, height, depth, 1, 1, 1)
  const mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color }))

  const shape = new AMMO.btBoxShape(new AMMO.btVector3(width * 0.5, height * 0.5, depth * 0.5))

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
        pos: new Vector3(size * j - (size * (nw - 1)) / 2, size * i, 10),
        width: size, height: size, depth: size, mass: 10, color: 0xfca400
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
