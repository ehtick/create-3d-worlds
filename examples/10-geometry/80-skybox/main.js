import { camera, scene, renderer, createSkyBox, createOrbitControls } from '/utils/scene.js'
import { createGround } from '/utils/ground.js'
import { initLight } from '/utils/light.js'

initLight()
createOrbitControls()
camera.position.set(0, 15, 30)

const ground = createGround({ size: 512, file: 'terrain/grass.jpg' })
scene.add(ground)

scene.background = createSkyBox()

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}()
