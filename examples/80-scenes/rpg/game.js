import { scene, renderer, camera, clock } from '/utils/scene.js'
import { createHillyTerrain } from '/utils/ground.js'
import { createTreesOnTerrain } from '/utils/geometry/trees.js'
import { createSun } from '/utils/light.js'
// import { OrcAI } from '/utils/characters/fantasy/Orc.js'
// import { OrcOgreAI } from '/utils/characters/fantasy/OrcOgre.js'
import { BarbarianPlayer } from '/utils/characters/fantasy/Barbarian.js'
import Player from '/utils/player/Player.js'

const mapSize = 400

scene.add(createSun())

const terrain = createHillyTerrain({ size: mapSize, segments: 20 })
scene.add(terrain)

const trees = createTreesOnTerrain({ terrain })
scene.add(trees)

const player = new Player({ camera })
player.addSolids(terrain)
player.position.y = 40
scene.add(player.mesh)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  player.update(clock.getDelta())
  renderer.render(scene, camera)
}()
