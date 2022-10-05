import { createTrees } from '/utils/geometry/trees.js'
import { renderer, camera, clock, createWorldScene } from '/utils/scene.js'
import Avatar from '/utils/fsm/AvatarFSM.js'

const scene = createWorldScene({ file: 'terrain/ground.jpg' })
const player = new Avatar()

scene.add(player.mesh, createTrees())
player.add(camera)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  const delta = clock.getDelta()
  player.update(delta)
  renderer.render(scene, camera)
}()
