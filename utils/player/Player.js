import JoyStick from '/utils/classes/JoyStick.js'
import defaultKeyboard from '/utils/classes/Input.js'

import Actor from './Actor.js'

export default class Player extends Actor {
  constructor({ input = defaultKeyboard, useJoystick, ...params }) {
    super({ input, ...params })

    if (useJoystick) this.input.joystick = new JoyStick()
  }
}
