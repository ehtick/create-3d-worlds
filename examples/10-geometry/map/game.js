import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { meshFromMatrix } from '/utils/mazes.js'
import { createGround } from '/utils/ground.js'
import { hemLight } from '/utils/light.js'
import { smallMap } from '/utils/data/maps.js'

hemLight()

scene.add(createGround({ file: 'terrain/ground.jpg', size: 100 }))

const map = meshFromMatrix({ matrix: smallMap, texture: 'terrain/concrete.jpg' })
scene.add(map)

const controls = createOrbitControls()

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  controls.update()
  renderer.render(scene, camera)
}()
