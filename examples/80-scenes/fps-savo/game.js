import { scene, renderer, camera, clock, createSkyBox } from '/utils/scene.js'
import { createGround } from '/utils/ground.js'
import { sample } from '/utils/helpers.js'
import Tilemap from '/utils/classes/Tilemap.js'
import { nemesis } from '/utils/data/maps.js'
import { hemLight, lightningStrike } from '/utils/light.js'
import { Rain } from '/utils/classes/Particles.js'
import Savo from '/utils/player/Savo.js'
import { GermanSoldierAI } from '/utils/actors/ww2/GermanSoldier.js'
import { GermanMachineGunnerAI } from '/utils/actors/ww2/GermanMachineGunner.js'
import { NaziAI } from '/utils/actors/ww2/Nazi.js'
import { NaziAgentAI } from '/utils/actors/ww2/NaziAgent.js'
import { NaziOfficerAI } from '/utils/actors/ww2/NaziOfficer.js'
import { GermanFlameThrowerAI } from '/utils/actors/ww2/GermanFlameThrower.js'

const enemyClasses = [GermanFlameThrowerAI, GermanSoldierAI, GermanMachineGunnerAI, NaziAI, GermanSoldierAI, GermanMachineGunnerAI, NaziAI, NaziAgentAI, NaziOfficerAI]

const light = hemLight()
scene.background = createSkyBox({ folder: 'skybox4' })

const tilemap = new Tilemap(nemesis, 20)
const coords = tilemap.getEmptyCoords()

scene.add(createGround({ file: 'terrain/ground.jpg' }))
const walls = tilemap.meshFromMatrix({ texture: 'terrain/concrete.jpg' })
scene.add(walls)

const player = new Savo({ camera })
player.position.copy(coords.pop())
scene.add(player.mesh)

const enemies = []
for (let i = 0; i < 20; i++) {
  const EnemyClass = sample(enemyClasses)
  const enemy = new EnemyClass({ coords, target: player.mesh })
  enemies.push(enemy)
  scene.add(enemy.mesh)
}

const enemyMeshes = enemies.map(e => e.mesh)
player.addSolids([walls, ...enemyMeshes])

enemies.forEach(enemy => enemy.addSolids([walls, ...enemyMeshes]))

const rain = new Rain()
scene.add(rain.mesh)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()

  player.update(delta)
  enemies.forEach(enemy => enemy.update(delta))
  rain.update({ pos: player.position })

  if (Math.random() > .997) lightningStrike(light)

  renderer.render(scene, camera)
}()
