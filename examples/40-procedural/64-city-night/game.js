import * as THREE from 'three'
import { scene, camera, renderer, createOrbitControls, hemLight } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { createNightCity } from '/utils/city.js'

hemLight({ intensity: 1.25 })
scene.background = new THREE.Color(0x070b34)

const mapSize = 400
const numBuildings = 200

camera.position.set(0, mapSize * .3, mapSize * .4)
createOrbitControls()

const floor = createFloor({ size: mapSize * 1.1, color: 0x101018 })

const city = createNightCity({ numBuildings, mapSize })

scene.add(floor, city)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}()