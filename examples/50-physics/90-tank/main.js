import * as THREE from 'three'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { fadeDecals } from './decals.js'
import { Car } from './Car.js'
import { handleInput, updateTires } from './update-vehicle.js'
import { createPhysicsWorld, updateMesh, chaseCam, createBox, findGround } from '/utils/physics.js'

scene.add(createSun({ position: [10, 50, 0] }))

const physicsWorld = createPhysicsWorld()

const ground = createBox({ pos: new THREE.Vector3(0, -0.5, 0), width: 100, height: 1, depth: 100, friction: 2, color: 0x509f53 })
scene.add(ground)
physicsWorld.addRigidBody(ground.userData.body)

const car = await new Car({ objFile: 'hummer', tireFile: 'hummerTire', physicsWorld })
scene.add(car.mesh, ...car.tires)

/* LOOP */

function updateCar() {
  const { mesh, tires, vehicle } = car
  findGround(mesh.userData.body, physicsWorld)
  updateMesh(mesh)
  updateTires(tires, vehicle)
}

void function animate() {
  requestAnimationFrame(animate)
  handleInput(car, ground)
  const dt = clock.getDelta()
  physicsWorld.stepSimulation(dt, 10)
  updateCar()
  fadeDecals(scene)
  chaseCam({ camera, body: car.mesh.userData.body })
  renderer.render(scene, camera)
}()
