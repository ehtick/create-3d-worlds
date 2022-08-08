import * as THREE from 'three'
import { camera } from '/utils/scene.js'
import { Component } from '../ecs/component.js'

export class BasicCharacterControllerInput extends Component {
  constructor() {
    super()
    this.Init()
  }

  Init() {
    document.addEventListener('mouseup', e => this._onMouseUp(e), false)
  }

  _onMouseUp(event) {
    const rect = document.getElementById('container').getBoundingClientRect()
    const pos = {
      x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
      y: ((event.clientY - rect.top) / rect.height) * -2 + 1,
    }

    const pickables = this.Manager.Filter(e => {
      const p = e.GetComponent('PickableComponent')
      if (!p) return false
      return e._mesh
    })

    const ray = new THREE.Ray()
    ray.origin.setFromMatrixPosition(camera.matrixWorld)
    ray.direction.set(pos.x, pos.y, 0.5).unproject(camera).sub(ray.origin).normalize()

    // hack
    document.getElementById('quest-ui').style.visibility = 'hidden'

    for (const p of pickables) {
      const box = new THREE.Box3().setFromObject(p._mesh)
      if (ray.intersectsBox(box)) {
        p.Broadcast({
          topic: 'input.picked'
        })
        break
      }
    }
  }
}