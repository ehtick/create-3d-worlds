import { createGround } from '/utils/ground.js'
import { meshFromMatrix } from '/utils/mazes.js'
import { scene, renderer, camera, clock } from '/utils/scene.js'
import Avatar from '/utils/player/Avatar.js'
import matrix from '/utils/data/small-map.js'
import { hemLight } from '/utils/light.js'

hemLight()

const avatar = new Avatar({ size: 1, skin: 'lava', camera })
avatar.position.set(12, 0, 12)

const floor = createGround({ file: 'terrain/ground.jpg' })
const walls = meshFromMatrix({ matrix, size: 4 })

scene.add(avatar.mesh, floor, walls)

avatar.addSolids(walls)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()
  avatar.update(delta)
  renderer.render(scene, camera)
}()
