import { quat, vec3 } from 'gl-matrix'

import { WorldNetworkClient, WorldAIClient } from './world-client.mjs'
import { WorldEntity } from './world-entity.mjs'

import { SpatialHashGrid } from '../../../shared/spatial-hash-grid.mjs'
import { HeightGenerator } from '../../../shared/terrain-height.mjs'
import { CHARACTER_MODELS } from '../../shared/data.mjs'

class MonsterSpawner {
  constructor(params) {
    this.parent = params.parent
    this.grid = this.parent.grid
    this.terrain_ = this.parent.terrain_
    this.pos_ = params.pos
    this.pos_[1] = this.terrain_.Get(...params.pos)[0]
    this.params = params
  }

  Spawn_() {
    // Hack
    const e = new WorldEntity({
      id: this.parent.ids_++,
      position: vec3.clone(this.pos_),
      rotation: quat.fromValues(0, 0, 0, 1),
      grid: this.grid,
      character: {
        definition: CHARACTER_MODELS[this.params.class],
        class: this.params.class,
      },
      account: { accountName: CHARACTER_MODELS[this.params.class].name },
    })

    const wc = new WorldAIClient(e, this.terrain_, () => {
      this.entity = null
      console.log('entity gone, spawner making now one soon')
    })

    this.parent.AddMonster(wc)
    this.entity = wc
  }

  Update(timeElapsed) {
    if (!this.entity)
      this.Spawn_()
  }
};

const _TICK_RATE = 0.1

export class WorldManager {
  constructor() {
    this.ids_ = 0
    this.entities = []
    this.grid = new SpatialHashGrid([[-4000, -4000], [4000, 4000]], [1000, 1000])
    this.terrain_ = new HeightGenerator()
    this.spawners_ = []
    this.tickTimer_ = 0.0

    // Hack
    for (let x = -40; x <= 40; ++x)
      for (let z = -40; z <= 40; ++z)
        if (Math.random() < 0.1) {
          const pos = vec3.fromValues(x * 75, 0, z * 75)
          const monster = Math.random() < 0.1 ? 'warrok' : 'zombie'
          this.spawners_.push(new MonsterSpawner({ parent: this, pos, class: monster }))
        }
  }

  AddMonster(e) {
    this.entities.push(e)
  }

  Add(client, params) {
    const models = ['sorceror', 'paladin']
    const randomClass = models[Math.floor(Math.random() * models.length)]

    // Hack
    const e = new WorldEntity({
      id: this.ids_++,
      position: vec3.fromValues(
        -60 + (Math.random() * 2 - 1) * 20,
        0,
        (Math.random() * 2 - 1) * 20),
      rotation: quat.fromValues(0, 0, 0, 1),
      grid: this.grid,
      character: {
        definition: CHARACTER_MODELS[randomClass],
        class: randomClass,
      },
      account: params,
    })

    const wc = new WorldNetworkClient(client, e)
    this.entities.push(wc)
    wc.BroadcastChat({
      name: '',
      server: true,
      text: '[' + params.accountName + ' has entered the game]'
    })
  }

  Update(timeElapsed) {
    this.TickClientState_(timeElapsed)
    this.UpdateEntities_(timeElapsed)
    this.UpdateSpawners_(timeElapsed)
  }

  TickClientState_(timeElapsed) {
    this.tickTimer_ += timeElapsed
    if (this.tickTimer_ < _TICK_RATE) return

    this.tickTimer_ = 0.0

    for (let i = 0; i < this.entities.length; ++i)
      this.entities[i].UpdateClientState_()

    for (let i = 0; i < this.entities.length; ++i)
      this.entities[i].entity.events_ = []
  }

  UpdateSpawners_(timeElapsed) {
    for (let i = 0; i < this.spawners_.length; ++i)
      this.spawners_[i].Update(timeElapsed)
  }

  UpdateEntities_(timeElapsed) {
    const dead = []
    const alive = []

    for (let i = 0; i < this.entities.length; ++i) {
      const e = this.entities[i]
      e.Update(timeElapsed)

      if (e.IsDead) {
        console.log('killed it off')
        dead.push(e)
      } else
        alive.push(e)
    }

    this.entities = alive

    for (const d of dead) {
      d.OnDeath()
      d.Destroy()
    }
  }
}