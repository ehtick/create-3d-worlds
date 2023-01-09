import * as THREE from 'three'
import { Ammo } from '/utils/physics.js'
import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { normalizeMouse } from '/utils/helpers.js'
import PhysicsWorld from '/utils/classes/PhysicsWorld.js'
import { createGround } from '/utils/ground.js'
import { createSphere, buildSimpleCastle } from '/utils/geometry.js'

const world = new PhysicsWorld()
const raycaster = new THREE.Raycaster()

createOrbitControls()
camera.position.set(10, 5, 35)
camera.lookAt(10, 2, 0)

const sun = createSun({ position: [-50, 150, 50] })
scene.add(sun)

const ground = createGround({ size: 1000, color: 0x509f53 })
world.add(ground, 0)

buildSimpleCastle().forEach(block => world.add(block, 2))

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const dt = clock.getDelta()
  world.update(dt)
  renderer.render(scene, camera)
}()

/* EVENTS */

window.addEventListener('pointerup', e => {
  const mouse = normalizeMouse(e)
  raycaster.setFromCamera(mouse, camera)

  const pos = new THREE.Vector3().copy(raycaster.ray.direction).add(raycaster.ray.origin)
  const ball = createSphere({ radius: 2, color: 0x202020 })
  ball.position.copy(pos)
  world.add(ball, 5)

  const force = new THREE.Vector3().copy(raycaster.ray.direction).multiplyScalar(50)
  ball.userData.body.setLinearVelocity(new Ammo.btVector3(force.x, force.y, force.z))
})