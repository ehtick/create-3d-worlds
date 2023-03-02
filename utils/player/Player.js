import JoyStick from '/utils/classes/JoyStick.js'

import Actor from './Actor.js'

export default class Player extends Actor {
  constructor({ useJoystick, ...params }) {
    super({ ...params })

    if (useJoystick) this.input.joystick = new JoyStick()
  }
}
