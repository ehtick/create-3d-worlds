import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { createGraffitiBuilding, createTexturedBuilding } from '/utils/city.js'
import { createSun } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'

const controls = createOrbitControls()
camera.position.set(0, 25, 50)

scene.add(createSun({ position: [50, 100, 50] }))
scene.add(createFloor())

const building = createGraffitiBuilding({ chance: .66 })
scene.add(building)
building.translateX(2)

const artBuilding = createTexturedBuilding({ frontFile: 'warehouse.jpg', backFile: 'warehouse.jpg', topFile: 'terrain/concrete.jpg', bumpScale: .03 })
scene.add(artBuilding)
artBuilding.translateX(-2)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  controls.update()
  renderer.render(scene, camera)
}()
