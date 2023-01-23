import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { createGraffitiBuilding } from '/utils/city.js'
import { createSun } from '/utils/light.js'
import { shuffle } from '/utils/helpers.js'

createOrbitControls()

const size = 400

camera.position.set(0, size * .33, size * .9)
camera.lookAt(scene.position)

scene.add(createSun({ position: [50, 100, 50] }))

const floor = createFloor({ size: size * 1.1 })
scene.add(floor)

const fieldWidth = 20
const coords = []

for (let i = -size * .5; i < size * .5; i += fieldWidth)
  for (let j = -size * .5; j < size * .5; j += fieldWidth)
    coords.push([i, j])

shuffle(coords)

for (let i = 0; i < 100; i++) {
  const [x, z] = coords[i]
  const building = await createGraffitiBuilding({ x, z })
  scene.add(building)
}

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}()
