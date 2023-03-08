import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { hemLight } from '/utils/light.js'
import { Rain } from '/utils/classes/Particles.js'

createOrbitControls()
hemLight()

const particles = new Rain({ file: 'smoke.png', size: 9, num: 100, minRange: 1, maxRange: 3, color: 0x999999 })
scene.add(particles.mesh)
particles.mesh.rotateX(Math.PI)

/* LOOP */

void function animate() {
  particles.update({ rotateY: .009, min: -9, max: 3, minVelocity: .02, maxVelocity: .05 })
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}()
