import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { createBuilding, createGraffitiTexture } from '/utils/city.js'
import { createSun } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'

const controls = createOrbitControls()
camera.position.set(0, 25, 50)

scene.add(createSun({ position: [50, 50, 50] }))
scene.add(createFloor())

scene.add(createBuilding({ map: createGraffitiTexture() }))

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}()
