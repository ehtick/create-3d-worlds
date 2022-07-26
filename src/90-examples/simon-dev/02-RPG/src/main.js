/* eslint-disable new-cap */
import * as THREE from '/node_modules/three127/build/three.module.js'
import { scene, renderer, camera, clock } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { createSunLight, sunFollow } from '/utils/light.js'

import ThirdPersonCamera from './third-person-camera.js'
import { EntityManager } from '../../ecs/entity-manager.js'
import { Entity } from '../../ecs/entity.js'
import { math } from '../../shared/math.mjs'
import SpatialHashGrid from './spatial-hash-grid.js'
import { UIController } from '../../components/ui-controller.js'
import { LevelUpComponentSpawner } from '../../components/level-up-component-old.js'
import { addSky, createNPC, createPlayer, createGirl, createAxe, createSword, loadClouds, loadTrees } from './utils.js'

scene.fog = new THREE.FogExp2(0xffffff, 0.002)

const sun = createSunLight({ far: 1000 })
scene.add(sun)

const plane = createFloor({ size: 5000, color: 0x1e601c })
scene.add(plane)

const entityManager = new EntityManager()
const grid = new SpatialHashGrid([[-1000, -1000], [1000, 1000]], [100, 100])

// loadTrees(scene, grid, entityManager)
// loadClouds(scene, entityManager)
// addSky(scene)

const ui = new Entity()
ui.AddComponent(new UIController())
entityManager.Add(ui, 'ui')

const levelUpSpawner = new Entity()
levelUpSpawner.AddComponent(new LevelUpComponentSpawner())
entityManager.Add(levelUpSpawner, 'level-up-spawner')

const axe = createAxe()
entityManager.Add(axe)

const sword = createSword()
entityManager.Add(sword)

const girl = createGirl(grid)
entityManager.Add(girl)

const player = createPlayer(grid)
entityManager.Add(player, 'player')

player.Broadcast({
  topic: 'inventory.add',
  value: axe.Name,
  added: false,
})

player.Broadcast({
  topic: 'inventory.add',
  value: sword.Name,
  added: false,
})

player.Broadcast({
  topic: 'inventory.equip',
  value: axe.Name,
  added: false,
})

const playerCamera = new Entity()
playerCamera.AddComponent(new ThirdPersonCamera({ camera, target: player }))
entityManager.Add(playerCamera, 'player-camera')

const monsters = ['Ghost', 'GreenDemon', 'Cyclops', 'Cactus']
for (let i = 0; i < 50; ++i) {
  const monster = monsters[math.rand_int(0, monsters.length - 1)]
  const npc = createNPC(`${monster}.fbx`, `${monster}_Texture.png`, grid)
  entityManager.Add(npc)
}

/* LOOP */

void function update() {
  requestAnimationFrame(update)
  const delta = clock.getDelta()
  sunFollow(sun, entityManager.Get('player')._position)
  entityManager.Update(delta)
  renderer.render(scene, camera)
}()
