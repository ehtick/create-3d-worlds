import { clock } from '/utils/scene.js'
import Player from '/utils/classes/Player.js'
import { createAvatar, updateAvatar, uniforms, skins } from '/utils/geometry/avatar.js'

export default class Avatar extends Player {
  constructor({ skin = skins.STONE, size = 1, ...params } = {}) {
    super({ mesh: createAvatar({ skin, r: size }), speed: size * 8, ...params })
    this.limbs = [
      this.mesh.getObjectByName('leftHand'), this.mesh.getObjectByName('rightHand'),
      this.mesh.getObjectByName('leftLeg'), this.mesh.getObjectByName('rightLeg')
    ]
  }

  idle() {
    this.limbs.forEach(limb => {
      limb.position.z = 0
    })
  }

  move(dir) {
    super.move(dir)
    this.walkAnim()
  }

  jump() {
    super.jump()
    this.limbs.forEach(limb => {
      limb.position.z = this.size * .3
    })
  }

  fall() {
    super.fall()
    this.idle()
  }

  walkAnim() {
    const r = this.size * .5
    const speedFactor = this.running ? 9 : 6
    const elapsed = Math.sin(clock.getElapsedTime() * speedFactor) * r
    updateAvatar(this.mesh, elapsed)
  }

  sideWalk(dir) {
    super.sideWalk(dir)
    this.walkAnim()
  }

  update(delta = clock.getDelta()) {
    super.update(delta)
    uniforms.time.value += 0.8 * delta // for lava skin only
  }
}
