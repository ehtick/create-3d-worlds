import { scene, renderer, camera, clock } from '/utils/scene.js'
import { createHillyTerrain } from '/utils/ground.js'
import { createTreesOnTerrain } from '/utils/geometry/trees.js'
import { createSun } from '/utils/light.js'
import { sample, getAllCoords } from '/utils/helpers.js'
import { OrcAI } from '/utils/characters/fantasy/Orc.js'
import { OrcOgreAI } from '/utils/characters/fantasy/OrcOgre.js'
import { BarbarianPlayer } from '/utils/characters/fantasy/Barbarian.js'

const mapSize = 200
const coords = getAllCoords({ mapSize, fieldSize: 5 })
scene.add(createSun())

const terrain = createHillyTerrain({ size: mapSize, segments: 20 })
scene.add(terrain)

const trees = createTreesOnTerrain({ terrain })
scene.add(trees)

const player = new BarbarianPlayer({ coords, mapSize, camera, solids: terrain })
player.putOnGround()
scene.add(player.mesh)

const enemyClasses = [OrcAI, OrcOgreAI]

const enemies = []
for (let i = 0; i < 20; i++) {
  const EnemyClass = sample(enemyClasses)
  const enemy = new EnemyClass({ coords, solids: terrain, target: player.mesh, mapSize, shouldRaycastGround: true })
  enemies.push(enemy)
  enemy.putOnGround()
  scene.add(enemy.mesh)
}

const enemyMeshes = enemies.map(e => e.mesh)
player.addSolids(enemyMeshes)

// enemies.forEach(enemy => enemy.addSolids(terrain))

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)

  const delta = clock.getDelta()
  player.update()
  enemies.forEach(enemy => enemy.update(delta))

  renderer.render(scene, camera)
}()
