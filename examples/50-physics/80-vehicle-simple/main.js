import * as THREE from 'three'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { createPhysicsWorld, createBox, createGround, updateMesh, createCrates, chaseCam } from '/utils/physics.js'
import { createSimpleVehicle, updateVehicle } from '../../../utils/vehicle-simple.js'
import { loadModel } from '/utils/loaders.js'

const { Vector3 } = THREE
const rigidBodies = []

const ambientLight = new THREE.AmbientLight(0x404040)
scene.add(ambientLight)

const dirLight = new THREE.DirectionalLight(0xffffff, 1)
dirLight.position.set(10, 10, 5)
scene.add(dirLight)

const physicsWorld = createPhysicsWorld()

const ground = createGround({ color: 0x509f53 })
addRigidBody(ground)

const quat = new THREE.Quaternion(0, 0, 0, 1)
quat.setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 18)

const jumpBoard = createBox({ pos: new Vector3(0, -1.5, 0), quat, width: 8, height: 4, depth: 10, friction: 1, color: 0x999999 })
addRigidBody(jumpBoard)

const crates = createCrates()
crates.forEach(addRigidBody)

const width = 1.8, height = .6, length = 4
// const { mesh: carMesh } = await loadModel({ file: 'tank/steampunk/model.fbx', angle: Math.PI })
const { mesh: carMesh } = await loadModel({ file: 'vehicle/train/locomotive-lowpoly/parovoZ1.fbx' })

const { vehicle, wheels, body } = createSimpleVehicle({
  physicsWorld, width, height, length, pos: new Vector3(0, 4, -20),
})

scene.add(carMesh, ...wheels)

camera.position.set(0, 5, -4)

const lookAt = new Vector3(carMesh.position.x, carMesh.position.y, carMesh.position.z + 4)
camera.lookAt(lookAt)

/* FUNCTIONS */

function addRigidBody(mesh) {
  scene.add(mesh)
  rigidBodies.push(mesh)
  physicsWorld.addRigidBody(mesh.userData.body)
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const dt = clock.getDelta()
  updateVehicle({ vehicle, mesh: carMesh, wheels })
  rigidBodies.forEach(updateMesh)
  chaseCam({ camera, body })
  physicsWorld.stepSimulation(dt, 10)
  renderer.render(scene, camera)
}()
