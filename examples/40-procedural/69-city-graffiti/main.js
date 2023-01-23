import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { createGraffitiBuilding } from '/utils/city.js'
import { createSun } from '/utils/light.js'
import { yieldRandomCoord } from '/utils/helpers.js'

createOrbitControls()

const size = 200
const numBuildings = 50

camera.position.set(0, size * .33, size * .9)
camera.lookAt(scene.position)

scene.add(createSun({ position: [50, 100, 50] }))

const floor = createFloor({ size: size * 1.2 })
scene.add(floor)

const coords = yieldRandomCoord({ mapSize: size })

for (let i = 0; i < numBuildings; i++) {
  const [x, z] = coords.next().value
  const building = await createGraffitiBuilding({ x, z })
  scene.add(building)
}

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}()
