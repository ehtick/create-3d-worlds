import * as THREE from 'three'
import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { randomInRange } from '/utils/helpers.js'
// import { createBuilding } from '/utils/city.js'
import { material } from '/utils/shaders/windows.js'

const controls = createOrbitControls()
camera.position.set(0, 25, 50)
renderer.setClearColor(0x070b34)

function createBuilding({
  width = randomInRange(8, 20), height = randomInRange(width * 2, width * 4),
} = {}) {
  const geometry = new THREE.BoxGeometry(width, height, width)
  const toonMaterial = new THREE.MeshToonMaterial({ color: 0x000000 })

  const materials = [material, material, toonMaterial, toonMaterial, material, material]
  const building = new THREE.Mesh(geometry, materials)
  return building
}

scene.add(createBuilding())

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}()
