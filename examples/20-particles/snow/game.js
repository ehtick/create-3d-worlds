import { scene, camera, renderer } from '/utils/scene.js'
import { hemLight } from '/utils/light.js'
import { Snow } from '/utils/classes/Particles.js'

hemLight()
renderer.setClearColor(0x000000)

const snow = new Snow()
scene.add(snow.mesh)

/* LOOP */

void function animate() {
  snow.update()
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}()
