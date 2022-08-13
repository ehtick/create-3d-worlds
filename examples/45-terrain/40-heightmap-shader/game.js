import * as THREE from 'three'
import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { material } from '/utils/shaders/heightmap-terrain.js'
import terrainFromHeightmap from '/utils/terrain/terrainFromHeightmap.js'

import { hemLight } from '/utils/light.js'

const loader = new THREE.TextureLoader()

hemLight()
createOrbitControls()
camera.position.y = 150

const terrain = terrainFromHeightmap({ file: 'wiki.png' })
terrain.material = material
scene.add(terrain)

material.uniforms.heightmap.value = loader.load('/assets/heightmaps/wiki.png')

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}()
