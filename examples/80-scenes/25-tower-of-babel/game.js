import { scene, camera, renderer, clock } from '/utils/scene.js'
import { createTerrain, createLavaGround } from '/utils/ground.js'
import Avatar from '/utils/classes/Avatar.js'
import { dirLight, hemLight } from '/utils/light.js'
import { createBabelTower, createBaradDur, spaceStructure } from '/utils/towers.js'

const lavaGround = createLavaGround()
scene.add(lavaGround)

dirLight({ intensity: .1 })
hemLight({ intensity: .75 })

const tower = createBabelTower({ floors: 6 })
const baradDur = createBaradDur()
baradDur.position.x = 200

const structure = spaceStructure()
structure.position.z = -200

const terrain = createTerrain({ size: 1000, factor: 1 })

scene.add(terrain, tower, baradDur, structure)

const avatar = new Avatar({ skin: 0 })
avatar.position.set(60, 2, 0)
avatar.addSolids(terrain, tower, baradDur, structure)
avatar.add(camera)
scene.add(avatar.mesh)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()
  avatar.update(delta)
  renderer.render(scene, camera)
}()
