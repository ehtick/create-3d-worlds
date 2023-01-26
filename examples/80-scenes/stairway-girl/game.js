import { scene, camera, renderer, clock } from '/utils/scene.js'
import { createSpiralStairs } from '/utils/geometry/towers.js'
import { createGround } from '/utils/ground.js'
import { loadSorceress } from '/utils/loaders.js'
import Player from '/utils/fsm/Player.js'
import { dirLight, hemLight } from '/utils/light.js'
import { sorceressAnimations } from '/data/animations.js'

hemLight()
dirLight({ intensity: 1.5 })

camera.position.z = 30
camera.position.y = 15

const floor = createGround({ file: 'terrain/ground.jpg' })
scene.add(floor)
const stairs = createSpiralStairs({ radius: 25, stairsInCirle: 50, floorHeight: 15, depth: 5, size: 4 })
stairs.translateY(-2)
scene.add(stairs)

const { mesh, animations } = await loadSorceress()
const player = new Player({ mesh, animations, dict: sorceressAnimations, camera, speed: 4 })

scene.add(mesh)

player.addSolids(floor, stairs)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()
  player.update(delta)
  renderer.render(scene, camera)
}()
