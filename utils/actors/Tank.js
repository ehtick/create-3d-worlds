import Player from '/utils/player/Player.js'
import AI from '/utils/player/AI.js'
import { loadModel } from '/utils/loaders.js'

/* LOADING */

const { mesh } = await loadModel({ file: 'tank/renault-ft.fbx', texture: 'metal/metal01.jpg', size: 2.5 })

/* EXTENDED CLASSES */

const sharedProps = { mesh, speed: 2 }

export class TankPlayer extends Player {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
  }
}

export class TankAI extends AI {
  constructor(props = {}) {
    super({ ...sharedProps, ...props })
  }

  turnSmooth() {
    super.turnSmooth(Math.PI, 2500)
  }
}
