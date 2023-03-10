import { scene, renderer, camera, clock, createSkyBox } from '/utils/scene.js'
import { createGround } from '/utils/ground.js'
import { sample } from '/utils/helpers.js'
import Tilemap from '/utils/classes/Tilemap.js'
import { smallMap } from '/utils/data/maps.js'
import { hemLight, lightningStrike } from '/utils/light.js'
import { Rain } from '/utils/classes/Particles.js'
import Savo from '/utils/player/Savo.js'
import { GermanMachineGunnerAI } from '/utils/actors/ww2/GermanMachineGunner.js'
import { SSSoldierAI } from '/utils/actors/ww2/SSSoldier.js'
import { NaziOfficerAI } from '/utils/actors/ww2/NaziOfficer.js'
import { GermanFlameThrowerAI } from '/utils/actors/ww2/GermanFlameThrower.js'
import { createCrate, createRustyBarrel, createMetalBarrel } from '/utils/geometry.js'
import { loadModel } from '/utils/loaders.js'

const enemyClasses = [GermanFlameThrowerAI, GermanMachineGunnerAI, GermanMachineGunnerAI, SSSoldierAI, SSSoldierAI, NaziOfficerAI]

const light = hemLight({ intensity: .75 })
scene.background = createSkyBox({ folder: 'skybox1' })

const tilemap = new Tilemap(smallMap, 20)
const coords = tilemap.getEmptyCoords()

scene.add(createGround({ file: 'terrain/ground.jpg' }))
const walls = tilemap.meshFromMatrix({ texture: 'terrain/concrete.jpg' })

const rain = new Rain()
scene.add(rain.mesh)

const solids = [walls]

/* ACTORS */

const player = new Savo({ camera })
player.position.copy(coords.pop())
scene.add(player.mesh)

const enemies = []
for (let i = 0; i < 20; i++) {
  const EnemyClass = sample(enemyClasses)
  const enemy = new EnemyClass({ coords, target: player.mesh })
  enemies.push(enemy)
  solids.push(enemy.mesh)
}

/* OBJECTS */

const { mesh: bunker } = await loadModel({ file: 'building/bunker.fbx', size: 2.5 })
bunker.position.copy(coords.pop())
solids.push(bunker)

const createObject = [createCrate, createRustyBarrel, createMetalBarrel]

for (let i = 0; i < 5; i++) {
  const coord = coords.pop()
  for (let j = -1; j < 2; j++) {
    const object = sample(createObject)()
    object.position.copy(coord)
    object.translateX(j)
    player.addSolids(object)
    solids.push(object)
  }
}

player.addSolids(solids)
enemies.forEach(enemy => enemy.addSolids(solids))

scene.add(...solids)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()

  player.update(delta)
  enemies.forEach(enemy => enemy.update(delta))
  rain.update({ pos: player.position })

  if (Math.random() > .997) lightningStrike(light)

  renderer.render(scene, camera)
}()
