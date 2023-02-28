import { scene, renderer, camera, clock, createSkyBox } from '/utils/scene.js'
import { createGround } from '/utils/ground.js'
import { sample } from '/utils/helpers.js'
import Tilemap from '/utils/classes/Tilemap.js'
import { nemesis } from '/data/maps.js'
import { hemLight, lightningStrike } from '/utils/light.js'
import { Rain } from '/utils/classes/Particles.js'
import Savo from '/utils/player/Savo.js'
// import { GermanSoldierAI } from '/utils/characters/ww2/GermanSoldier.js'
// import { GermanMachineGunnerAI } from '/utils/characters/ww2/GermanMachineGunner.js'
// import { GermanSoldierCrouchAI } from '/utils/characters/ww2/GermanSoldierCrouch.js'
// import { NaziAI } from '/utils/characters/ww2/Nazi.js'
// import { NaziCrouchAI } from '/utils/characters/ww2/NaziCrouch.js'
// import { NaziOfficerAI } from '/utils/characters/ww2/NaziOfficer.js'
import { OrcAI } from '/utils/characters/fantasy/Orc.js'
import { OrcOgreAI } from '/utils/characters/fantasy/OrcOgre.js'

const enemyClasses = [OrcAI, OrcOgreAI]

// [GermanSoldierAI, GermanMachineGunnerAI, GermanSoldierCrouchAI, NaziAI, NaziCrouchAI, NaziOfficerAI]

const light = hemLight()
scene.background = createSkyBox({ folder: 'skybox4' })

const tilemap = new Tilemap(nemesis, 20)
const coords = tilemap.yieldRandomEmpty()

scene.add(createGround({ file: 'terrain/ground.jpg' }))
const walls = tilemap.meshFromMatrix({ texture: 'terrain/concrete.jpg' })
scene.add(walls)

const player = new Savo({ camera })
player.position.copy(coords.next().value)

const enemies = []
for (let i = 0; i < 20; i++) {
  const EnemyClass = sample(enemyClasses)
  const enemy = new EnemyClass({ solids: walls, target: player.mesh, coords })
  enemies.push(enemy)
  scene.add(enemy.mesh)
}

const enemyMeshes = enemies.map(e => e.mesh)
player.addSolids([walls, ...enemyMeshes])

const rain = new Rain()
scene.add(rain.particles)

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
