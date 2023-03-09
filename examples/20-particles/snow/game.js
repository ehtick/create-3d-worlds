import { scene, camera, renderer } from '/utils/scene.js'
import { hemLight } from '/utils/light.js'
import { Snow } from '/utils/classes/Particles.js'

hemLight()
renderer.setClearColor(0x000000)

const particles = new Snow()
scene.add(particles.mesh)

/* LOOP */

void function loop() {
  particles.update()
  renderer.render(scene, camera)
  requestAnimationFrame(loop)
}()
