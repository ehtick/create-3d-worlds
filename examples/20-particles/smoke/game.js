import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { hemLight } from '/utils/light.js'
import { Snow } from '/utils/classes/Particles.js'

createOrbitControls()
hemLight()

const snow = new Snow({ file: 'smoke.png', size: 5, num: 200, minRange: 1, maxRange: 3 })
scene.add(snow.mesh)
snow.mesh.rotateX(Math.PI)

/* LOOP */

void function animate() {
  snow.update({ rotateY: .007, min: -3, max: 3, minVelocity: .02, maxVelocity: .04 })
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}()
