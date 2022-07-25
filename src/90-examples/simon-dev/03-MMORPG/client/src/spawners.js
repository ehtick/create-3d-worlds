import { entity } from '../../../ecs/entity.js'

import { ThirdPersonCamera } from './third-person-camera.js'
import { BasicCharacterController } from './player-entity.js'
import { HealthComponent } from './health-component.js'
import { BasicCharacterControllerInput } from './player-input.js'
import { SpatialGridController } from './spatial-grid-controller.js'
import { UIInventoryController, InventoryController } from './inventory-controller.js'
import { EquipWeapon } from './equip-weapon-component.js'
import { attack_controller } from './attacker-controller.js'
import { NPCController } from './npc-entity.js'
import { NetworkEntityController } from './network-entity-controller.js'
import { NetworkPlayerController } from './network-player-controller.js'
import { FloatingName } from './floating-name.js'
import { SorcerorEffect } from './sorceror-effect.js'
import { BloodEffect } from './blood-effect.js'

class PlayerSpawner extends entity.Component {
  constructor({ grid }) {
    super()
    this.params_ = { grid }
  }

  Spawn(desc) {
    const player = new entity.Entity()
    player.Account = desc.account
    player.AddComponent(new BasicCharacterControllerInput())
    player.AddComponent(new BasicCharacterController({ desc }))
    player.AddComponent(new EquipWeapon({ desc }))
    player.AddComponent(new UIInventoryController())
    player.AddComponent(new InventoryController())
    player.AddComponent(new HealthComponent({
      updateUI: true,
      health: 1,
      maxHealth: 1,
      strength: 1,
      wisdomness: 1,
      benchpress: 1,
      curl: 1,
      experience: 1,
      level: 1,
      desc,
    }))
    player.AddComponent(new SpatialGridController({ grid: this.params_.grid }))
    player.AddComponent(new attack_controller.AttackController())
    player.AddComponent(new ThirdPersonCamera({ target: player }))
    player.AddComponent(new NetworkPlayerController())
    player.AddComponent(new BloodEffect())
    if (desc.character.class == 'sorceror')
      player.AddComponent(new SorcerorEffect())

    this.Manager.Add(player, 'player')

    return player
  }
};

class NetworkEntitySpawner extends entity.Component {
  constructor({ grid }) {
    super()
    this.params_ = { grid }
  }

  Spawn(name, desc) {
    const npc = new entity.Entity()
    npc.Account = desc.account
    npc.AddComponent(new NPCController({ desc }))
    npc.AddComponent(
      new HealthComponent({
        health: 50,
        maxHealth: 50,
        strength: 2,
        wisdomness: 2,
        benchpress: 3,
        curl: 1,
        experience: 0,
        level: 1,
        desc,
      }))
    npc.AddComponent(new SpatialGridController({ grid: this.params_.grid }))
    npc.AddComponent(new NetworkEntityController())
    if (desc.account.name)
      npc.AddComponent(new FloatingName({ desc }))

    npc.AddComponent(new EquipWeapon({ desc }))
    npc.AddComponent(new InventoryController())
    npc.AddComponent(new BloodEffect())
    if (desc.character.class == 'sorceror')
      npc.AddComponent(new SorcerorEffect())

    this.Manager.Add(npc, name)

    return npc
  }
}

export {
  PlayerSpawner,
  NetworkEntitySpawner,
}
