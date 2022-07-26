import * as THREE from '/node_modules/three127/build/three.module.js'
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.127/examples/jsm/loaders/FBXLoader.js'

import { Component } from '../ecs/component.js'
import { CHARACTER_MODELS } from '../03-MMORPG/shared/data.mjs'

export class EquipWeapon extends Component {
  constructor({ desc }) { // {account, character} = desc
    super()
    this.target = null
    this.name_ = null

    const classType = desc.character.class
    const modelData = CHARACTER_MODELS[classType]
    this.anchor_ = modelData.anchors.rightHand
  }

  InitComponent() {
    this._RegisterHandler('load.character', m => this._OnCharacterLoaded(m))
    this._RegisterHandler('inventory.equip', m => this._OnEquip(m))
  }

  _OnCharacterLoaded(msg) {
    this._bones = msg.bones
    this._AttachTarget()
  }

  _AttachTarget() {
    if (this._bones && this.target)
      this._bones[this.anchor_].add(this.target)
  }

  GetItemDefinition_(name) {
    const database = this.FindEntity('database').GetComponent('InventoryDatabaseController')
    return database.Find(name)
  }

  _OnEquip(msg) {
    if (msg.value == this.name_) return

    if (this.target) this._UnloadModels()

    const item = this.GetItemDefinition_(msg.value)
    this.name_ = msg.value

    if (item) this._LoadModels(item, () => this._AttachTarget())
  }

  _UnloadModels() {
    if (this.target) {
      this.target.parent.remove(this.target)
      this.target = null
    }
  }

  _LoadModels(item, cb) {
    const loader = new FBXLoader()
    loader.setPath('/assets/simon-dev/weapons/FBX/')
    loader.load(item.renderParams.name + '.fbx', fbx => {
      this.target = fbx
      this.target.scale.setScalar(item.renderParams.scale)
      this.target.rotateX(Math.PI / 2)
      this.target.traverse(c => {
        c.castShadow = true
        c.receiveShadow = true
        // Do this instead of something smart like re-exporting.
        let materials = c.material
        const newMaterials = []
        if (!(c.material instanceof Array))
          materials = [c.material]

        for (const m of materials)
          if (m) {
            const c = new THREE.Color().copy(m.color)
            c.multiplyScalar(0.75)
            newMaterials.push(new THREE.MeshStandardMaterial({
              color: c,
              name: m.name,
              metalness: 1.0,
            }))
          }

        if (!(c.material instanceof Array))
          c.material = newMaterials[0]
        else
          c.material = newMaterials
      })

      cb()

      this.Broadcast({
        topic: 'load.weapon',
        model: this.target,
        bones: this._bones,
      })
    })
  }
};
