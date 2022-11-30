import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { AMMO, createBox, createBall, createWall, createPhysicsWorld, updateMesh } from '/utils/physics.js'

camera.position.set(-7, 5, 8)
createOrbitControls()

const rigidBodies = []

const sun = createSun({ position: [-5, 10, 5] })
scene.add(sun)

const physicsWorld = createPhysicsWorld()

const ground = createBox({ width: 40, height: 1, depth: 40, mass: 0, pos: { x: 0, y: -0.5, z: 0 }, color: 0xFFFFFF })
addRigidBody(ground)

const bricks = createWall()
bricks.forEach(({ mesh }) => {
  scene.add(mesh)
  rigidBodies.push(mesh)
  physicsWorld.addRigidBody(mesh.userData.body)
})

/* FUNCTIONS */

function addRigidBody({ mesh }) {
  scene.add(mesh)
  rigidBodies.push(mesh)
  physicsWorld.addRigidBody(mesh.userData.body)
}

function shoot() {
  const ball = createBall({ radius: .6, mass: 1.2, pos: { x: -3, y: 2, z: 0 } })
  addRigidBody(ball)
  ball.mesh.userData.body.setLinearVelocity(new AMMO.btVector3(20, 0, 0))
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const dt = clock.getDelta()
  physicsWorld.stepSimulation(dt, 10)
  rigidBodies.forEach(updateMesh)
  renderer.render(scene, camera)
}()

/* EVENTS */

document.addEventListener('click', shoot)