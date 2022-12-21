import * as THREE from 'three'
import { Ammo, createGround, createBall, createWall } from '/utils/physics.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import keyboard from '/utils/classes/Keyboard.js'
import { createSun } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'
import PhysicsWorld from '/utils/classes/PhysicsWorld.js'

const world = new PhysicsWorld()

const minMagnitude = 15
const maxMagnitude = 30
const magnitude = document.getElementById('magnitude')
magnitude.value = minMagnitude

camera.position.set(-2, 1.25, 0)
camera.lookAt(10, 1, 0)

const sun = createSun({ position: [-5, 10, 5] })
scene.add(sun)

const ground = createGround({ size: 40, color: 0x509f53 })
world.add(ground)

const wall = createWall({ brickMass: 3, friction: 5 })
wall.forEach(mesh => {
  world.add(mesh, 3)
})

const { mesh: cannon } = await loadModel({ file: 'weapon/cannon/mortar/mortar.obj', mtl: 'weapon/cannon/mortar/mortar.mtl', size: 1, angle: Math.PI, shouldAdjustHeight: true })
cannon.translateX(-5)
cannon.rotation.reorder('YZX') // 'YZX', 'ZXY', 'XZY', 'YXZ' and 'ZYX'.
scene.add(cannon)
cannon.add(camera)

/* FUNCTIONS */

function shoot() {
  const pos = cannon.position.clone()
  pos.y += 0.9

  const angle = cannon.rotation.y + Math.PI * .5
  const x = magnitude.value * Math.sin(angle)
  const z = magnitude.value * Math.cos(angle)

  const ballDistance = .7
  const b = new THREE.Vector3(ballDistance * Math.sin(angle), 0, ballDistance * Math.cos(angle))
  pos.add(b)
  const ball = createBall({ radius: .22, mass: 4, pos })
  world.add(ball, 4)
  ball.userData.body.setLinearVelocity(new Ammo.btVector3(x, magnitude.value * .2, z))
  magnitude.value = minMagnitude
  cannon.translateX(-.1)
}

function handleInput(cannon, dt) {
  if (keyboard.up) cannon.translateX(dt * .5)
  if (keyboard.down) cannon.translateX(-dt * .5)
  if (keyboard.left) cannon.rotateY(dt * .25)
  if (keyboard.right) cannon.rotateY(-dt * .25)
  if ((keyboard.space || keyboard.pressed.mouse) && magnitude.value < maxMagnitude)
    magnitude.value = parseFloat(magnitude.value) + .2
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const dt = clock.getDelta()
  handleInput(cannon, dt)
  world.update(dt)
  renderer.render(scene, camera)
}()

/* EVENTS */

document.addEventListener('keyup', e => {
  if (e.code == 'Space') shoot()
})

document.addEventListener('mouseup', shoot)