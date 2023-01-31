import { createGround } from '/utils/ground.js'
import { scene, renderer, camera, clock } from '/utils/scene.js'
import Savo from '/utils/fsm/Savo.js'
import Tilemap from '/utils/classes/Tilemap.js'
import { hemLight } from '/utils/light.js'
import { nemesis } from '/data/maps.js'
import { createBox } from '/utils/geometry.js'
import { getCameraIntersects } from '/utils/helpers.js'
import { shootDecals } from '/utils/decals.js'
import { loadModel } from '/utils/loaders.js'

hemLight()

const tilemap = new Tilemap(nemesis, 20)

scene.add(createGround({ file: 'terrain/ground.jpg' }))
const walls = tilemap.meshFromMatrix({ texture: 'terrain/concrete.jpg' })
scene.add(walls)

for (let i = 0; i < 10; i++) {
  const box = createBox({ size: 4 })
  const { x, z } = tilemap.randomEmptyPos
  box.position.set(x, 2, z)
  scene.add(box)
}

const player = new Savo({ camera })
player.position.copy(tilemap.randomEmptyPos)

const randomPos = mesh => {
  const { x, z } = tilemap.randomEmptyPos
  mesh.position.set(x, 0, z)
  return mesh
}

const { mesh: houseModel } = await loadModel({ file: 'building/house/medieval/house1-01.obj', mtl: 'building/house/medieval/house1-01.mtl', size: 10 })
for (let i = 0; i < 5; i++) {
  const house = houseModel.clone()
  scene.add(randomPos(house))
}

function shoot() {
  const intersects = getCameraIntersects(camera)
  if (!intersects.length) return
  shootDecals(intersects[0])
}

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()

  player.update(delta)
  renderer.render(scene, camera)
}()

document.body.addEventListener('click', () => shoot())