import * as THREE from 'three'
import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
// import { createGraffitiBuilding } from '/utils/city.js'
import { createSun } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'

function createTexturedBuilding({ width = 2, height = 1, depth = width, color = 0x999999, textures = [] } = {}) {
  const textureLoader = new THREE.TextureLoader()
  textureLoader.setPath('/assets/textures/')
  const geometry = new THREE.BoxGeometry(width, height, depth)

  const maps = textures.map(t => textureLoader.load(t))

  const materials = [
    new THREE.MeshPhongMaterial({ map: maps[0] }), // right
    new THREE.MeshPhongMaterial({ map: maps[1] }), // left
    new THREE.MeshPhongMaterial({ color, map: maps[2] }), // top
    new THREE.MeshBasicMaterial({ color }), // bottom
    new THREE.MeshPhongMaterial({ map: maps[3] }), // front
    new THREE.MeshPhongMaterial({ map: maps[4] }), // back
  ]

  const mesh = new THREE.Mesh(geometry, materials)
  mesh.translateY(height / 2)
  return mesh
}

const controls = createOrbitControls()
camera.position.set(0, 25, 50)

scene.add(createSun({ position: [50, 100, 50] }))
scene.add(createFloor())

const artBuilding = createTexturedBuilding({ width: 20, height: 10, depth: 10, textures: ['buildings/warehouse.jpg', 'buildings/warehouse.jpg', 'terrain/concrete.jpg', 'buildings/warehouse.jpg', 'buildings/warehouse.jpg'] })
scene.add(artBuilding)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  controls.update()
  renderer.render(scene, camera)
}()
