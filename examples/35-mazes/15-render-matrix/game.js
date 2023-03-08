import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { meshFromMatrix } from '/utils/mazes.js'
import { createGround } from '/utils/ground.js'
import { hemLight } from '/utils/light.js'
import matrix from '/utils/data/small-map.js'

hemLight()

camera.position.set(0, 7, 10)

scene.add(createGround({ file: 'terrain/ground.jpg', size: 100 }))

const map = meshFromMatrix({ matrix, texture: 'terrain/concrete.jpg' })
scene.add(map)

const controls = createOrbitControls()

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  controls.update()
  renderer.render(scene, camera)
}()
