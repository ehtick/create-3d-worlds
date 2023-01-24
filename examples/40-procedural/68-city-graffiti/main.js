import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { createGraffitiBuilding } from '/utils/city.js'
import { createSun } from '/utils/light.js'
import { yieldRandomCoord } from '/utils/helpers.js'
import { createTrees, createFirTrees } from '/utils/geometry/trees.js'

createOrbitControls()

const size = 200

camera.position.set(0, size * .33, size * .9)
camera.lookAt(scene.position)

scene.add(createSun({ position: [50, 100, 50] }))

const floor = createFloor({ size: size * 1.2 }) // color: 0x509f53
scene.add(floor)

const coords = yieldRandomCoord({ mapSize: size })

scene.add(createTrees({ coords, n: 40 }))
scene.add(createFirTrees({ coords, n: 10 }))

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}()

for (let i = 0; i < 50; i++) {
  const [x, z] = coords.next().value
  const building = await createGraffitiBuilding({ x, z })
  scene.add(building)
}
