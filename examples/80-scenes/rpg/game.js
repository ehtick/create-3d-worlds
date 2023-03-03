import { scene, renderer, camera, clock } from '/utils/scene.js'
import { createHillyTerrain } from '/utils/ground.js'
import { createTreesOnTerrain } from '/utils/geometry/trees.js'
import { createSun } from '/utils/light.js'
import { sample, getAllCoords, putOnGround } from '/utils/helpers.js'
import { BarbarianPlayer } from '/utils/characters/fantasy/Barbarian.js'
import { OrcAI } from '/utils/characters/fantasy/Orc.js'
import { OrcOgreAI } from '/utils/characters/fantasy/OrcOgre.js'
import { FlamingoAI } from '/utils/characters/animals/Flamingo.js'
import { loadModel } from '/utils/loaders.js'

const mapSize = 200
const enemyClasses = [OrcAI, OrcOgreAI]
const creatures = []

const coords = getAllCoords({ mapSize: mapSize * .9, fieldSize: 5 })
scene.add(createSun())

const terrain = createHillyTerrain({ size: mapSize, segments: 20 })
scene.add(terrain)

const trees = createTreesOnTerrain({ terrain })
scene.add(trees)

/* ACTORS */

const player = new BarbarianPlayer({ coords, mapSize, camera, solids: terrain })
scene.add(player.mesh)

for (let i = 0; i < 10; i++) {
  const Enemy = sample(enemyClasses)
  const enemy = new Enemy({ coords, solids: terrain, target: player.mesh, mapSize, shouldRaycastGround: true })
  creatures.push(enemy)
  scene.add(enemy.mesh)
}

player.addSolids(creatures.map(enemy => enemy.mesh))

for (let i = 0; i < 10; i++) {
  const bird = new FlamingoAI({ mapSize, coords })
  creatures.push(bird)
  scene.add(bird.mesh)
}

// building/castle/fortress.fbx 118 kb
// building/castle/castel/scene.gltf 200 kb
const { mesh } = await loadModel({ file: 'building/castle/fortress.fbx', size: 50 })
putOnGround(mesh, terrain)
scene.add(mesh)

player.addSolids(mesh)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)

  const delta = clock.getDelta()
  player.update(delta)
  creatures.forEach(enemy => enemy.update(delta))

  renderer.render(scene, camera)
}()
