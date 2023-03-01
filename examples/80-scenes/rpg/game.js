import { scene, renderer, camera, clock, createSkyBox } from '/utils/scene.js'
import { createGround } from '/utils/ground.js'
import { sample } from '/utils/helpers.js'
import { hemLight } from '/utils/light.js'
import { BarbarianPlayer } from '/utils/characters/fantasy/Barbarian.js'
import { OrcAI } from '/utils/characters/fantasy/Orc.js'
import { OrcOgreAI } from '/utils/characters/fantasy/OrcOgre.js'

const mapSize = 200
const enemyClasses = [OrcAI, OrcOgreAI]

hemLight()
scene.background = createSkyBox({ folder: 'skybox4', mapSize })

scene.add(createGround({ file: 'terrain/ground.jpg' }))

/* LOGIC */

const player = new BarbarianPlayer({ camera })
scene.add(player.mesh)

const enemies = []
for (let i = 0; i < 20; i++) {
  const EnemyClass = sample(enemyClasses)
  const enemy = new EnemyClass({ target: player.mesh, mapSize })
  enemies.push(enemy)
  scene.add(enemy.mesh)
}

const enemyMeshes = enemies.map(e => e.mesh)
player.addSolids(enemyMeshes)
enemies.forEach(enemy => enemy.addSolids(enemyMeshes))

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()

  player.update(delta)
  enemies.forEach(enemy => enemy.update(delta))

  renderer.render(scene, camera)
}()
