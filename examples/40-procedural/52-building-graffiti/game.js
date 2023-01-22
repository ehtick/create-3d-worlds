import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { createGraffitiBuilding } from '/utils/city.js'
import { createSun } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'

const controls = createOrbitControls()
camera.position.set(0, 25, 50)

scene.add(createSun({ position: [50, 100, 50] }))
scene.add(createFloor())

scene.add(createGraffitiBuilding({ color: 0xffffff }))

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}()
