import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { hemLight } from '/utils/light.js'
import { Rain } from '/utils/classes/Particles.js'

createOrbitControls()
hemLight()

const particles = new Rain({ file: 'fire.png', size: 30, num: 100, minRange: 1.5, maxRange: 3, color: 0xffffff })
particles.mesh.rotateX(Math.PI)
scene.add(particles.mesh)

/* LOOP */

void function animate() {
  particles.update({ rotateY: .009, min: -8, max: 4, minVelocity: .015, maxVelocity: .05 })

  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}()
