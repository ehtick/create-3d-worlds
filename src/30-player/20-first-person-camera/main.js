import { scene, camera, renderer, clock } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { moveCamera } from '/utils/player.js'

const floor = createFloor({ file: 'sand-512.jpg', circle: false })
scene.add(floor)

camera.position.set(0, 2, 0)

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta() // seconds
  moveCamera(camera, delta)
  renderer.render(scene, camera)
}()
