import { scene, camera, renderer } from '/utils/scene.js'
import { hemLight } from '/utils/light.js'
import { Rain } from '/utils/classes/Particles.js'

hemLight()
renderer.setClearColor(0x000000)

const rain = new Rain()
scene.add(rain.particles)

/* LOOP */

void function animate() {
  rain.update()
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}()
