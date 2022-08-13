import {
  scene, camera, renderer, createOrbitControls, hemLight
} from '/utils/scene.js'
import { shaderFromHeightmap } from '/utils/terrain/terrainFromHeightmap.js'
import { dirLight } from '/utils/light.js'

hemLight()
dirLight()

const controls = createOrbitControls()
camera.position.y = 200

const terrain = shaderFromHeightmap({ file: 'yu.png', displacementScale: 50 })
scene.add(terrain)

/* LOOP */

void function update() {
  renderer.render(scene, camera)
  controls.update()
  requestAnimationFrame(update)
}()
