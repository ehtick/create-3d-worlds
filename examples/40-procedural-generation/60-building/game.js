import * as THREE from 'three'
import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { randomInRange } from '/utils/helpers.js'
// import { createBuilding } from '/utils/city.js'
import { material } from '/utils/shaders/windows.js'

const controls = createOrbitControls()
camera.position.set(0, 75, 75)
renderer.setClearColor(0x070b34)

const toonMaterial = new THREE.MeshToonMaterial({ color: 0x000000 })

function createBuilding({
  width = randomInRange(8, 20), height = randomInRange(width * 2, width * 4),
} = {}) {
  const geometry = new THREE.BoxGeometry(width, height, width)
  geometry.translate(0, height * .5, 0)

  const building = new THREE.Mesh(
    geometry,
    [material, material, toonMaterial, toonMaterial, material, material]
  )
  return building
}

scene.add(createBuilding())

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}()
