import * as THREE from 'three'
import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { cityFromMatrix } from '/utils/mazes.js'
import { simplifiedPrimsMatrix } from '/utils/mazes/algorithms.js'
import { createCityLights } from '/utils/city.js'
import { createFloor } from '/utils/ground.js'
import { hemLight } from '/utils/light.js'

const buildingSize = 3
const matrixSize = 15

const matrix = simplifiedPrimsMatrix(matrixSize)

hemLight({ intensity: 1.25 })
scene.background = new THREE.Color(0x070b34)

camera.position.set(0, 7, 10)
const controls = createOrbitControls()

const maze = cityFromMatrix({ matrix, size: buildingSize, maxHeight: buildingSize * 1.66 })
scene.add(maze)

const numCityLights = 8 // max is 16
const mapSize = buildingSize * matrixSize * 2

const streetLights = createCityLights({ size: mapSize, numLights: numCityLights })
const floor = createFloor({ size: mapSize * 1.1, color: 0x101018 })

scene.add(floor, streetLights)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  controls.update()
  renderer.render(scene, camera)
}()
