import * as THREE from 'three'
import { camera, scene, renderer, createOrbitControls } from '/utils/scene.js'
import { createGround } from '/utils/ground.js'
import { createTexturedBuilding } from '/utils/city.js'

camera.position.set(0, 5, 30)

createOrbitControls()

const light = new THREE.PointLight(0xffffff)
light.position.set(0, 15, 10)
scene.add(light)
const light2 = new THREE.AmbientLight(0x444444)
scene.add(light2)

const floor = createGround()
scene.add(floor)

const building = createTexturedBuilding({ width: 20, height: 10, depth: 10, frontFile: 'buildings/building-front.png', backFile: 'buildings/building-back.png', color: 0xC2B99D })
scene.add(building)
building.translateX(-30)

const greenBlue = createTexturedBuilding({ width: 20, height: 10, depth: 10, frontFile: 'buildings/building-blue-front.png', backFile: 'buildings/building-blue-back.png' })
scene.add(greenBlue)

const greenBuilding = createTexturedBuilding({ width: 20, height: 10, depth: 10, frontFile: 'buildings/building-green-front.png', backFile: 'buildings/building-green-back.png', color: 0xB1AFAB })
scene.add(greenBuilding)
greenBuilding.translateX(30)

/* UPDATE */

void function update() {
  requestAnimationFrame(update)
  renderer.render(scene, camera)
}()
