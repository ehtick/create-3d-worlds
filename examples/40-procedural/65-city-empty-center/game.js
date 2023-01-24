import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { createFloor, createGround } from '/utils/ground.js'
import { createNightCity } from '/utils/city.js'
import { createTrees } from '/utils/geometry/trees.js'

const mapSize = 400
const center = 50
const numBuildings = 300

camera.position.set(0, mapSize * .3, mapSize * .4)
createOrbitControls()
renderer.setClearColor(0x070b34)

const floor = createFloor({ size: mapSize * 1.1 })
scene.add(floor)

const city = createNightCity({ mapSize, numBuildings, emptyCenter: center })
scene.add(city)

const ground = createGround({ size: center * 1.5, circle: false })
ground.translateY(.1)
scene.add(ground)

scene.add(createTrees({ mapSize: center * 1.25, n: 30 }))

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}()