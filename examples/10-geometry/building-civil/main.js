import { camera, scene, renderer, createOrbitControls } from '/utils/scene.js'
import { createGround } from '/utils/ground.js'
import { createTexturedBuilding } from '/utils/city.js'
import { createSun } from '/utils/light.js'

camera.position.set(0, 5, 30)

createOrbitControls()

scene.add(createSun())

const floor = createGround()
scene.add(floor)

// backFile: 'buildings/building-back.png'
const building = createTexturedBuilding({ width: 20, height: 10, depth: 10, defaultFile: 'buildings/building-front.png', color: 0xC2B99D })
scene.add(building)
building.translateX(-30)

// backFile: 'buildings/building-blue-back.png'
const greenBlue = createTexturedBuilding({ width: 20, height: 10, depth: 10, defaultFile: 'buildings/building-blue-front.png' })
scene.add(greenBlue)

// backFile: 'buildings/building-green-back.png',
const greenBuilding = createTexturedBuilding({ width: 20, height: 10, depth: 10, defaultFile: 'buildings/building-green-front.png', color: 0xB1AFAB })
scene.add(greenBuilding)
greenBuilding.translateX(30)

/* UPDATE */

void function update() {
  requestAnimationFrame(update)
  renderer.render(scene, camera)
}()
