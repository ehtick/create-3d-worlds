import * as THREE from 'three'
import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { createCity } from '/utils/city.js'
import { createMoon } from '/utils/light.js'

// hemLight({ intensity: 1.25 })
scene.background = new THREE.Color(0x070b34)

const mapSize = 400

camera.position.set(0, mapSize * .3, mapSize * .4)
createOrbitControls()

const floor = createFloor({ size: mapSize * 1.1, color: 0x101018 })

const city = createCity({ mapSize, numTrees: 50 })

scene.add(floor, city)

scene.add(createMoon())

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}()