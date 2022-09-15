import { scene, renderer, camera } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { createBox } from '/utils/geometry.js'
import { dirLight } from '/utils/light.js'

const cube = createBox({ castShadow: true })
cube.position.y = 1
scene.add(cube)

const plane = createFloor()
scene.add(plane)

dirLight({ position: [12, 8, 1], intensity: 1.5 })

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  cube.rotation.y += 0.01
  renderer.render(scene, camera)
}()
