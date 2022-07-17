import * as THREE from '/node_modules/three127/build/three.module.js'
import { scene, camera, renderer } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'

const buildings = []
const mapSize = 400

camera.animAngle = 0
camera.position.x = Math.cos(camera.animAngle) * 440
camera.position.y = 180
camera.position.z = Math.sin(camera.animAngle) * 440
camera.lookAt(scene.position)

scene.fog = new THREE.FogExp2(0x1E2630, 0.002)
renderer.setClearColor(scene.fog.color)

let light = new THREE.DirectionalLight(0xffffff)
light.position.set(1, 1, 1)
scene.add(light)
light = new THREE.AmbientLight(0x222222)
scene.add(light)

const plane = createFloor({ size: 600 })
scene.add(plane)

const geometry = new THREE.BoxGeometry(10, 10, 10)
for (let i = 0; i < 100; i++) {
  const material = new THREE.MeshPhongMaterial({
    color: [0xfb3550, 0xffffff, 0x000000][Math.random() * 3 |
        0],
    flatShading: true
  })
  buildings.push(new THREE.Mesh(geometry, material))
  scene.add(buildings[i])
}

/* FUNCTIONS */

function grow() {
  buildings.forEach(box => {
    const t = Math.random() * 2 + 1
    TweenMax.to(box.scale, t, {
      x: 1 + Math.random() * 3,
      y: 1 + Math.random() * 20 + (Math.random() < 0.1 ? 15 : 0),
      z: 1 + Math.random() * 3,
    })

    TweenMax.to(box.position, t, {
      x: -mapSize * .5 + Math.random() * mapSize,
      z: -mapSize * .5 + Math.random() * mapSize,
    })
  })
}

grow()

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}()

/* EVENTS */

document.addEventListener('click', grow)