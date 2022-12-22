import * as THREE from 'three'
import { Ammo } from '/utils/physics.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import keyboard from '/utils/classes/Keyboard.js'
import { createSun } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'
import PhysicsWorld from '/utils/classes/PhysicsWorld.js'
import { createGround } from '/utils/ground.js'
import { createSphere, createWall } from '/utils/geometry.js'

const world = new PhysicsWorld()

const impulse = document.getElementById('impulse')
const minImpulse = impulse.value = 15
const maxImpulse = 30

camera.position.set(-2, 1.25, 0)
camera.lookAt(10, 1, 0)

const sun = createSun({ position: [-5, 10, 5] })
scene.add(sun)

const ground = createGround({ size: 40, color: 0x509f53 })
world.add(ground, 0)

createWall({ brickMass: 3, friction: 5 }).forEach(mesh => world.add(mesh))

const { mesh: cannon } = await loadModel({ file: 'weapon/cannon/mortar/mortar.obj', mtl: 'weapon/cannon/mortar/mortar.mtl', size: 1, angle: Math.PI, shouldAdjustHeight: true })
cannon.translateX(-5)
world.add(cannon)
cannon.add(camera)

/* FUNCTIONS */

function shoot() {
  const angle = cannon.rotation.y + Math.PI * .5
  const x = impulse.value * Math.sin(angle)
  const z = impulse.value * Math.cos(angle)

  const distance = .7
  const cannonTop = new THREE.Vector3(distance * Math.sin(angle), 0, distance * Math.cos(angle))

  const pos = cannon.position.clone()
  pos.y += 0.9
  pos.add(cannonTop)

  const ball = createSphere({ r: .22, color: 0x202020 })
  ball.position.copy(pos)
  world.add(ball, 4)

  ball.userData.body.setLinearVelocity(new Ammo.btVector3(x, impulse.value * .2, z))
  cannon.userData.body.applyImpulse(new Ammo.btVector3(-1, 0, 0))
  impulse.value = minImpulse
}

function handleInput(cannon) {
  const { body } = cannon.userData

  if (keyboard.up) body.applyImpulse(new Ammo.btVector3(.1, 0, 0))
  if (keyboard.down) body.applyImpulse(new Ammo.btVector3(-.1, 0, 0))
  if (keyboard.left) body.setAngularVelocity(new Ammo.btVector3(0, .5, 0))
  if (keyboard.right) body.setAngularVelocity(new Ammo.btVector3(0, -.5, 0))

  if ((keyboard.space || keyboard.pressed.mouse) && impulse.value < maxImpulse)
    impulse.value = parseFloat(impulse.value) + .2
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const dt = clock.getDelta()
  handleInput(cannon)
  world.update(dt)
  renderer.render(scene, camera)
}()

/* EVENTS */

document.addEventListener('keyup', e => {
  if (e.code == 'Space') shoot()
})

document.addEventListener('mouseup', shoot)