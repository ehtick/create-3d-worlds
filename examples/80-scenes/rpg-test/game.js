import { scene, renderer, camera, clock } from '/utils/scene.js'
import { createGround } from '/utils/ground.js'
import { createSun } from '/utils/light.js'
import { sample, getAllCoords } from '/utils/helpers.js'
import { BarbarianPlayer } from '/utils/characters/fantasy/Barbarian.js'
import { OrcAI } from '/utils/characters/fantasy/Orc.js'
import { OrcOgreAI } from '/utils/characters/fantasy/OrcOgre.js'

const mapSize = 100
const enemyClasses = [OrcAI, OrcOgreAI]
const npcs = []

const coords = getAllCoords({ mapSize: mapSize * .9, fieldSize: 5 })
scene.add(createSun({ position: [15, 100, 50] }))

const terrain = createGround({ size: mapSize, factorY: 30 })
scene.add(terrain)

/* ACTORS */

const player = new BarbarianPlayer({ coords, mapSize, camera, solids: terrain })
scene.add(player.mesh)

for (let i = 0; i < 6; i++) {
  const Enemy = sample(enemyClasses)
  const enemy = new Enemy({ coords, solids: [terrain, player.mesh], target: player.mesh, mapSize, shouldRaycastGround: true })
  npcs.push(enemy)
  scene.add(enemy.mesh)
}

player.addSolids(npcs.map(enemy => enemy.mesh))

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)

  const delta = clock.getDelta()
  player.update(delta)
  npcs.forEach(enemy => enemy.update(delta))

  renderer.render(scene, camera)
}()
