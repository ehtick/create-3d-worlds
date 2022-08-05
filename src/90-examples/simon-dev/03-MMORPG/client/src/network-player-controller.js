import * as THREE from '/node_modules/three/build/three.module.js'

import { Component } from '../../../ecs/component.js'

export class NetworkPlayerController extends Component {
  constructor() {
    super()
    this.updateTimer_ = 0.0
    this.loaded_ = false
  }

  InitComponent() {
    this.RegisterHandler('load.character', m => this.OnLoaded_(m))
    this.RegisterHandler('inventory.equip', m => this.OnEquipChanged_(m))
    this.RegisterHandler('network.update', m => this.OnUpdate_(m))
    this.RegisterHandler('action.attack', m => this.OnActionAttack_(m))
  }

  InitEntity() {
    this.net_ = this.FindEntity('network').GetComponent('NetworkController')
  }

  OnEquipChanged_() {
    const inventory = this.GetComponent('InventoryController').CreatePacket()
    this.net_.SendInventoryChange_(inventory)
  }

  OnActionAttack_() {
    this.net_.SendActionAttack_()
  }

  OnUpdate_(msg) {
    if (msg.transform) {
      this.Parent.SetPosition(new THREE.Vector3(...msg.transform[1]))
      this.Parent.SetQuaternion(new THREE.Quaternion(...msg.transform[2]))
    }

    if (msg.stats)
      this.Broadcast({
        topic: 'stats.network',
        value: msg.stats,
      })

    if (msg.events && msg.events.length)
      this.Broadcast({
        topic: 'events.network',
        value: msg.events,
      })
  }

  OnLoaded_() {
    this.loaded_ = true
  }

  CreateTransformPacket() {
    const controller = this.GetComponent('BasicCharacterController')
    // HACK
    return [
      controller.stateMachine.currentState.Name,
      this.Parent.Position.toArray(),
      this.Parent.Quaternion.toArray(),
    ]
  }

  Update(timeElapsed) {
    this.updateTimer_ -= timeElapsed
    if (this.updateTimer_ <= 0.0 && this.loaded_) {
      this.updateTimer_ = 0.1
      this.net_.SendTransformUpdate(this.CreateTransformPacket())
    }
  }
};
