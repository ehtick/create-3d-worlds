import * as THREE from 'three'
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js'
import { scene, camera, renderer } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { createBuilding } from '/utils/city.js'

renderer.setClearColor(0x070b34)

const buildings = []
const mapSize = 400

camera.position.set(0, mapSize * .33, mapSize * .9)
camera.lookAt(scene.position)

const light = new THREE.DirectionalLight(0xffffff)
light.position.set(1, 1, 1)
scene.add(light)

const floor = createFloor({ size: 600, color: 0x303038 })
scene.add(floor)

for (let i = 0; i < 100; i++) {
  const building = createBuilding({ width: 10, height: 10, night: true, addWindows: false, addTexture: true })
  buildings.push(building)
  scene.add(building)
}

/* FUNCTIONS */

function grow() {
  buildings.forEach(building => {
    const sec = Math.random() * 2 + 1
    const y = 1 + Math.random() * 20 + (Math.random() < 0.1 ? 15 : 0)

    new TWEEN.Tween(building.scale)
      .delay(sec)
      .to({
        x: 1 + Math.random() * 3,
        y,
        z: 1 + Math.random() * 3,
      })
      .start()

    new TWEEN.Tween(building.position)
      .delay(sec)
      .to({
        x: -mapSize * .5 + Math.random() * mapSize,
        z: -mapSize * .5 + Math.random() * mapSize,
        y: y / 2,
      })
      .start()
  })
}

grow()

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  TWEEN.update()
  renderer.render(scene, camera)
}()

/* EVENTS */

document.addEventListener('click', grow)