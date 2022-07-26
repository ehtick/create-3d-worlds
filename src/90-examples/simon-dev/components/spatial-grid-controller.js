import { Component } from '../ecs/component.js'

export class SpatialGridController extends Component {
  constructor({ grid }) {
    super()
    this.grid = grid
  }

  Destroy() {
    this.grid.Remove(this.client_)
    this.client_ = null
  }

  InitComponent() {
    const pos = [
      this.parent._position.x,
      this.parent._position.z,
    ]

    this.client_ = this.grid.NewClient(pos, [1, 1])
    this.client_.entity = this.parent
    this._RegisterHandler('update.position', m => this._OnPosition(m))
  }

  _OnPosition(msg) {
    this.client_.position = [msg.value.x, msg.value.z]
    this.grid.UpdateClient(this.client_)
  }

  FindNearbyEntities(range) {
    const results = this.grid.FindNear([this.parent._position.x, this.parent._position.z], [range, range])

    return results.filter(c => c.entity != this.parent)
  }
};
