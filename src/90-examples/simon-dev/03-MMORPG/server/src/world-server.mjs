import { performance } from 'perf_hooks'

import { WorldManager } from './world-manager.mjs'
import { LoginQueue } from './login-queue.mjs'

class SocketWrapper {
  constructor(params) {
    this.socket_ = params.socket
    this.onMessage = null
    this.dead = false
    this.SetupSocket_()
  }

  get ID() {
    return this.socket_.id
  }

  get IsAlive() {
    return !this.dead
  }

  SetupSocket_() {
    this.socket_.on('user-connected', () => {
      console.log('socket.id: ' + this.ID)
    })
    this.socket_.on('disconnect', () => {
      console.log('Client disconnected.')
      this.dead = true
    })
    this.socket_.onAny((e, d) => {
      try {
        if (!this.onMessage(e, d)) {
          console.log('Unknown command (' + e + '), disconnected.')
          this.Disconnect()
        }
      } catch (err) {
        console.error(err)
        this.Disconnect()
      }
    })
  }

  Disconnect() {
    this.socket_.disconnect(true)
  }

  Send(msg, data) {
    this.socket_.emit(msg, data)
  }
};

export class WorldServer {
  constructor(io) {
    this.loginQueue_ = new LoginQueue(
      (c, p) => this.OnLogin_(c, p)
    )
    this.worldMgr_ = new WorldManager({ parent: this })
    this.SetupIO_(io)
  }

  SetupIO_(io) {
    io.on('connection', socket => {
      this.loginQueue_.Add(new SocketWrapper({ socket }))
    })
  }

  OnLogin_(client, params) {
    this.worldMgr_.Add(client, params)
  }

  Run() {
    const t1 = performance.now()
    this.Schedule_(t1)
  }

  Schedule_(t1) {
    setTimeout(() => {
      const t2 = performance.now()
      this.Update_((t2 - t1) * 0.001)
      this.Schedule_(t2)
    })
  }

  Update_(timeElapsed) {
    this.worldMgr_.Update(timeElapsed)
  }
}
