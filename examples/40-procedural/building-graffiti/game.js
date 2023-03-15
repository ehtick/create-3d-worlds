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
building.translateX(20)

const artBuilding = createTexturedBuilding({ width: 20, height: 10, depth: 10, frontFile: 'buildings/warehouse.jpg', backFile: 'buildings/warehouse.jpg', topFile: 'terrain/concrete.jpg', bumpScale: .03 })
scene.add(artBuilding)
artBuilding.translateX(-20)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  controls.update()
  renderer.render(scene, camera)
}()
