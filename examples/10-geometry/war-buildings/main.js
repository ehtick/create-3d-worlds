import * as THREE from 'three'
import { camera, scene, renderer, createOrbitControls } from '/utils/scene.js'
import { createGround } from '/utils/ground.js'
import { createTexturedBuilding } from '/utils/city.js'

camera.position.set(0, .5, 3)

const loader = new THREE.TextureLoader()
loader.setPath('/assets/textures/buildings/')
createOrbitControls()

const light = new THREE.PointLight(0xffffff)
light.position.set(0, 15, 10)
scene.add(light)
const light2 = new THREE.AmbientLight(0x444444)
scene.add(light2)

const floor = createGround()
scene.add(floor)

const warehouse = createTexturedBuilding({ frontFile: 'buildings/warehouse.jpg', backFile: 'buildings/warehouse.jpg', topFile: 'terrain/concrete.jpg', bumpScale: .03 })
scene.add(warehouse)
warehouse.translateX(-2)

const warRuin = createTexturedBuilding({ width: 1.2, frontFile: 'buildings/ruin-01.jpg', backFile: 'buildings/ruin-02.jpg', rightFile: 'buildings/ruin-03.jpg', leftFile: 'buildings/ruin-04.jpg', topFile: 'terrain/beton-krater.jpg', bumpScale: .03 })
scene.add(warRuin)

const airport = createTexturedBuilding({ frontFile: 'buildings/airport.png', backFile: 'buildings/airport.png', rightFile: 'buildings/airport-side.png', leftFile: 'buildings/airport-side.png', topFile: 'terrain/beton.gif', bumpScale: .01 })
scene.add(airport)
airport.translateZ(-1.5)

const ruin = createTexturedBuilding({ width: 1.5, frontFile: 'buildings/ruin-front.jpg', backFile: 'buildings/ruin-back.jpg', rightFile: 'buildings/ruin-side.jpg', leftFile: 'buildings/ruin-side.jpg', bumpScale: .02 })
scene.add(ruin)
ruin.translateX(2)

/* UPDATE */

void function update() {
  requestAnimationFrame(update)
  renderer.render(scene, camera)
}()
