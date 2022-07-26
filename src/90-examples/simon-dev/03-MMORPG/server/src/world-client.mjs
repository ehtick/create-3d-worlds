import { quat, vec3 } from 'gl-matrix'

const _TIMEOUT = 600.0

class WorldClient {
  constructor(client, entity) {
    this.entity = entity
    // Hack
    this.entity.onEvent_ = (t, d) => this.OnEntityEvent_(t, d)
    this.client_ = client
    this.client_.onMessage = (e, d) => this.OnMessage_(e, d)
    this.client_.Send('world.player', this.entity .CreatePlayerPacket_())
    this.client_.Send('world.stats', this.entity .CreateStatsPacket_())
    this.timeout_ = _TIMEOUT
    this.entityCache_ = {}
    // Hack
    entity.parent = this
  }

  Destroy() {
    this.client_.Disconnect()
    this.client_ = null

    this.entity.Destroy()
    this.entity = null
  }

  OnDeath() {}

  OnEntityEvent_(t, d) {
    if (t == 'attack.damage')
      this.OnDamageEvent_(d)
  }

  OnMessage_(evt, data) {
    this.timeout_ = _TIMEOUT

    if (evt == 'world.update') {
      this.entity.UpdateTransform(data)
      return true
    }

    if (evt == 'chat.msg') {
      this.OnChatMessage_(data)
      return true
    }

    if (evt == 'action.attack') {
      this.entity.OnActionAttack()
      return true
    }

    if (evt == 'world.inventory') {
      this.OnInventoryChanged_(data)
      return true
    }
    return false
  }

  OnDamageEvent_(_) {}

  OnInventoryChanged_(inventory) {
    this.entity.UpdateInventory(inventory)

    // TODO: Merge this into entityCache_ path.
    const nearby = this.entity.FindNear(50, true)

    for (const n of nearby)
      n.parent.client_.Send('world.inventory', [this.entity.ID, inventory])
  }

  OnChatMessage_(message) {
    const chatMessage = {
      name: this.entity.accountInfo_.name,
      text: message,
    }
    this.BroadcastChat(chatMessage)
  }

  BroadcastChat(chatMessage) {
    const nearby = this.entity.FindNear(50, true)
    for (let i = 0; i < nearby.length; ++i) {
      const n = nearby[i]
      n.parent.client_.Send('chat.message', chatMessage)
    }
  }

  get IsDead() {
    return this.timeout_ <= 0.0
  }

  OnUpdate_(timeElapsed) {}

  OnUpdateClientState_() {}

  UpdateClientState_() {
    this.OnUpdateClientState_()
  }

  Update(timeElapsed) {
    this.timeout_ -= timeElapsed
    this.entity.Update(timeElapsed)
    this.OnUpdate_(timeElapsed)
  }
};

class WorldNetworkClient extends WorldClient {

  OnUpdate_(timeElapsed) {
  }

  OnUpdateClientState_() {
    const _Filter = e => e.ID != this.entity.ID

    const nearby = this.entity.FindNear(500).filter(e => _Filter(e))

    const updates = [{
      id: this.entity.ID,
      stats: this.entity.CreateStatsPacket_(),
      events: this.entity.CreateEventsPacket_(),
    }]
    const newCache_ = {}

    for (const n of nearby) {
      // We could easily trim this down based on what we know
      // this client saw last. Maybe do it later.
      const cur = {
        id: n.ID,
        transform: n.CreateTransformPacket_(),
        stats: n.CreateStatsPacket_(),
        events: n.CreateEventsPacket_(),
      }

      if (!(n.ID in this.entityCache_))
        cur.desc = n.GetDescription()

      newCache_[n.ID] = cur
      updates.push(cur)
    }

    this.entityCache_ = newCache_

    this.client_.Send('world.update', updates)
  }
};

class AIStateMachine {
  constructor(entity, terrain) {
    this.currentState = null
    this.entity = entity
    this.terrain_ = terrain
  }

  SetState(state) {
    const prevState = this.currentState

    if (prevState) {
      if (prevState.constructor.name == state.constructor.name)
        return

      prevState.Exit()
    }

    this.currentState = state
    this.currentState.parent = this
    this.currentState.entity = this.entity
    this.currentState.terrain_ = this.terrain_
    state.Enter(prevState)
  }

  Update(timeElapsed) {
    if (this.currentState)
      this.currentState.Update(timeElapsed)

  }
};

class AIState {
  Exit() {}
  Enter() {}
  Update(timeElapsed) {}
}

class AIState_JustSitThere extends AIState {
  constructor() {
    super()
    this.timer_ = 0.0
  }

  UpdateLogic_() {
    const _IsPlayer = e => !e.isAI
    const nearby = this.entity.FindNear(50.0).filter(e => e.Health > 0).filter(_IsPlayer)

    if (nearby.length > 0)
      this.parent.SetState(new AIState_FollowToAttack(nearby[0]))
  }

  Update(timeElapsed) {
    this.timer_ += timeElapsed
    this.entity.SetState('idle')

    if (this.timer_ > 5.0) {
      this.UpdateLogic_()
      this.timer_ = 0.0
    }
  }
};

class AIState_FollowToAttack extends AIState {
  constructor(target) {
    super()
    this.target = target
  }

  UpdateMovement_(timeElapsed) {
    this.entity.state_ = 'walk'

    const direction = vec3.create()
    const forward = vec3.fromValues(0, 0, 1)

    vec3.sub(direction, this.target.position, this.entity.position)
    direction[1] = 0.0

    vec3.normalize(direction, direction)
    quat.rotationTo(this.entity.rotation_, forward, direction)

    const movement = vec3.clone(direction)
    vec3.scale(movement, movement, timeElapsed * 10.0)

    vec3.add(this.entity.position, this.entity.position, movement)

    this.entity.position[1] = this.terrain_.Get(...this.entity.position)[0]
    this.entity.UpdateGridClient_()

    const distance = vec3.distance(this.entity.position, this.target.position)

    if (distance < 10.0) {
      this.entity.OnActionAttack()
      this.parent.SetState(new AIState_WaitAttackDone(this.target))
    } else if (distance > 100.0)
      this.parent.SetState(new AIState_JustSitThere())
  }

  Update(timeElapsed) {
    if (!this.target.Valid || this.target.Health == 0) {
      this.parent.SetState(new AIState_JustSitThere(this.target))
      return
    }
    this.UpdateMovement_(timeElapsed)
  }
};

class AIState_WaitAttackDone extends AIState {
  constructor(target) {
    super()
    this.target = target
  }

  Update(_) {
    this.entity.state_ = 'attack'
    if (this.entity.action_)
      return
    this.parent.SetState(new AIState_FollowToAttack(this.target))
  }
};

class FakeClient {
  Send(msg, data) {}

  Disconnect() {}
};

class WorldAIClient extends WorldClient {
  constructor(entity, terrain, onDeath) {
    super(new FakeClient(), entity)
    this.terrain_ = terrain
    this.onDeath_ = onDeath
    // Haha sorry
    this.entity.isAI = true

    this.fsm_ = new AIStateMachine(entity, this.terrain_)
    this.fsm_.SetState(new AIState_JustSitThere())

    this.deathTimer_ = 0.0
  }

  get IsDead() {
    return this.deathTimer_ >= 30.0
  }

  OnDeath() {
    this.onDeath_()
  }

  OnUpdateClientState_() {}

  OnUpdate_(timeElapsed) {
    // Never times out
    this.timeout_ = 1000.0
    if (this.entity.Health > 0)
      this.fsm_.Update(timeElapsed)
    else
      this.deathTimer_ += timeElapsed
  }
};

export {
  WorldNetworkClient,
  WorldAIClient,
}
