import JoyStick from '/utils/classes/JoyStick.js'
import defaultKeyboard from '/utils/classes/Input.js'
import { jumpStyles } from '/utils/constants.js'
import { getPlayerState } from './states/index.js'

import Actor from './Actor.js'

export default class Player extends Actor {
  constructor({
    input = defaultKeyboard,
    useJoystick,
    attackStyle,
    jumpStyle = jumpStyles.FALSE_JUMP,
    getState = name => getPlayerState(name, jumpStyle, attackStyle),
    shouldRaycastGround = true,
    ...params
  }) {
    super({ input, jumpStyle, getState, shouldRaycastGround, ...params })

    if (useJoystick) this.input.joystick = new JoyStick()
  }
}
