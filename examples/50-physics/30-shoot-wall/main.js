import { AMMO, createBox, createBall, createWall, createPhysicsWorld, updateMesh } from '/utils/physics.js'
import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'
import keyboard from '/utils/classes/Keyboard.js'
import { createSun } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'
import { mapRange } from '/utils/helpers.js'

/**
 * srediti nišanjenje (ima BUG)
 * prikazati jačinu pucanja
 */

const minMagnitude = 15
const maxMagnitude = 30
let magnitude = minMagnitude

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
  const x = mapRange(cannon.rotation.y, -Math.PI * .5, Math.PI * .5, magnitude, 0)
  const z = mapRange(cannon.rotation.y, -Math.PI * .5, Math.PI * .5, -magnitude, magnitude)
  ball.userData.body.setLinearVelocity(new AMMO.btVector3(x, magnitude * .2, -z))
  magnitude = minMagnitude
}

function handleInput(cannon, dt) {
  if (keyboard.up) cannon.translateX(dt * .5)
  if (keyboard.down) cannon.translateX(-dt * .5)
  if (keyboard.left && cannon.rotation.y < Math.PI * .25) cannon.rotateY(dt * .2)
  if (keyboard.right && cannon.rotation.y > -Math.PI * .25) cannon.rotateY(-dt * .2)

  if (keyboard.pressed.mouse && magnitude < maxMagnitude) magnitude += .1
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const dt = clock.getDelta()
  handleInput(cannon, dt)
  physicsWorld.stepSimulation(dt, 10)
  rigidBodies.forEach(updateMesh)
  renderer.render(scene, camera)
}()

/* EVENTS */

document.addEventListener('mouseup', shoot)