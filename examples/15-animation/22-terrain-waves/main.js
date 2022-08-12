import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { createCraters, wave } from '/utils/ground.js'

camera.position.set(0, 20, 20)
createOrbitControls()

const terrain = createCraters()
scene.add(terrain)

/* LOOP */

let time = 0

void function render() {
  requestAnimationFrame(render)

  wave(terrain.geometry, time)
  time += .003

  renderer.render(scene, camera)
}()