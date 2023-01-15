import { createGround } from '/utils/ground.js'
import { randomMatrix } from '/utils/mazes.js'
import { scene, renderer, camera, clock } from '/utils/scene.js'
import Savo from '/utils/fsm/Savo.js'
import Tilemap from '/utils/classes/Tilemap.js'
import { hemLight } from '/utils/light.js'

hemLight()
scene.add(createGround({ file: 'terrain/ground.jpg' }))

const map = new Tilemap(randomMatrix(), 20)
const walls = map.meshFromMatrix()
scene.add(walls)

const player = new Savo()
player.add(camera)
player.addSolids(walls)
scene.add(player.mesh)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()
  player.update(delta)
  renderer.render(scene, camera)
}()
