import { scene, camera, renderer, clock } from '/utils/scene.js'
import { EntityManager } from './entity-manager.js'
import { entity } from './entity.js'
import { UIController } from './ui-controller.js'
import { LevelUpComponentSpawner } from './level-up-component.js'
import { NetworkController } from './network-controller.js'
import { SceneryController } from './scenery-controller.js'
import { LoadController } from './load-controller.js'
import { PlayerSpawner, NetworkEntitySpawner } from './spawners.js'
import { TerrainChunkManager } from './terrain.js'
import { InventoryDatabaseController } from './inventory-controller.js'
import { SpatialHashGrid } from '../shared/spatial-hash-grid.mjs'
import { WEAPONS_DATA } from '../shared/data.mjs'
import { ThreeJSController } from './threejs_component.js'
import { generateRandomName } from './utils.js'

document.getElementById('login-input').value = generateRandomName()

const grid_ = new SpatialHashGrid([[-1000, -1000], [1000, 1000]], [100, 100])

const entityManager_ = new EntityManager()

function startGame() {
  init()
  loop()
}

function init() {
  const threejs = new entity.Entity()
  threejs.AddComponent(new ThreeJSController())
  entityManager_.Add(threejs)

  const ui = new entity.Entity()
  ui.AddComponent(new UIController())
  entityManager_.Add(ui, 'ui')

  const network = new entity.Entity()
  network.AddComponent(new NetworkController())
  entityManager_.Add(network, 'network')

  const t = new entity.Entity()
  t.AddComponent(new TerrainChunkManager({ target: 'player' }))
  entityManager_.Add(t, 'terrain')

  const l = new entity.Entity()
  l.AddComponent(new LoadController())
  entityManager_.Add(l, 'loader')

  const scenery = new entity.Entity()
  scenery.AddComponent(new SceneryController({
    scene,
    grid: grid_,
  }))
  entityManager_.Add(scenery, 'scenery')

  const spawner = new entity.Entity()
  spawner.AddComponent(new PlayerSpawner({ grid: grid_ }))
  spawner.AddComponent(new NetworkEntitySpawner({ grid: grid_ }))
  entityManager_.Add(spawner, 'spawners')

  const database = new entity.Entity()
  const inventory = new InventoryDatabaseController()
  for (const key in WEAPONS_DATA)
    inventory.AddItem(key, WEAPONS_DATA[key])
  database.AddComponent(inventory)
  entityManager_.Add(database, 'database')

  const levelUpSpawner = new entity.Entity()
  levelUpSpawner.AddComponent(new LevelUpComponentSpawner())
  entityManager_.Add(levelUpSpawner, 'level-up-spawner')
}

/* LOOP */

function loop() {
  requestAnimationFrame(loop)
  const deltaTime = clock.getDelta()
  entityManager_.Update(deltaTime)
  renderer.render(scene, camera)
}

/* EVENTS */

document.getElementById('login-button').addEventListener('click', startGame)
