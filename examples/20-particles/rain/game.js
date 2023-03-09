import { scene, camera, renderer } from '/utils/scene.js'
import { hemLight } from '/utils/light.js'
import { Rain } from '/utils/classes/Particles.js'

hemLight()
renderer.setClearColor(0x000000)

const particles = new Rain({ color: 0x9999ff, size: 2, minRadius: 50, maxRadius: 500, })
scene.add(particles.mesh)

/* LOOP */

void function animate() {
  particles.update({ min: -300, max: 300 })
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}()
