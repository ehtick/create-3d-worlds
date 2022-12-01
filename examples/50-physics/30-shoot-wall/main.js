import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { AMMO, createBox, createBall, createWall, createPhysicsWorld, updateMesh } from '/utils/physics.js'
import { createSun } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'

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

const { mesh: cannon } = await loadModel({ file: 'weapon/cannon/civil-war-cannon.fbx', size: 1, angle: -Math.PI * .5 })
cannon.translateX(-5)
console.log(cannon.position)
scene.add(cannon)

/* FUNCTIONS */

function addRigidBody(mesh) {
  scene.add(mesh)
  rigidBodies.push(mesh)
  physicsWorld.addRigidBody(mesh.userData.body)
}

function shoot() {
  const pos = cannon.position.clone()
  pos.y += 0.9
  const mesh = createBall({ radius: .1, mass: 1.2, pos })
  addRigidBody(mesh)
  mesh.userData.body.setLinearVelocity(new AMMO.btVector3(20, 0, 0))
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