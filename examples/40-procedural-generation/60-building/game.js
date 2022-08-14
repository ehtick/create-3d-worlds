import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { createSimpleBuilding } from '/utils/city.js'

const controls = createOrbitControls()
camera.position.set(0, 25, 50)
renderer.setClearColor(0x070b34)

scene.add(createSimpleBuilding())

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}()
