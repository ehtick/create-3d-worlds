import { scene, renderer, camera } from '/utils/scene.js'
import { cityFromMatrix } from '/utils/mazes.js'
import { createCityLights } from '/utils/city.js'
import { truePrimsMatrix } from '/utils/mazes/algorithms.js'
import { createFloor } from '/utils/ground.js'
import { hemLight } from '/utils/light.js'
import { PartisanPlayer } from '/utils/actors/ww2/Partisan.js'

const buildingSize = 10
const matrixSize = 15

const matrix = truePrimsMatrix(matrixSize)

hemLight({ intensity: 1.25 })

camera.position.set(0, 7, 10)

const maze = cityFromMatrix({ matrix, size: buildingSize })
scene.add(maze)

const numCityLights = 2 // max is 16
const mapSize = buildingSize * matrixSize * 2

const streetLights = createCityLights({ mapSize, numLights: numCityLights })
const floor = createFloor({ size: mapSize * 1.1, color: 0x101018 })

scene.add(floor, streetLights)

const player = new PartisanPlayer({ camera, solids: maze })
scene.add(player.mesh)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  player.update()
  renderer.render(scene, camera)
}()
