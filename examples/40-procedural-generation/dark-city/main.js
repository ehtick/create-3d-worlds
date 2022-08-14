import * as THREE from 'three'
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js'
import { scene, camera, renderer } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { createSimpleBuilding } from '/utils/city.js'

const buildings = []
const mapSize = 400
scene.fog = new THREE.FogExp2(0xd0e0f0, 0.0025)

camera.position.set(0, mapSize * .33, mapSize * .9)
camera.lookAt(scene.position)

scene.fog = new THREE.FogExp2(0x1E2630, 0.002)
renderer.setClearColor(0x1E2630)

let light = new THREE.DirectionalLight(0xffffff)
light.position.set(1, 1, 1)
scene.add(light)
light = new THREE.AmbientLight(0x222222)
scene.add(light)

const floor = createFloor({ size: 600 })
scene.add(floor)

for (let i = 0; i < 100; i++) {
  const building = createSimpleBuilding({ width: 10, height: 10 })
  buildings.push(building)
  scene.add(building)
}

/* FUNCTIONS */

function grow() {
  buildings.forEach(box => {
    const sec = Math.random() * 2 + 1
    const y = 1 + Math.random() * 20 + (Math.random() < 0.1 ? 15 : 0)

    new TWEEN.Tween(box.scale)
      .delay(sec)
      .to({
        x: 1 + Math.random() * 3,
        y,
        z: 1 + Math.random() * 3,
      })
      .start()

    new TWEEN.Tween(box.position)
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