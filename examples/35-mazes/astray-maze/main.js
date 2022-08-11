import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { generateSquareMaze, createMeshFromMatrix } from '/utils/mazes.js'
import { initLights } from '/utils/light.js'

initLights()
createOrbitControls()

const matrix = generateSquareMaze(15)

const mazeMesh = createMeshFromMatrix({ matrix })
scene.add(mazeMesh)

void function render() {
  requestAnimationFrame(render)
  renderer.render(scene, camera)
}()