import * as THREE from 'three'
import { Ammo, createWall, createSideWall } from '/utils/physics.js'
import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { normalizeMouse } from '/utils/helpers.js'
import keyboard from '/utils/classes/Keyboard.js'
import PhysicsWorld from '/utils/classes/PhysicsWorld.js'
import { createGround } from '/utils/ground.js'
import { createSphere } from '/utils/geometry.js'

const world = new PhysicsWorld()

const impulse = document.getElementById('impulse')
const minImpulse = impulse.value = 15
const maxImpulse = 30

createOrbitControls()
camera.position.set(-10, 1.5, 0)
camera.lookAt(10, 0, 0)

const sun = createSun({ position: [-5, 10, 5] })
scene.add(sun)

const ground = createGround({ size: 40, color: 0xFFFFFF })
world.add(ground, 0)

const frontWall = createWall({ rows: 10, columns: 6, brickMass: 5, friction: 5, startX: -3.2 })
const backWall = createWall({ rows: 10, columns: 6, brickMass: 5, friction: 5, startX: 2.2 })
const leftWall = createSideWall({ rows: 10, columns: 6, brickMass: 5, friction: 5, startZ: -3.8 })
const rightWall = createSideWall({ rows: 10, columns: 6, brickMass: 5, friction: 5, startZ: 2.8 })

;[...frontWall, ...backWall, ...leftWall, ...rightWall].forEach(mesh => world.add(mesh))

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  if (keyboard.pressed.mouse && impulse.value < maxImpulse)
    impulse.value = parseFloat(impulse.value) + .2
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
  const ball = createSphere({ r: .4, color: 0x202020 })
  ball.position.copy(pos)
  world.add(ball, 5)
  pos.copy(raycaster.ray.direction).multiplyScalar(impulse.value)
  ball.userData.body.setLinearVelocity(new Ammo.btVector3(pos.x, pos.y, pos.z))
  impulse.value = minImpulse
})