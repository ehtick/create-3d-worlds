import { scene, renderer, camera, clock, createOrbitControls } from '/utils/scene.js'
import Thrust from '/utils/classes/Thrust.js'

createOrbitControls()
camera.position.z = 20

const thrust = new Thrust()
scene.add(thrust.mesh)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()

  thrust.addParticles(delta)
  thrust.updateParticles(delta)
  thrust.updateGeometry()

  renderer.render(scene, camera)
}()
