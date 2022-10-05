import { scene, camera, renderer, clock } from '/utils/scene.js'
import { createTerrain, createLava } from '/utils/ground.js'
import AvatarFSM from '/utils/fsm/AvatarFSM.js'
import { dirLight, hemLight } from '/utils/light.js'
import { createBabelTower, createBaradDur, createSpaceTower } from '/utils/geometry/towers.js'

dirLight({ intensity: .1 })
hemLight({ intensity: .75 })

const babelTower = createBabelTower({ floors: 6 })
const baradDur = createBaradDur()
baradDur.position.x = 200

const spaceTower = createSpaceTower()
spaceTower.position.z = -200

const terrain = createTerrain({ size: 1000, factor: 1 })

const lava = createLava({ size: 50 })
lava.translateY(1.5)

scene.add(terrain, lava, babelTower, baradDur, spaceTower)

const player = new AvatarFSM()
player.mesh.position.set(60, 2, 0)
player.addSolids(terrain, babelTower, baradDur, spaceTower)
scene.add(player.mesh)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()
  player.update(delta)
  renderer.render(scene, camera)
}()
