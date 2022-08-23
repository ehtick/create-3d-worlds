import { createTrees } from '/utils/geometry/trees.js'
import { renderer, camera, clock, createWorldScene } from '/utils/scene.js'
import Avatar from '/utils/classes/Avatar.js'

const scene = createWorldScene({ file: 'terrain/ground.jpg' })
const avatar = new Avatar()

scene.add(avatar.mesh, createTrees())
avatar.add(camera)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  const delta = clock.getDelta()
  avatar.update(delta)
  renderer.render(scene, camera)
}()
