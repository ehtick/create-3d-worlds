import PlayerFSM from './PlayerFSM.js'
import { clock } from '/utils/scene.js'
import { createAvatar, updateAvatar, uniforms, skins } from '/utils/geometry/avatar.js'

export default class AvatarFSM extends PlayerFSM {
  constructor({ skin = skins.STONE, size = 1, ...params } = {}) {
    super({ mesh: createAvatar({ skin, r: size }), speed: size * 4, jumpStyle: 'FLY', ...params })
    this.limbs = [
      this.mesh.getObjectByName('leftHand'), this.mesh.getObjectByName('rightHand'),
      this.mesh.getObjectByName('leftLeg'), this.mesh.getObjectByName('rightLeg')
    ]
  }

  idleAnim() {
    const idleRange = .09
    this.limbs.forEach(({ position }) => {
      position.z = position.z > idleRange
        ? position.z * .9 // normalize
        : Math.sin(clock.getElapsedTime()) * idleRange // breathe
    })
  }

  walkAnim(running = false) {
    const r = this.size * .5
    const speedFactor = running ? 9 : 6
    const elapsed = Math.sin(clock.getElapsedTime() * speedFactor) * r
    updateAvatar(this.mesh, elapsed)
  }

  jumpAnim() {
    this.limbs.forEach(limb => {
      limb.position.z = this.size * .3
    })
  }

  update(delta) {
    super.update(delta)
    const { name } = this.currentState

    if (name === 'walk')
      this.walkAnim()
    else if (name === 'run')
      this.walkAnim(true)
    else if (this.keyboard.space)
      this.jumpAnim()
    else
      this.idleAnim(true)

    uniforms.time.value += 0.8 * delta // for lava skin only
  }
}
