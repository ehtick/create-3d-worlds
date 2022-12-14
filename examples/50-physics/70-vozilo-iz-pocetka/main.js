import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createPhysicsWorld, createGround, updateMesh, createCrates } from '/utils/physics.js'
import { loadModel } from '/utils/loaders.js'
import { createSun } from '/utils/light.js'
import { getSize } from '/utils/helpers.js'

const rigidBodies = []
createOrbitControls()
scene.add(createSun())

const physicsWorld = createPhysicsWorld()

const ground = createGround({ color: 0x509f53 })
addRigidBody(ground)

createCrates().forEach(addRigidBody)

const { mesh: carMesh } = await loadModel({ file: 'tank/steampunk/model.fbx' })
const { x, y, z } = getSize(carMesh)
// const { vehicle, body } = createVehicle({
//   physicsWorld, width: x, height: y, length: z
// })

scene.add(carMesh)

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
  rigidBodies.forEach(updateMesh)
  physicsWorld.stepSimulation(dt, 10)
  renderer.render(scene, camera)
}()
