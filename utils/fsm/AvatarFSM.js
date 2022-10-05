import PlayerFSM from './PlayerFSM.js'
import { camera } from '/utils/scene.js'
import { createAvatar, updateAvatar, uniforms, skins } from '/utils/geometry/avatar.js'

export default class AvatarFSM extends PlayerFSM {
  constructor() {
    super({ mesh: createAvatar(), camera, jumpStyle: 'FLY', speed: 4 })
  }
}
