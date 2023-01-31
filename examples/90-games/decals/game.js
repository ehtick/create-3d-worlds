import { createGround } from '/utils/ground.js'
import { scene, renderer, camera, clock } from '/utils/scene.js'
import Savo from '/utils/fsm/Savo.js'
import Tilemap from '/utils/classes/Tilemap.js'
import { hemLight } from '/utils/light.js'
import { nemesis } from '/data/maps.js'
import { createBox } from '/utils/geometry.js'

hemLight()

const tilemap = new Tilemap(nemesis, 20)

scene.add(createGround({ file: 'terrain/ground.jpg' }))
const walls = tilemap.meshFromMatrix({ texture: 'terrain/concrete.jpg' })
scene.add(walls)

const solids = [walls]
for (let i = 0; i < 10; i++) {
  const box = createBox({ size: 4 })
  const { x, z } = tilemap.randomEmptyPos
  box.position.set(x, 2, z)
  solids.push(box)
  scene.add(box)
}

const player = new Savo({ camera, solids })
player.position.copy(tilemap.randomEmptyPos)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()

  player.update(delta)
  renderer.render(scene, camera)
}()

