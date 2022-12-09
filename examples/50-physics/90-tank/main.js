import * as THREE from 'three'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { fadeDecals } from './decals.js'
import { handleInput, updateTires } from './update-vehicle.js'
import { createPhysicsWorld, updateMesh, chaseCam, createBox, findGround } from '/utils/physics.js'
import { loadModel } from '/utils/loaders.js'
import { makeVehicle } from './vehicle.js'

scene.add(createSun({ position: [10, 50, 0] }))

const physicsWorld = createPhysicsWorld()

const ground = createBox({ pos: new THREE.Vector3(0, -0.5, 0), width: 100, height: 1, depth: 100, friction: 2, color: 0x509f53 })
scene.add(ground)
physicsWorld.addRigidBody(ground.userData.body)

class Car {
  constructor() {
    return (async() => {
      const { mesh } = await loadModel({ file: 'racing/hummer.obj', mtl: 'racing/hummer.mtl', scale: .57 })
      const { mesh: tireMesh } = await loadModel({ file: 'racing/hummerTire.obj', mtl: 'racing/hummerTire.mtl', scale: .57 })
      const { vehicle, body } = makeVehicle(physicsWorld)

      mesh.userData.body = body
      this.mesh = mesh
      this.vehicle = vehicle
      this.tires = [...Array(4)].map(() => tireMesh.clone())

      return this
    })()
  }
}

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
