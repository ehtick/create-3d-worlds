import * as THREE from 'three'
import { AMMO, createBox, createBall, createPhysicsWorld, updateMesh } from '/utils/physics.js'
import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { normalizeMouse } from '/utils/helpers.js'
import keyboard from '/utils/classes/Keyboard.js'

const magnitude = document.getElementById('magnitude')
const minMagnitude = 15
const maxMagnitude = 30
magnitude.value = minMagnitude

createOrbitControls()
camera.position.set(0, 50, 500)
camera.lookAt(0, 50, 0)

const rigidBodies = []

const sun = createSun({ position: [-5, 10, 5] })
scene.add(sun)

const physicsWorld = createPhysicsWorld()

const ground = createBox({ width: 1500, depth: 1500, height: 1, mass: 0, pos: { x: 0, y: -0.5, z: 0 }, color: 0xFFFFFF })
addRigidBody(ground)

buildCastle()

/* FUNCTIONS */

function addRigidBody(mesh) {
  scene.add(mesh)
  rigidBodies.push(mesh)
  physicsWorld.addRigidBody(mesh.userData.body)
}

export function buildCastle({ rows = 10, brickInWall = 30, rowSize = 10 } = {}) {
  const spacing = 0.2
  const brickSize = rowSize + spacing
  const wallWidth = brickSize * brickInWall

  const blocks = []

  const notPlaceForGate = (x, y) =>
    (x < wallWidth * 3 / 8 || x > wallWidth * 5 / 8) || y > rows * brickSize / 2  // not in center and not to hight

  const isEven = y => Math.floor(y / brickSize) % 2 == 0

  function addBlock(x, y, z) {
    const box = createBox({ width: rowSize, depth: rowSize, height: rowSize, mass: 2, pos: { x, y, z } })
    addRigidBody(box)
  }

  function addFourBlocks(x, y) {
    addBlock(x, y, 0)
    addBlock(x, y, wallWidth)
    addBlock(0, y, x)
    if (notPlaceForGate(x, y)) addBlock(wallWidth, y, x)
  }

  function buildRow(y, x) {
    if (x > wallWidth + 1) return
    if (y < brickSize * (rows - 1))
      addFourBlocks(x, y)
    else if (isEven(x)) addFourBlocks(x, y)
    buildRow(y, x + brickSize)
  }

  function buildWalls(y) {
    if (y > brickSize * rows) return
    const startX = isEven(y) ? 0 : brickSize / 2
    buildRow(y, startX)
    buildWalls(y + brickSize)
  }

  buildWalls(0)

  return blocks
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
  const ball = createBall({ radius: 4, mass: 5, pos })
  addRigidBody(ball)
  pos.copy(raycaster.ray.direction).multiplyScalar(100) // magnitude.value
  ball.userData.body.setLinearVelocity(new AMMO.btVector3(pos.x, pos.y, pos.z))
  magnitude.value = minMagnitude
})