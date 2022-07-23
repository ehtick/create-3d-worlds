import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { createSunLight } from '/utils/light.js'
import { createGlobe } from '/utils/planets.js'

const controls = createOrbitControls()

scene.add(createSunLight())
scene.add(createGlobe())

void function loop() {
  requestAnimationFrame(loop)
  controls.update()
  renderer.render(scene, camera)
}()