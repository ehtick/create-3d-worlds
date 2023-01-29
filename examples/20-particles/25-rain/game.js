import { scene, camera, renderer } from '/utils/scene.js'
import { createRain, updateRain } from '/utils/particles.js'
import { hemLight } from '/utils/light.js'

hemLight()
renderer.setClearColor(0x000000)

const rain = createRain()
scene.add(rain)

/* LOOP */

void function animate() {
  updateRain({ particles: rain, minY: -300, maxY: 300 })
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}()
