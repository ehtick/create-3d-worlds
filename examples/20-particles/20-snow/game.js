import { scene, camera, renderer } from '/utils/scene.js'
import { createSnow, updateSnow } from '/utils/particles.js'
import { hemLight } from '/utils/light.js'

hemLight()
renderer.setClearColor(0x000000)

const snow = createSnow()
scene.add(snow)

/* LOOP */

void function animate() {
  updateSnow({ particles: snow, minY: -300, maxY: 300 })
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}()
