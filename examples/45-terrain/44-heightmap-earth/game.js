import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { terrainFromHeightmap } from '/utils/terrain/terrainFromHeightmap.js'

createOrbitControls()
camera.position.y = 150

const terrain = await terrainFromHeightmap({ file: 'earth.png', scale: 5 })
scene.add(terrain)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}()
