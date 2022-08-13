import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { shaderFromHeightmap } from '/utils/terrain/terrainFromHeightmap.js'
import { hemLight } from '/utils/light.js'

hemLight()
createOrbitControls()
camera.position.y = 150

const terrain = shaderFromHeightmap({ file: 'wiki.png' })
scene.add(terrain)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}()
