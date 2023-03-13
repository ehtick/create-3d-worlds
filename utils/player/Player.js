import JoyStick from '/utils/classes/JoyStick.js'
import defaultKeyboard from '/utils/classes/Input.js'
import { jumpStyles, attackStyles, reactions } from '/utils/constants.js'
import { getPlayerState } from './states/index.js'

import Actor from './Actor.js'

export default class Player extends Actor {
  constructor({
    input = defaultKeyboard,
    useJoystick,
    attackStyle = attackStyles.ONCE,
    jumpStyle = jumpStyles.FALSE_JUMP,
    getState = name => getPlayerState(name, jumpStyle, attackStyle),
    shouldRaycastGround = true,
    attackDistance = 1.5,
    ...params
  }) {
    super({ input, jumpStyle, getState, shouldRaycastGround, attackDistance, ...params })
    this.name = 'player'

    if (useJoystick) this.input.joystick = new JoyStick()
  }

  updateMove(delta, reaction = reactions.STOP) {
    super.updateMove(delta, reaction)
  }

  attackAction(name = 'enemy') {
    super.attackAction(name)
  }

  hit(mesh, range = [35, 55]) {
    super.hit(mesh, range)
  }
}
