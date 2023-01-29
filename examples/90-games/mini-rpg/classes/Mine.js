import Entity from './Entity.js'
import { roll } from '../utils/helpers.js'
import { DEGREE } from '/data/constants.js'

export default class Mine extends Entity {
  constructor(model) {
    super(model)
    this.name = 'mine'
    this.units = 100
    this.rotation.y = roll(180) * DEGREE
  }
}
