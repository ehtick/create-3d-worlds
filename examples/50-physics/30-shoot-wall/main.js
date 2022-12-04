import { AMMO, createBox, createBall, createWall, createPhysicsWorld, updateMesh } from '/utils/physics.js'
import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'
import keyboard from '/utils/classes/Keyboard.js'
import { createSun } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'
import { mapRange } from '/utils/helpers.js'

/**
 * dodati zid kutija iz vozila
 * dodati top
 * srediti nišanjenje
 */

camera.position.set(-7, 1, 0)
createOrbitControls()

const rigidBodies = []

const sun = createSun({ position: [-5, 10, 5] })
scene.add(sun)

const physicsWorld = createPhysicsWorld()

const ground = createBox({ width: 40, height: 1, depth: 40, mass: 0, pos: { x: 0, y: -0.5, z: 0 }, color: 0xFFFFFF })
addRigidBody(ground)

const wall = createWall()
wall.forEach(mesh => {
  scene.add(mesh)
  rigidBodies.push(mesh)
  physicsWorld.addRigidBody(mesh.userData.body)
})

// const { mesh: cannon } = await loadModel({ file: 'weapon/cannon/civil-war-cannon.fbx', size: 1, angle: -Math.PI * .5 })
const { mesh: cannon } = await loadModel({ file: 'weapon/cannon/mortar/mortar.obj', mtl: 'weapon/cannon/mortar/mortar.mtl', size: 1, angle: Math.PI, shouldAdjustHeight: true })
cannon.translateX(-5)
scene.add(cannon)

/* FUNCTIONS */

function addRigidBody(mesh) {
  scene.add(mesh)
  rigidBodies.push(mesh)
  physicsWorld.addRigidBody(mesh.userData.body)
}

function shoot() {
  const pos = cannon.position.clone()
  pos.y += 0.75
  const ball = createBall({ radius: .1, mass: 1.2, pos })
  addRigidBody(ball)
  const x = mapRange(cannon.rotation.y, -Math.PI * .5, Math.PI * .5, 20, 0)
  const z = mapRange(cannon.rotation.y, -Math.PI * .5, Math.PI * .5, -20, 20)
  console.log(cannon.rotation.y) // in PI
  console.log(x, z)
  ball.userData.body.setLinearVelocity(new AMMO.btVector3(x, 5, -z))
}

function move(cannon, dt) {
  if (keyboard.up) cannon.translateX(dt * .5)
  if (keyboard.down) cannon.translateX(-dt * .5)
  if (keyboard.left) cannon.rotateY(dt * .2)
  if (keyboard.right) cannon.rotateY(-dt * .2)
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const dt = clock.getDelta()
  move(cannon, dt)
  physicsWorld.stepSimulation(dt, 10)
  rigidBodies.forEach(updateMesh)
  renderer.render(scene, camera)
}()

/* EVENTS */

document.addEventListener('click', shoot)