import * as THREE from 'three'
import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { createBuildingTexture } from '/utils/city.js'
import { createSun } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'

function createTexturedBuilding({ width = 2, height = 1, depth = width, color = 0x999999, path = '/assets/textures/', textures = [], defaultMap = createBuildingTexture() } = {}) {
  const textureLoader = new THREE.TextureLoader()
  textureLoader.setPath(path)
  const maps = textures.map(t => textureLoader.load(t))

  const geometry = new THREE.BoxGeometry(width, height, depth)
  const materials = [
    new THREE.MeshPhongMaterial({ map: maps[0] || defaultMap }),  // 0: right
    new THREE.MeshPhongMaterial({ map: maps[1] || defaultMap }),  // 1: left
    new THREE.MeshPhongMaterial({ color, map: maps[2] || null }), // 2: top
    new THREE.MeshBasicMaterial({ color }),                       // bottom
    new THREE.MeshPhongMaterial({ map: maps[3] || defaultMap }),  // 3: front
    new THREE.MeshPhongMaterial({ map: maps[4] || defaultMap }),  // 4: back
  ]

  const mesh = new THREE.Mesh(geometry, materials)
  mesh.translateY(height / 2)
  return mesh
}

const controls = createOrbitControls()
camera.position.set(0, 15, 30)

scene.add(createSun({ position: [50, 100, 50] }))
scene.add(createFloor())

const artBuilding = createTexturedBuilding({ width: 20, height: 15, depth: 10, textures: ['banksy/flower.jpg'] })
scene.add(artBuilding)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  controls.update()
  renderer.render(scene, camera)
}()
