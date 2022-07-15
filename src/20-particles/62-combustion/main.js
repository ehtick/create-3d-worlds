import { camera, scene, renderer } from '/utils/scene.js'
import Combustion from './Combustion.js'

const fire = new Combustion()
scene.add(fire.mesh)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  fire.update()
  renderer.render(scene, camera)
}()