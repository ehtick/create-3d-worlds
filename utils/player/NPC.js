import Player from './Player.js'
import { Keyboard } from '/utils/classes/Keyboard.js'

export default class NPC extends Player {
  constructor(params = {}) {
    super({ keyboard: new Keyboard(false), ...params })
    this.speed = 0
  }
}