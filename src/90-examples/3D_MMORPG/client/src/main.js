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
import { defs } from '../shared/defs.mjs'
import { ThreeJSController } from './threejs_component.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'

const grid_ = new SpatialHashGrid(
  [[-1000, -1000], [1000, 1000]], [100, 100])

const entityManager_ = new EntityManager()

function OnGameStarted_() {
  LoadControllers_()
  LoadPlayer_()
  loop()
}

function LoadControllers_() {
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
  spawner.AddComponent(new PlayerSpawner({
    grid: grid_,
    scene,
    camera,
  }))
  spawner.AddComponent(new NetworkEntitySpawner({
    grid: grid_,
    scene,
    camera,
  }))
  entityManager_.Add(spawner, 'spawners')

  const database = new entity.Entity()
  database.AddComponent(new InventoryDatabaseController())
  entityManager_.Add(database, 'database')

  // HACK
  for (const k in defs.WEAPONS_DATA)
    database.GetComponent('InventoryDatabaseController').AddItem(
      k, defs.WEAPONS_DATA[k])
}

function LoadPlayer_() {
  const levelUpSpawner = new entity.Entity()
  levelUpSpawner.AddComponent(new LevelUpComponentSpawner({
    camera,
    scene,
  }))
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

document.getElementById('login-button').onclick = () => {
  OnGameStarted_()
}
