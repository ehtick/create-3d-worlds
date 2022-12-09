import * as THREE from 'three'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { fadeDecals } from './decals.js'
import { createPhysicsWorld, updateMesh, chaseCam, createBox, findGround } from '/utils/physics.js'
import { loadModel } from '/utils/loaders.js'
import { makeVehicle, handleInput, updateTires } from './vehicle.js'

scene.add(createSun({ position: [10, 50, 0] }))

const physicsWorld = createPhysicsWorld()

const ground = createBox({ pos: new THREE.Vector3(0, -0.5, 0), width: 100, height: 1, depth: 100, friction: 2, color: 0x509f53 })
scene.add(ground)
physicsWorld.addRigidBody(ground.userData.body)

const { mesh: carMesh } = await loadModel({ file: 'racing/hummer.obj', mtl: 'racing/hummer.mtl', scale: .57 })
const { mesh: tireMesh } = await loadModel({ file: 'racing/hummerTire.obj', mtl: 'racing/hummerTire.mtl', scale: .57 })
const { vehicle, body } = makeVehicle(physicsWorld)

carMesh.userData.body = body
const tires = [...Array(4)].map(() => tireMesh.clone())

scene.add(carMesh, ...tires)

/* LOOP */

function updateCar() {
  findGround(body, physicsWorld)
  updateMesh(carMesh)
  updateTires(tires, vehicle)
}

void function animate() {
  requestAnimationFrame(animate)
  handleInput({ vehicle, mesh: carMesh, tires, ground })
  const dt = clock.getDelta()
  physicsWorld.stepSimulation(dt, 10)
  updateCar()
  fadeDecals(scene)
  chaseCam({ camera, body })
  renderer.render(scene, camera)
}()
