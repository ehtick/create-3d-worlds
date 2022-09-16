import { scene, camera, renderer, clock, addUIControls } from '/utils/scene.js'
import { handleInput } from '/utils/player.js'
import { createFloor } from '/utils/ground.js'
import { createCrate } from '/utils/geometry.js'
import { initLight } from '/utils/light.js'

initLight()

const floor = createFloor({ size: 25 })
scene.add(floor)

const player = createCrate({ size: 1 })
scene.add(player)

const commands = {
  'W': 'Translate Forward',
  'S': 'Translate Backward',
  'A': 'Rotate Left',
  'D': 'Rotate Right',
}
addUIControls({ commands })

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()
  handleInput(player, delta)
  renderer.render(scene, camera)
}()