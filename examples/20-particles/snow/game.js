import { scene, camera, renderer } from '/utils/scene.js'
import { hemLight } from '/utils/light.js'
import { Snow } from '/utils/classes/Particles.js'

hemLight()
renderer.setClearColor(0x000000)

const particles = new Snow({ size: 7, minRadius: 50, maxRadius: 500 })
scene.add(particles.mesh)

/* LOOP */

void function loop() {
  particles.update({ min: -100, max: 100, minVelocity: 100, maxVelocity: 300 })
  renderer.render(scene, camera)
  requestAnimationFrame(loop)
}()
