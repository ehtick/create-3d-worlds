import { scene, camera, renderer, hemLight } from '/utils/scene.js'
import { createRain, updateRain } from '/utils/particles.js'

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
