import { scene, camera, renderer, clock } from '/utils/scene.js'
import { createTerrain, createLava } from '/utils/ground.js'
import Avatar from '/utils/classes/Avatar.js'
import { dirLight, hemLight } from '/utils/light.js'
import { createBabelTower, createBaradDur, createSpaceTower } from '/utils/towers.js'

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

const avatar = new Avatar({ skin: 0 })
avatar.position.set(60, 2, 0)
avatar.addSolids(terrain, babelTower, baradDur, spaceTower)
avatar.add(camera)
scene.add(avatar.mesh)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()
  avatar.update(delta)
  renderer.render(scene, camera)
}()
