import * as THREE from 'three'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { getSize } from '/utils/helpers.js'
import { createPhysicsWorld, updateMesh, chaseCam, createBox, findGround } from '/utils/physics.js'
import { loadModel } from '/utils/loaders.js'
import { createVehicle, handleInput, updateTires, fadeDecals } from '/utils/vehicle.js'

scene.add(createSun({ position: [10, 50, 0] }))

const physicsWorld = createPhysicsWorld()

const ground = createBox({ pos: new THREE.Vector3(0, -0.5, 0), width: 100, height: 1, depth: 100, friction: 2, color: 0x509f53 })
scene.add(ground)
physicsWorld.addRigidBody(ground.userData.body)

const { mesh: carModel } = await loadModel({ file: 'racing/hummer.obj', mtl: 'racing/hummer.mtl', scale: .57 })
const { mesh: tireMesh } = await loadModel({ file: 'racing/hummerTire.obj', mtl: 'racing/hummerTire.mtl', scale: .57 })
const tires = [...Array(4)].map(() => tireMesh.clone())
scene.add(carModel, ...tires)

const { x, y, z } = getSize(carModel)
const { vehicle, body } = createVehicle({
  physicsWorld, pos: new THREE.Vector3(0, 1, 0), width: x, height: y, length: z
})
carModel.userData.body = body

/* LOOP */

function updateCar() {
  findGround(body, physicsWorld)
  updateMesh(carModel)
  updateTires(tires, vehicle)
}

void function animate() {
  requestAnimationFrame(animate)
  handleInput({ vehicle, mesh: carModel, tires, ground })
  const dt = clock.getDelta()
  physicsWorld.stepSimulation(dt, 10)
  updateCar()
  fadeDecals(scene)
  chaseCam({ camera, body })
  renderer.render(scene, camera)
}()
