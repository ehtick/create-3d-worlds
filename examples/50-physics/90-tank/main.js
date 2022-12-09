/* global Ammo */
import * as THREE from 'three'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { createSun, hemLight } from '/utils/light.js'
import { fadeDecals } from './decals.js'
import { Car } from './Car.js'
import { handleInput, updateTires } from './update-vehicle.js'
import { createPhysicsWorld, updateMesh, chaseCam, createBox } from '/utils/physics.js'

hemLight({ groundColor: 0xf0d7bb })
scene.add(createSun({ position: [10, 195, 0] }))

const physicsWorld = createPhysicsWorld()

const ground = createBox({ pos: new THREE.Vector3(0, -0.5, 0), width: 100, height: 1, depth: 100, friction: 2, color: 0x509f53 })
scene.add(ground)
physicsWorld.addRigidBody(ground.userData.body)

const car = await new Car({ objFile: 'hummer', tireFile: 'hummerTire', physicsWorld })
scene.add(car.mesh, ...car.tires)

/* FUNCTION */

function findGround(body) {
  const transform = new Ammo.btTransform()
  body.getMotionState().getWorldTransform(transform)
  const pos = transform.getOrigin()
  const downRayDir = new Ammo.btVector3(pos.x(), pos.y() - 2000, pos.z())
  let downRay = new Ammo.ClosestRayResultCallback(pos, downRayDir)
  physicsWorld.rayTest(pos, downRayDir, downRay)

  if (downRay.hasHit())
    body.setDamping(0, 0)
  else {
    const cp = new Ammo.btVector3(pos.x(), pos.y() + 1, pos.z())
    downRayDir.setY(pos.y() + 400)
    downRay = new Ammo.ClosestRayResultCallback(cp, downRayDir)
    physicsWorld.rayTest(cp, downRayDir, downRay)
    if (downRay.hasHit()) {
      const pointAbove = downRay.get_m_hitPointWorld()
      body.setDamping(.99, .99)
      body.getMotionState().getWorldTransform(transform)
      pointAbove.setY(pointAbove.y() + 1.5)
      transform.setOrigin(pointAbove)
      body.setWorldTransform(transform)
    }
  }
}

/* LOOP */

function updateCar() {
  const { mesh, tires, vehicle } = car
  findGround(mesh.userData.body)
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
