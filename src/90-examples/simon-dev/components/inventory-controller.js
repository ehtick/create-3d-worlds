import { Component } from '../ecs/component.js'

class InventoryDatabaseController extends Component {
  constructor() {
    super()
    this.items_ = {}
  }

  AddItem(name, item) {
    this.items_[name] = item
  }

  Find(name) {
    return this.items_[name]
  }
};

class UIInventoryController extends Component {

  InitEntity() {
    this.RegisterHandler('inventory.updated', () => this.OnInventoryUpdated_())

    this.inventory = this.GetComponent('InventoryController')

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
        this.OnItemDropped_(other, element)
      }
    }

    for (const k in this.inventory.Inventory)
      _SetupElement(k)
  }

  OnInventoryUpdated_() {
    const items = this.inventory.Inventory
    for (const k in items)
      this.SetItemAtSlot_(k, items[k].value)
  }

  OnItemDropped_(oldElement, newElement) {
    const oldItem = this.inventory.Inventory[oldElement.id]
    const newItem = this.inventory.Inventory[newElement.id]

    const oldValue = oldItem.value
    const newValue = newItem.value

    this.SetItemAtSlot_(oldElement.id, newValue)
    this.SetItemAtSlot_(newElement.id, oldValue)

    this.inventory.SetItemAtSlot_(oldElement.id, newValue)
    this.inventory.SetItemAtSlot_(newElement.id, oldValue)
  }

  GetItemDefinition_(name) {
    const database = this.FindEntity('database').GetComponent('InventoryDatabaseController')
    return database.Find(name)
  }

  SetItemAtSlot_(slot, itemName) {
    const div = document.getElementById(slot)
    const item = this.GetItemDefinition_(itemName)
    if (item) {
      const path = '/assets/simon-dev/icons/weapons/' + item.renderParams.icon
      div.style.backgroundImage = 'url(\'' + path + '\')'
    } else
      div.style.backgroundImage = ''
  }
};

class InventoryController extends Component {
  constructor() {
    super()
    this.inventory = this.CreateEmpty_()
  }

  CreateEmpty_() {
    const inventory = {}
    for (let i = 1; i <= 24; ++i)
      inventory['inventory-' + i] = {
        type: 'inventory',
        value: null,
      }

    for (let i = 1; i <= 8; ++i)
      inventory['inventory-equip-' + i] = {
        type: 'equip',
        value: null,
      }

    return inventory
  }

  get Inventory() {
    return this.inventory
  }

  InitComponent() {
    // Hack
    this.RegisterHandler('network.inventory', m => this.OnNetworkUpdate_(m))
  }

  OnNetworkUpdate_(msg) {
    const inventory = this.CreateEmpty_()
    for (const k in msg.inventory)
      inventory[k].value = msg.inventory[k]

    for (const k in inventory)
      if (inventory[k].value != this.inventory[k].value)
        this.SetItemAtSlot_(k, inventory[k].value)

    if (inventory)
      this.Broadcast({
        topic: 'inventory.updated'
      })
  }

  CreatePacket() {
    // Meh
    const packet = {}
    for (const k in this.inventory)
      if (this.inventory[k].value)
        packet[k] = this.inventory[k].value

    return packet
  }

  GetItemDefinition_(name) {
    const database = this.FindEntity('database').GetComponent('InventoryDatabaseController')
    return database.Find(name)
  }

  SetItemAtSlot_(slot, itemName) {
    const oldValue = this.inventory[slot].value
    this.inventory[slot].value = itemName

    if (this.inventory[slot].type == 'equip' && oldValue != itemName)
      this.Broadcast({
        topic: 'inventory.equip',
        value: itemName,
      })
  }

  GetItemByName(name) {
    for (const k in this.inventory)
      if (this.inventory[k].value == name)
        return this.FindEntity(name)

    return null
  }
};

class InventoryItem extends Component {
  constructor(params) {
    super()
    this.params = params
  }

  get Params() {
    return this.params
  }

  get RenderParams() {
    return this.params.renderParams
  }
};

export {
  InventoryDatabaseController,
  UIInventoryController,
  InventoryController,
  InventoryItem,
}
