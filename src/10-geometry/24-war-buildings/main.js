import * as THREE from '/node_modules/three127/build/three.module.js'
import { camera, scene, renderer, createOrbitControls } from '/utils/scene.js'
import { createGround } from '/utils/ground.js'
import { createBuilding } from '/utils/geometry.js'

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

const warehouse = createBuilding({ frontFile: 'warehouse.jpg', backFile: 'warehouse.jpg', topFile: 'concrete.jpg', bumpScale: .03 })
scene.add(warehouse)
warehouse.translateX(-2)

const warRuin = createBuilding({ width: 1.2, frontFile: 'ruin-01.jpg', backFile: 'ruin-02.jpg', rightFile: 'ruin-03.jpg', leftFile: 'ruin-04.jpg', topFile: 'beton-krater.jpg', bumpScale: .03 })
scene.add(warRuin)

const airport = createBuilding({ frontFile: 'airport.png', backFile: 'airport.png', rightFile: 'airport-side.png', leftFile: 'airport-side.png', topFile: 'beton.gif', bumpScale: .01 })
scene.add(airport)
airport.translateZ(-1.5)

const ruin = createBuilding({ width: 1.5, frontFile: 'ruin-front.jpg', backFile: 'ruin-back.jpg', rightFile: 'ruin-side.jpg', leftFile: 'ruin-side.jpg', bumpScale: .02 })
scene.add(ruin)
ruin.translateX(2)

/* UPDATE */

void function update() {
  requestAnimationFrame(update)
  renderer.render(scene, camera)
}()
