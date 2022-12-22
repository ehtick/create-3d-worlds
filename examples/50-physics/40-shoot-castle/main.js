import * as THREE from 'three'
import { Ammo, createBox } from '/utils/physics.js'
import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { normalizeMouse } from '/utils/helpers.js'
import PhysicsWorld from '/utils/classes/PhysicsWorld.js'
import { createGround } from '/utils/ground.js'
import { createSphere } from '/utils/geometry.js'

const world = new PhysicsWorld()

createOrbitControls()
camera.position.set(0, 50, 300)
camera.lookAt(0, 50, 0)

const sun = createSun({ position: [-50, 150, 50] })
scene.add(sun)

const ground = createGround({ size: 1000, color: 0x509f53 })
world.add(ground, 0)

buildCastle()

/* FUNCTIONS */

export function buildCastle({ rows = 8, brickInWall = 20, rowSize = 8 } = {}) {
  const spacing = 0.2
  const brickSize = rowSize + spacing
  const wallWidth = brickSize * brickInWall

  const isEven = y => Math.floor(y / brickSize) % 2 == 0

  function addBlock(x, y, z) {
    const box = createBox({ width: rowSize, depth: rowSize, height: rowSize, mass: 2, pos: { x, y, z } })
    world.add(box, 2)
  }

  function addFourBlocks(x, y) {
    addBlock(x, y, 0)
    addBlock(x, y, wallWidth)
    addBlock(0, y, x)
    addBlock(wallWidth, y, x)
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
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const dt = clock.getDelta()
  world.update(dt)
  renderer.render(scene, camera)
}()

/* EVENTS */

const raycaster = new THREE.Raycaster()

window.addEventListener('pointerup', e => {
  const mouse = normalizeMouse(e)
  raycaster.setFromCamera(mouse, camera)
  const pos = new THREE.Vector3().copy(raycaster.ray.direction).add(raycaster.ray.origin)
  const ball = createSphere({ radius: 3, color: 0x202020 })
  ball.position.copy(pos)
  world.add(ball, 5)
  pos.copy(raycaster.ray.direction).multiplyScalar(100)
  ball.userData.body.setLinearVelocity(new Ammo.btVector3(pos.x, pos.y, pos.z))
})