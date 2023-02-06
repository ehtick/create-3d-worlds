import { createWorldScene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { createTrees } from '/utils/geometry/trees.js'

const scene = createWorldScene()
const controls = createOrbitControls()

camera.position.z = 20
camera.position.y = 10

scene.add(createTrees())

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}()
