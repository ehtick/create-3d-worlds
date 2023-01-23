import * as THREE from 'three'
import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { createGraffitiBuilding } from '/utils/city.js'
import { createSun } from '/utils/light.js'
import { shuffle } from '/utils/helpers.js'

const { randFloatSpread } = THREE.MathUtils

createOrbitControls()

const size = 400

camera.position.set(0, size * .33, size * .9)
camera.lookAt(scene.position)

scene.add(createSun({ position: [50, 100, 50] }))

const floor = createFloor({ size: size * 1.1 })
scene.add(floor)

function getRandomCoords(mapSize = 400, fieldSize = 20) {
  const coords = []
  for (let i = -mapSize * .5; i < mapSize * .5; i += fieldSize)
    for (let j = -mapSize * .5; j < mapSize * .5; j += fieldSize)
      coords.push([i, j])

  shuffle(coords)
  return coords
}

function* yieldRandomCoord(mapSize = 400, fieldSize = 20, offset = fieldSize * .5) {
  const coords = getRandomCoords(mapSize, fieldSize)

  for (let i = 0; i < 100; i++) {
    const [x, z] = coords[i]
    const xOffset = randFloatSpread(offset), zOffset = randFloatSpread(offset)
    yield [x + xOffset, z + zOffset]
  }
}

const fieldSize = 20
const coords = yieldRandomCoord(size, fieldSize)

for (let i = 0; i < 100; i++) {
  const [x, z] = coords.next().value
  const building = await createGraffitiBuilding({ x, z })
  scene.add(building)
}

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}()
