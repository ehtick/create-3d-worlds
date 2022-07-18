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

let scene_, camera_, threejs_, previousRAF_

const grid_ = new SpatialHashGrid(
  [[-1000, -1000], [1000, 1000]], [100, 100])

const entityManager_ = new EntityManager()

function OnGameStarted_() {
  LoadControllers_()
  LoadPlayer_()

  previousRAF_ = null
  loop()
}

function LoadControllers_() {
  const threejs = new entity.Entity()
  threejs.AddComponent(new ThreeJSController())
  entityManager_.Add(threejs)

  // Hack
  scene_ = threejs.GetComponent('ThreeJSController').scene_
  camera_ = threejs.GetComponent('ThreeJSController').camera_
  threejs_ = threejs.GetComponent('ThreeJSController').threejs_

  const ui = new entity.Entity()
  ui.AddComponent(new UIController())
  entityManager_.Add(ui, 'ui')

  const network = new entity.Entity()
  network.AddComponent(new NetworkController())
  entityManager_.Add(network, 'network')

  const t = new entity.Entity()
  t.AddComponent(new TerrainChunkManager({
    scene: scene_,
    target: 'player',
    threejs: threejs_,
  }))
  entityManager_.Add(t, 'terrain')

  const l = new entity.Entity()
  l.AddComponent(new LoadController())
  entityManager_.Add(l, 'loader')

  const scenery = new entity.Entity()
  scenery.AddComponent(new SceneryController({
    scene: scene_,
    grid: grid_,
  }))
  entityManager_.Add(scenery, 'scenery')

  const spawner = new entity.Entity()
  spawner.AddComponent(new PlayerSpawner({
    grid: grid_,
    scene: scene_,
    camera: camera_,
  }))
  spawner.AddComponent(new NetworkEntitySpawner({
    grid: grid_,
    scene: scene_,
    camera: camera_,
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
    camera: camera_,
    scene: scene_,
  }))
  entityManager_.Add(levelUpSpawner, 'level-up-spawner')
}

/* LOOP */

function loop() {
  requestAnimationFrame(t => {
    if (previousRAF_ === null)
      previousRAF_ = t

    threejs_.render(scene_, camera_)
    const timeElapsed = t - previousRAF_
    const timeElapsedS = Math.min(1.0 / 30.0, timeElapsed * 0.001)
    entityManager_.Update(timeElapsedS)

    previousRAF_ = t
    setTimeout(loop, 1)
  })
}

/* EVENTS */

document.getElementById('login-button').onclick = () => {
  OnGameStarted_()
}
