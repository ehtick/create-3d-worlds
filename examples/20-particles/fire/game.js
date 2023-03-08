import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { hemLight } from '/utils/light.js'
import { Snow } from '/utils/classes/Particles.js'

createOrbitControls()
hemLight()

const snow = new Snow({ file: 'fire.png', size: 30, num: 100, minRange: 1, maxRange: 3 })
scene.add(snow.mesh)
snow.mesh.rotateX(Math.PI)

/* LOOP */

void function animate() {
  snow.update({ rotateY: .009, min: -4, max: 4, minVelocity: .015, maxVelocity: .05 })
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}()
