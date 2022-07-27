import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { generateSquareMaze, createMeshFromMatrix } from '/utils/maps.js'
import { initLights } from '/utils/light.js'

initLights()
createOrbitControls()

const matrix = generateSquareMaze(11)
console.log(matrix)

const mazeMesh = createMeshFromMatrix({ matrix })
scene.add(mazeMesh)

void function render() {
  window.requestAnimationFrame(render)
  renderer.render(scene, camera)
}()