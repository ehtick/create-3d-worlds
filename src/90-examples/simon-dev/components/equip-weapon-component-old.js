import { FBXLoader } from '/node_modules/three127/examples/jsm/loaders/FBXLoader.js'

import { Component } from '../ecs/component.js'

export class EquipWeapon extends Component {
  constructor({ anchor }) { // 'RightHandIndex1'
    super()
    this.params = { anchor }
    this.target = null
    this._name = null
  }

  InitComponent() {
    this._RegisterHandler('load.character', m => this._OnCharacterLoaded(m))
    this._RegisterHandler('inventory.equip', m => this._OnEquip(m))
  }

  get Name() {
    return this._name
  }

  _OnCharacterLoaded(msg) {
    this._bones = msg.bones
    this._AttachTarget()
  }

  _AttachTarget() {
    if (this._bones && this.target)
      this._bones[this.params.anchor].add(this.target)
  }

  _OnEquip(msg) {
    if (msg.value == this._name)
      return

    if (this.target)
      this._UnloadModels()

    const inventory = this.GetComponent('InventoryController')
    const item = inventory.GetItemByName(msg.value).GetComponent('InventoryItem')
    this._name = msg.value

    this._LoadModels(item, () => {
      this._AttachTarget()
    })
  }

  _UnloadModels() {
    if (this.target) {
      this.target.parent.remove(this.target)
      // Probably need to free the memory properly, whatever
      this.target = null
    }
  }

  _LoadModels(item, cb) {
    const loader = new FBXLoader()
    loader.setPath('/assets/simon-dev/weapons/FBX/')
    loader.load(item.RenderParams.name + '.fbx', fbx => {
      this.target = fbx
      this.target.scale.setScalar(item.RenderParams.scale)
      this.target.rotateY(Math.PI)
      this.target.rotateX(-Math.PI / 3)
      this.target.rotateY(-1)

      this.target.traverse(c => {
        c.castShadow = true
        c.receiveShadow = true
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
