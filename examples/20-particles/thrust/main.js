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
  thrust.update(delta)
  renderer.render(scene, camera)
}()
