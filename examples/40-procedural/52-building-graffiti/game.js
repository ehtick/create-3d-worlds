import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { createBuilding } from '/utils/city.js'
import { createSun } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'

const controls = createOrbitControls()
camera.position.set(0, 25, 50)

scene.add(createBuilding({ addTexture: true }))
scene.add(createSun({ position: [50, 50, 50] }))
scene.add(createFloor())

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}()
