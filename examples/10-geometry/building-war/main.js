import { camera, scene, renderer, createOrbitControls } from '/utils/scene.js'
import { createGround } from '/utils/ground.js'
import { createTexturedBuilding } from '/utils/city.js'
import { createSun } from '/utils/light.js'

camera.position.set(0, 15, 35)
createOrbitControls()

scene.add(createSun())

const floor = createGround()
scene.add(floor)

// topFile: 'terrain/concrete.jpg'
const warehouse = createTexturedBuilding({ width: 20, height: 10, depth: 10, defaultFile: 'buildings/warehouse.jpg', sideHalf: true })

scene.add(warehouse)
warehouse.translateX(-20)

// topFile: 'terrain/concrete.jpg'
const warehouse2 = createTexturedBuilding({ width: 20, height: 10, depth: 20, defaultFile: 'buildings/warehouse.jpg' })
scene.add(warehouse2)
warehouse2.translateZ(20)

// topFile: 'terrain/beton-krater.jpg'
const warRuin = createTexturedBuilding({ width: 12, height: 10, depth: 10, defaultFile: 'buildings/ruin-01.jpg', sideHalf: true })
scene.add(warRuin)

// topFile: 'terrain/beton.gif'
const airport = createTexturedBuilding({ width: 20, height: 10, depth: 10, defaultFile: 'buildings/airport.png', sideHalf: true })
scene.add(airport)
airport.translateZ(-15)

const ruin = createTexturedBuilding({ width: 15, height: 10, depth: 10, defaultFile: 'buildings/ruin-front.jpg', sideHalf: true })
scene.add(ruin)
ruin.translateX(20)

/* UPDATE */

void function update() {
  requestAnimationFrame(update)
  renderer.render(scene, camera)
}()
