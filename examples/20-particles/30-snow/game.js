import { scene, camera, renderer, hemLight } from '/utils/scene.js'
import { createSnow, updateSnow } from '/utils/particles.js'

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
