import { scene, camera, renderer, clock } from '/utils/scene.js'

import { EntityManager } from '../../../ecs/entity-manager.js'
import { Entity } from '../../../ecs/entity.js'
import { UIController } from '../../../components/ui-controller.js'
import { LevelUpComponentSpawner } from '../../../components/level-up-component.js'
import { NetworkController } from './network-controller.js'
import { SceneryController } from './scenery-controller.js'
import { LoadController } from './load-controller.js'
import { PlayerSpawner, NetworkEntitySpawner } from './spawners.js'
import { TerrainChunkManager } from '../../../terrain/terrain.js'
import { InventoryDatabaseController } from '../../../components/inventory-controller.js'
import { SpatialHashGrid } from '../../../shared/spatial-hash-grid.mjs'
import { WEAPONS_DATA } from '../../shared/data.mjs'
import { SkyController } from '../../../components/sky_component.js'
import { generateRandomName } from './utils.js'

document.getElementById('login-input').value = generateRandomName()

const grid = new SpatialHashGrid([[-1000, -1000], [1000, 1000]], [100, 100])
const entityManager = new EntityManager()

function startGame() {
  console.log('clicked')
  init()
  loop()
}

function init() {
  const threejs = new Entity()
  threejs.AddComponent(new SkyController())
  entityManager.Add(threejs)

  const ui = new Entity()
  ui.AddComponent(new UIController())
  entityManager.Add(ui, 'ui')

  const network = new Entity()
  network.AddComponent(new NetworkController())
  entityManager.Add(network, 'network')

  const t = new Entity()
  t.AddComponent(new TerrainChunkManager({ target: 'player' }))
  entityManager.Add(t, 'terrain')

  const l = new Entity()
  l.AddComponent(new LoadController())
  entityManager.Add(l, 'loader')

  const scenery = new Entity()
  scenery.AddComponent(new SceneryController({ grid }))
  entityManager.Add(scenery, 'scenery')

  const spawner = new Entity()
  spawner.AddComponent(new PlayerSpawner({ grid }))
  spawner.AddComponent(new NetworkEntitySpawner({ grid }))
  entityManager.Add(spawner, 'spawners')

  const database = new Entity()
  const inventory = new InventoryDatabaseController()
  for (const key in WEAPONS_DATA) inventory.AddItem(key, WEAPONS_DATA[key])
  database.AddComponent(inventory)
  entityManager.Add(database, 'database')

  const levelUpSpawner = new Entity()
  levelUpSpawner.AddComponent(new LevelUpComponentSpawner())
  entityManager.Add(levelUpSpawner, 'level-up-spawner')
}

/* LOOP */

function loop() {
  requestAnimationFrame(loop)
  const deltaTime = clock.getDelta()
  entityManager.Update(deltaTime)
  renderer.render(scene, camera)
}

/* EVENTS */

document.getElementById('login-button').addEventListener('click', startGame)
