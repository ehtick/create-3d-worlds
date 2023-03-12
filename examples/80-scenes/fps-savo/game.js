import { scene, renderer, camera, clock, setBackground } from '/utils/scene.js'
import { createGround } from '/utils/ground.js'
import { sample } from '/utils/helpers.js'
import Tilemap from '/utils/classes/Tilemap.js'
import { smallMap } from '/utils/data/maps.js'
import { hemLight, lightningStrike } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'
import { Snow } from '/utils/classes/Particles.js'
import Savo from '/utils/player/Savo.js'
import { TankAI } from '/utils/actors/Tank.js'
import { GermanMachineGunnerAI } from '/utils/actors/ww2/GermanMachineGunner.js'
import { SSSoldierAI } from '/utils/actors/ww2/SSSoldier.js'
import { NaziOfficerAI } from '/utils/actors/ww2/NaziOfficer.js'
import { GermanFlameThrowerAI } from '/utils/actors/ww2/GermanFlameThrower.js'

const enemyClasses = [GermanFlameThrowerAI, GermanMachineGunnerAI, GermanMachineGunnerAI, GermanMachineGunnerAI, SSSoldierAI, SSSoldierAI, SSSoldierAI, NaziOfficerAI]

const light = hemLight({ intensity: .75 })
setBackground(0x000000)

const tilemap = new Tilemap(smallMap, 20)
const coords = tilemap.getEmptyCoords()

scene.add(createGround({ file: 'terrain/ground.jpg' }))
const walls = tilemap.meshFromMatrix({ texture: 'terrain/concrete.jpg' })

const rain = new Snow()
scene.add(rain.mesh)

const solids = [walls]

/* ACTORS */

const player = new Savo({ camera, coords })
scene.add(player.mesh)

const enemies = []
for (let i = 0; i < 20; i++) {
  const EnemyClass = sample(enemyClasses)
  const enemy = new EnemyClass({ coords, target: player.mesh })
  enemies.push(enemy)
  solids.push(enemy.mesh)
}

/* OBJECTS */

const tank = new TankAI({ coords })
solids.push(tank.mesh)

const { mesh: bunker } = await loadModel({ file: 'building/bunker.fbx', texture: 'terrain/concrete.jpg', size: 2.5 })
bunker.position.copy(coords.pop())
solids.push(bunker)

player.addSolids(solids)
enemies.forEach(enemy => enemy.addSolids(solids))
tank.addSolids([walls, bunker])

scene.add(...solids)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()

  player.update(delta)
  enemies.forEach(enemy => enemy.update(delta))
  rain.update({ delta, pos: player.position })
  tank.update(delta)

  if (Math.random() > .997) lightningStrike(light)

  renderer.render(scene, camera)
}()
