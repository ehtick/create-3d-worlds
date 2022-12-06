import * as THREE from 'three'
import { AMMO, createBox, createBall, createWall, createSideWall, createPhysicsWorld, updateMesh } from '/utils/physics.js'
import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { normalizeMouse } from '/utils/helpers.js'
import keyboard from '/utils/classes/Keyboard.js'

const magnitude = document.getElementById('magnitude')
const minMagnitude = 15
const maxMagnitude = 30
magnitude.value = minMagnitude

createOrbitControls()
camera.position.set(-10, 1.5, 0)
camera.lookAt(10, 0, 0)

const rigidBodies = []

const sun = createSun({ position: [-5, 10, 5] })
scene.add(sun)

const physicsWorld = createPhysicsWorld()

const ground = createBox({ width: 40, height: 1, depth: 40, mass: 0, pos: { x: 0, y: -0.5, z: 0 }, color: 0xFFFFFF })
addRigidBody(ground)

const frontWall = createWall({ rows: 10, columns: 6, brickMass: 5, friction: 5, startX: -3.2 })
const backWall = createWall({ rows: 10, columns: 6, brickMass: 5, friction: 5, startX: 2.2 })
const leftWall = createSideWall({ rows: 10, columns: 6, brickMass: 5, friction: 5, startZ: -3.8 })
const rightWall = createSideWall({ rows: 10, columns: 6, brickMass: 5, friction: 5, startZ: 2.8 })

;[...frontWall, ...backWall, ...leftWall, ...rightWall].forEach(mesh => {
  scene.add(mesh)
  rigidBodies.push(mesh)
  physicsWorld.addRigidBody(mesh.userData.body)
})

/* FUNCTIONS */

function addRigidBody(mesh) {
  scene.add(mesh)
  rigidBodies.push(mesh)
  physicsWorld.addRigidBody(mesh.userData.body)
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  if (keyboard.pressed.mouse && magnitude.value < maxMagnitude)
    magnitude.value = parseFloat(magnitude.value) + .2

  const dt = clock.getDelta()
  physicsWorld.stepSimulation(dt, 10)
  rigidBodies.forEach(updateMesh)
  renderer.render(scene, camera)
}()

/* EVENTS */

const raycaster = new THREE.Raycaster()

window.addEventListener('pointerup', e => {
  const mouse = normalizeMouse(e)
  raycaster.setFromCamera(mouse, camera)
  const pos = new THREE.Vector3().copy(raycaster.ray.direction).add(raycaster.ray.origin)
  const ball = createBall({ radius: .4, mass: 5, pos })
  addRigidBody(ball)
  pos.copy(raycaster.ray.direction).multiplyScalar(magnitude.value)
  ball.userData.body.setLinearVelocity(new AMMO.btVector3(pos.x, pos.y, pos.z))
  magnitude.value = minMagnitude
})