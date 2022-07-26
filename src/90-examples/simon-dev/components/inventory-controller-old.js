import { Component } from '../ecs/component.js'

export class InventoryController extends Component {
  constructor() {
    super()

    this.inventory = {}
    for (let i = 1; i <= 24; ++i)
      this.inventory['inventory-' + i] = {
        type: 'inventory',
        value: null,
      }

    for (let i = 1; i <= 8; ++i)
      this.inventory['inventory-equip-' + i] = {
        type: 'equip',
        value: null,
      }
  }

  InitComponent() {
    this.RegisterHandler('inventory.add', m => this._OnInventoryAdded(m))

    const _SetupElement = n => {
      const element = document.getElementById(n)
      element.ondragstart = ev => {
        ev.dataTransfer.setData('text/plain', n)
      }
      element.ondragover = ev => {
        ev.preventDefault()
      }
      element.ondrop = ev => {
        ev.preventDefault()
        const data = ev.dataTransfer.getData('text/plain')
        const other = document.getElementById(data)
        this._OnItemDropped(other, element)
      }
    }

    for (const k in this.inventory)
      _SetupElement(k)
  }

  _OnItemDropped(oldElement, newElement) {
    const oldItem = this.inventory[oldElement.id]
    const newItem = this.inventory[newElement.id]

    const oldValue = oldItem.value
    const newValue = newItem.value

    this._SetItemAtSlot(oldElement.id, newValue)
    this._SetItemAtSlot(newElement.id, oldValue)

    if (newItem.type == 'equip')
      this.Broadcast({
        topic: 'inventory.equip',
        value: oldValue,
        added: false,
      })
  }

  _SetItemAtSlot(slot, itemName) {
    const div = document.getElementById(slot)
    const obj = this.FindEntity(itemName)
    if (obj) {
      const item = obj.GetComponent('InventoryItem')
      const path = '/assets/simon-dev/icons/weapons/' + item.RenderParams.icon
      div.style.backgroundImage = 'url(\'' + path + '\')'
    } else
      div.style.backgroundImage = ''

    this.inventory[slot].value = itemName
  }

  _OnInventoryAdded(msg) {
    for (const k in this.inventory)
      if (!this.inventory[k].value && this.inventory[k].type == 'inventory') {
        this.inventory[k].value = msg.value
        msg.added = true
        this._SetItemAtSlot(k, msg.value)
        break
      }
  }

  GetItemByName(name) {
    for (const k in this.inventory)
      if (this.inventory[k].value == name)
        return this.FindEntity(name)

    return null
  }
}

export class InventoryItem extends Component {
  constructor(params) {
    super()
    this.params = params
  }

  InitComponent() {}

  get Params() {
    return this.params
  }

  get RenderParams() {
    return this.params.renderParams
  }
}