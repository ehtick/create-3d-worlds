import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { generateSquareMaze, meshFromMatrix } from '/utils/mazes.js'
import { initLights } from '/utils/light.js'

initLights()

camera.position.set(0, 7, 10)
createOrbitControls()

const matrix = generateSquareMaze(15)

const mazeMesh = meshFromMatrix({ matrix, maxSize: 5 })
scene.add(mazeMesh)

void function render() {
  requestAnimationFrame(render)
  renderer.render(scene, camera)
}()