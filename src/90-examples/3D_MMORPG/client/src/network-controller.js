/* global io */
import 'https://cdn.jsdelivr.net/npm/socket.io-client@3.1.0/dist/socket.io.js'

import { entity } from './entity.js'

export class NetworkController extends entity.Component {
  constructor() {
    super()
    this.playerID_ = null
    this.SetupSocket_()
  }

  GenerateRandomName_() {
    const names1 = [
      'Aspiring', 'Nameless', 'Cautionary', 'Excited',
      'Modest', 'Maniacal', 'Caffeinated', 'Sleepy',
      'Passionate', 'Medical',
    ]
    const names2 = [
      'Painter', 'Cheese Guy', 'Giraffe', 'Snowman',
      'Doberwolf', 'Cocktail', 'Fondler', 'Typist',
      'Noodler', 'Arborist', 'Peeper'
    ]
    const n1 = names1[Math.floor(Math.random() * names1.length)]
    const n2 = names2[Math.floor(Math.random() * names2.length)]
    return n1 + ' ' + n2
  }

  SetupSocket_() {
    this.socket_ = io('ws://localhost:3000', {
      reconnection: false,
      transports: ['websocket'],
      timeout: 10000,
    })

    this.socket_.on('connect', () => {
      console.log(this.socket_.id)
      const randomName = this.GenerateRandomName_()
      // Input validation is for losers
      this.socket_.emit('login.commit', document.getElementById('login-input').value)
    })

    this.socket_.on('disconnect', () => {
      console.log('DISCONNECTED: ' + this.socket_.id) // undefined
    })

    this.socket_.onAny((e, data) => this.OnMessage_(e, data))
  }

  SendChat(txt) {
    this.socket_.emit('chat.msg', txt)
  }

  SendTransformUpdate(transform) {
    this.socket_.emit('world.update', transform)
  }

  SendActionAttack_() {
    this.socket_.emit('action.attack')
  }

  SendInventoryChange_(packet) {
    this.socket_.emit('world.inventory', packet)
  }

  GetEntityID_(serverID) {
    if (serverID == this.playerID_)
      return 'player'
    return '__npc__' + serverID
  }

  _handleWorldPlayer(data) {
    const spawner = this.FindEntity('spawners').GetComponent('PlayerSpawner')
    const player = spawner.Spawn(data.desc)
    player.Broadcast({
      topic: 'network.update',
      transform: data.transform,
    })

    player.Broadcast({
      topic: 'network.inventory',
      inventory: data.desc.character.inventory,
    })

    console.log('entering world: ' + data.id)
    this.playerID_ = data.id
  }

  _handleWorldUpdate(data) {
    for (const d of data) {
      let entity
      const id = this.GetEntityID_(d.id)
      if ('desc' in d) {
        const spawner = this.FindEntity('spawners').GetComponent('NetworkEntitySpawner')
        entity = spawner.Spawn(id, d.desc)
        entity.Broadcast({
          topic: 'network.inventory',
          inventory: d.desc.character.inventory,
        })
      } else
        entity = this.FindEntity(id)

      if (!entity) continue

      // Translate events, hardcoded, bad, sorry
      const events = []
      if (d.events)
        for (const e of d.events)
          events.push({
            type: e.type,
            target: this.FindEntity(this.GetEntityID_(e.target)),
            attacker: this.FindEntity(this.GetEntityID_(e.attacker)),
            amount: e.amount,
          })

      const ui = this.FindEntity('ui').GetComponent('UIController')
      ui.AddEventMessages(events)
      entity.Broadcast({
        topic: 'network.update',
        transform: d.transform,
        stats: d.stats,
        events,
      })
    }
  }

  _handleChatMessage(data) {
    this.FindEntity('ui').GetComponent('UIController').AddChatMessage(data)
  }

  _handleWorldInventory(data) {
    const id = this.GetEntityID_(data[0])
    const e = this.FindEntity(id)
    if (!e) return

    e.Broadcast({
      topic: 'network.inventory',
      inventory: data[1],
    })
  }

  OnMessage_(e, data) {
    switch (e) {
      case 'world.player': return this._handleWorldPlayer(data)
      case 'world.update': return this._handleWorldUpdate(data)
      case 'chat.msg': return this._handleChatMessage(data)
      case 'world.inventory': return this._handleWorldInventory(data)
    }
  }
};
