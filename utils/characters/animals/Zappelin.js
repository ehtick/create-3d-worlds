import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'
import { loadModel } from '/utils/loaders.js'
import { findChild } from '/utils/helpers.js'
import { reactions } from '/utils/constants.js'
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js'

/* LOADING */

const { mesh } = await loadModel({ file: 'airship/zeppelin.fbx', size: 40, speed: 10 })

/* EXTENDED CLASSES */

const sharedProps = { mesh, shouldRaycastGround: false, baseState: 'patrol', patrolDistance: Infinity }

export class ZappelinPlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
    this.mesh.position.y = 60
    this.propeler = findChild(this.mesh, 'propeler')
  }

  update(delta) {
    super.update(delta)
    this.propeler?.rotateY(delta * -1)
  }
}

export class ZappelinAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
    this.mesh.position.y = 60
    this.propeler = findChild(this.mesh, 'propeler')
  }

  turnSmooth(angle = Math.PI) {
    new TWEEN.Tween(this.mesh.rotation)
      .to({ y: this.mesh.rotation.y + angle }, 1500)
      .start()
  }

  updateMove(delta) {
    super.updateMove(delta, reactions.BOUNCE)
  }

  update(delta) {
    super.update(delta)
    this.propeler?.rotateY(delta * -1)
  }
}
