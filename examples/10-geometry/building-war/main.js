import * as THREE from 'three'
import { camera, scene, renderer, createOrbitControls } from '/utils/scene.js'
import { createGround } from '/utils/ground.js'
import { createTexturedBuilding } from '/utils/city.js'

camera.position.set(0, 15, 35)
createOrbitControls()

const light = new THREE.PointLight(0xffffff)
light.position.set(0, 15, 10)
scene.add(light)

const light2 = new THREE.AmbientLight(0x444444)
scene.add(light2)

const floor = createGround()
scene.add(floor)

const warehouse = createTexturedBuilding({ width: 20, height: 10, depth: 10, frontFile: 'buildings/warehouse.jpg', backFile: 'buildings/warehouse.jpg', topFile: 'terrain/concrete.jpg', bumpScale: .03 })
scene.add(warehouse)
warehouse.translateX(-20)

const warehouse2 = createTexturedBuilding({ width: 20, height: 10, depth: 20, frontFile: 'buildings/warehouse.jpg', backFile: 'buildings/warehouse.jpg', leftFile: 'buildings/warehouse.jpg', rightFile: 'buildings/warehouse.jpg', topFile: 'terrain/concrete.jpg', bumpScale: .03 })
scene.add(warehouse2)
warehouse2.translateZ(20)

const warRuin = createTexturedBuilding({ width: 12, height: 10, depth: 10, frontFile: 'buildings/ruin-01.jpg', backFile: 'buildings/ruin-02.jpg', rightFile: 'buildings/ruin-03.jpg', leftFile: 'buildings/ruin-04.jpg', topFile: 'terrain/beton-krater.jpg', bumpScale: .03 })
scene.add(warRuin)

const airport = createTexturedBuilding({ width: 20, height: 10, depth: 10, frontFile: 'buildings/airport.png', backFile: 'buildings/airport.png', rightFile: 'buildings/airport-side.png', leftFile: 'buildings/airport-side.png', topFile: 'terrain/beton.gif', bumpScale: .01 })
scene.add(airport)
airport.translateZ(-15)

const ruin = createTexturedBuilding({ width: 15, height: 10, depth: 10, frontFile: 'buildings/ruin-front.jpg', backFile: 'buildings/ruin-back.jpg', rightFile: 'buildings/ruin-side.jpg', leftFile: 'buildings/ruin-side.jpg', bumpScale: .02 })
scene.add(ruin)
ruin.translateX(20)

/* UPDATE */

void function update() {
  requestAnimationFrame(update)
  renderer.render(scene, camera)
}()
