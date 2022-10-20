/* global Ammo */
import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { AMMO, createBox, createBall, createWall, createPhysicsWorld } from '/utils/physics.js'

camera.position.set(-7, 5, 8)
createOrbitControls()

const rigidBodies = []

const sun = createSun({ position: [-5, 10, 5] })
scene.add(sun)

const transform = new AMMO.btTransform()
const physicsWorld = createPhysicsWorld()

const ground = createBox(40, 1, 40, 0, { x: 0, y: -0.5, z: 0 }, { x: 0, y: 0, z: 0, w: 1 }, 0xFFFFFF)
addRigidBody(ground)

const ballRadius = 0.6
const ball = createBall(ballRadius, 1.2, { x: -3, y: 2, z: 0 })
addRigidBody(ball)

const bricks = createWall()
bricks.forEach(addRigidBody)

/* FUNCTIONS */

function addRigidBody({ mesh, body, mass }) {
  scene.add(mesh)
  if (mass > 0) rigidBodies.push(mesh)
  physicsWorld.addRigidBody(body)
}

function updatePhysics(deltaTime) {
  physicsWorld.stepSimulation(deltaTime, 10)

  rigidBodies.forEach(mesh => {
    const ms = mesh.userData.body.getMotionState()
    if (!ms) return
    ms.getWorldTransform(transform)
    const p = transform.getOrigin()
    const q = transform.getRotation()
    mesh.position.set(p.x(), p.y(), p.z())
    mesh.quaternion.set(q.x(), q.y(), q.z(), q.w())
  })
}

function shoot() {
  ball.body.setLinearVelocity(new AMMO.btVector3(20, 0, 0))
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const deltaTime = clock.getDelta()
  updatePhysics(deltaTime)
  renderer.render(scene, camera)
}()

/* EVENTS */

document.addEventListener('click', shoot)