import * as THREE from 'three'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { createPhysicsWorld, createBox, updateMesh, createCrates, chaseCam } from '/utils/physics.js'
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

const ground = createBox({ pos: new Vector3(0, -0.5, 0), width: 100, height: 1, depth: 100, friction: 2, color: 0x509f53 })
addRigidBody(ground)

const quat = new THREE.Quaternion(0, 0, 0, 1)
quat.setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 18)

const jumpBoard = createBox({ pos: new Vector3(0, -1.5, 0), quat, width: 8, height: 4, depth: 10, friction: 1, color: 0x999999 })
addRigidBody(jumpBoard)

const crates = createCrates()
crates.forEach(mesh => {
  scene.add(mesh)
  rigidBodies.push(mesh)
  physicsWorld.addRigidBody(mesh.userData.body)
})

const width = 1.8, height = .6, length = 4
const { mesh: carMesh } = await loadModel({ file: 'tank/steampunk/model.fbx', angle: Math.PI })

const { vehicle, wheels, body } = createSimpleVehicle({
  physicsWorld, width, height, length, pos: new Vector3(0, 4, -20),
  wheelAxisPositionBack: -1,
  wheelRadiusBack: .4,
  wheelWidthBack: .3,
  wheelHalfTrackBack: 1,
  wheelAxisHeightBack: .3,

  wheelAxisFrontPosition: 1.7,
  wheelHalfTrackFront: 1,
  wheelAxisHeightFront: .3,
  wheelRadiusFront: .35,
  wheelWidthFront: .2,
})

scene.add(carMesh) // bez točkova kao tenk

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
