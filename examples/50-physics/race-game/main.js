/* global Ammo */
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { createSun, hemLight } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'
import { Car } from './Car.js'
import { handleInput, updateTires } from '/utils/vehicle.js'
import { createPhysicsWorld, updateMesh, chaseCam, findGround } from '/utils/physics.js'

hemLight({ groundColor: 0xf0d7bb })
scene.add(createSun({ position: [10, 195, 0] }))

const physicsWorld = createPhysicsWorld()
const worldScale = 25

const { mesh: worldMesh } = await loadModel({ file: 'racing/courser14a.obj', mtl: 'racing/courser14a.mtl', receiveShadow: true, castShadow: false, scale: worldScale })

const worldModel = worldMesh.children[0]
worldModel.position.set(0, -38, 0)
addWorldBody(worldModel, worldScale)

const cars = [
  await new Car({ objFile: 'hummer', tireFile: 'hummerTire', physicsWorld }),
  await new Car({ objFile: 'ladavaz', tireFile: 'ladavazTire', physicsWorld }),
]

cars.forEach(car => scene.add(car.mesh, ...car.tires))
scene.add(worldModel)

/* FUNCTION */

function addWorldBody(model, scale) {
  const triangleMesh = new Ammo.btTriangleMesh()
  const pos = model.children[0].geometry.attributes.position.array
  for (let i = 0; i < pos.length; i += 9) {
    const v0 = pos[i] * scale
    const v1 = pos[i + 1] * scale
    const v2 = pos[i + 2] * scale
    const v3 = pos[i + 3] * scale
    const v4 = pos[i + 4] * scale
    const v5 = pos[i + 5] * scale
    const v6 = pos[i + 6] * scale
    const v7 = pos[i + 7] * scale
    const v8 = pos[i + 8] * scale
    triangleMesh.addTriangle(
      new Ammo.btVector3(v0, v1, v2),
      new Ammo.btVector3(v3, v4, v5),
      new Ammo.btVector3(v6, v7, v8)
    )
  }

  const transform = new Ammo.btTransform()
  transform.setIdentity()
  const center = new Ammo.btVector3(0, -38, 0)
  transform.setOrigin(center)
  const motionState = new Ammo.btDefaultMotionState(transform)
  const shape = new Ammo.btBvhTriangleMeshShape(triangleMesh, true)
  const body = new Ammo.btRigidBody(0, motionState, shape)
  body.setCollisionFlags(body.getCollisionFlags() | 1)
  body.setActivationState(4) // DISABLE_DEACTIVATION
  body.setFriction(.5)
  physicsWorld.addRigidBody(body)
}

/* LOOP */

function updateCars() {
  cars.forEach(({ mesh, tires, vehicle }) => {
    findGround(mesh.userData.body, physicsWorld)
    updateMesh(mesh)
    updateTires(tires, vehicle)
  })
}

void function animate() {
  requestAnimationFrame(animate)
  handleInput({ ...cars[0], ground: worldModel })
  const dt = clock.getDelta()
  physicsWorld.stepSimulation(dt, 10) // physicsWorld.stepSimulation(1 / 60)
  updateCars()
  chaseCam({ camera, body: cars[0].mesh.userData.body })
  renderer.render(scene, camera)
}()
