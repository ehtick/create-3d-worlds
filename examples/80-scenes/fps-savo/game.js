import { scene, renderer, camera, clock, setBackground } from '/utils/scene.js'
import { createGround } from '/utils/ground.js'
import { sample } from '/utils/helpers.js'
import Tilemap from '/utils/classes/Tilemap.js'
import { smallMap } from '/utils/data/maps.js'
import { hemLight } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'
import { Snow } from '/utils/classes/Particles.js'
import FPSPlayer from '/utils/player/FPSPlayer.js'
import { TankAI } from '/utils/actors/Tank.js'
import { GermanMachineGunnerAI } from '/utils/actors/ww2/GermanMachineGunner.js'
import { SSSoldierAI } from '/utils/actors/ww2/SSSoldier.js'
import { NaziOfficerAI } from '/utils/actors/ww2/NaziOfficer.js'
import { GermanFlameThrowerAI } from '/utils/actors/ww2/GermanFlameThrower.js'
import { truePrimsMatrix } from '/utils/mazes/algorithms.js'

const matrix = truePrimsMatrix(10)

const enemyClasses = [GermanFlameThrowerAI, GermanMachineGunnerAI, GermanMachineGunnerAI, GermanMachineGunnerAI, SSSoldierAI, SSSoldierAI, SSSoldierAI, NaziOfficerAI]

hemLight({ intensity: .75 })
setBackground(0x070b34)

const tilemap = new Tilemap(matrix, 10)
const coords = tilemap.getEmptyCoords()

scene.add(createGround({ file: 'terrain/ground.jpg' }))
const walls = tilemap.meshFromMatrix({ texture: 'terrain/concrete.jpg' })

const show = new Snow()
scene.add(show.mesh)

const solids = [walls]

/* ACTORS */

const player = new FPSPlayer({ camera, coords, pointerLockId: 'instructions' })
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
  renderer.render(scene, camera)
  if (!document.pointerLockElement) return
  const delta = clock.getDelta()

  player.update(delta)
  enemies.forEach(enemy => enemy.update(delta))
  show.update({ delta, pos: player.position })
  tank.update(delta)
}()

