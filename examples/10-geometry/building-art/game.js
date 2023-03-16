import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { createTexturedBuilding } from '/utils/city.js'
import { createSun } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'

const controls = createOrbitControls()
camera.position.set(0, 15, 30)

scene.add(createSun({ position: [50, 100, 50] }))
scene.add(createFloor())

const artBuilding = createTexturedBuilding({ width: 20, height: 15, depth: 10, files: ['banksy/flower.jpg'] })
scene.add(artBuilding)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  controls.update()
  renderer.render(scene, camera)
}()
