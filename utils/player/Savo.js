import { MathUtils } from 'three'
import Player from '/utils/player/Player.js'
import { camera as defaultCamera } from '/utils/scene.js'
import { getCameraIntersects, getScene, belongsTo, getParent, shakeCamera } from '/utils/helpers.js'
import FPSRenderer from '/utils/classes/2d/FPSRenderer.js'
import { shootDecals } from '/utils/decals.js'
import Particles from '/utils/classes/Particles.js'
import config from '/config.js'
import input from '/utils/classes/Input.js'
import { jumpStyles } from '/utils/constants.js'

const { randInt } = MathUtils

export default class Savo extends Player {
  constructor({
    mousemove = false, camera = defaultCamera, rifleBurst = false, ...params
  } = {}) {
    super({
      jumpStyle: jumpStyles.FLY,
      ...params
    })
    this.mouseSensitivity = .002
    this.mousemove = mousemove
    this.rifleBurst = rifleBurst
    this.time = 0
    this.energy = 200

    const file = rifleBurst ? 'rifle-burst' : 'rifle'
    this.audio = new Audio(`/assets/sounds/${file}.mp3`)
    this.audio.volume = config.volume

    this.fpsRenderer = new FPSRenderer()
    this.camera = camera
    camera.position.set(0, this.height * .8, this.height / 4)
    camera.rotation.set(0, 0, 0)
    this.mesh.add(camera)

    this.ricochet = new Particles({ num: 100, size: .05, unitAngle: 0.2 })

    document.body.addEventListener('click', () => this.shoot())
    if (mousemove) document.addEventListener('mousemove', e => this.onMouseMove(e))
  }

  get cameraTarget() {
    const pos = this.mesh.position.clone()
    pos.y += this.height * .8
    return pos
  }

  lookAtFront() {
    this.camera.lookAt(this.cameraTarget)
  }

  onMouseMove(e) {
    this.mesh.rotateY(-e.movementX * this.mouseSensitivity)
    this.camera.rotateX(-e.movementY * this.mouseSensitivity)
    this.camera.rotation.x = Math.max(-0.1, Math.min(Math.PI / 8, this.camera.rotation.x))
  }

  shoot() {
    if (this.isDead) return

    const shoots = this.rifleBurst ? 5 : 1
    this.audio.currentTime = 0
    this.audio.play()

    for (let i = 0; i < shoots; i++) setTimeout(() => {
      const intersects = getCameraIntersects(this.camera, this.solids) // .filter(x => x.object.name != 'decal')
      if (!intersects.length) return

      const { point, object } = intersects[0]
      const isEnemy = belongsTo(object, 'enemy')

      if (!isEnemy) shootDecals(intersects[0], { color: 0x000000 })

      const ricochetColor = isEnemy ? 0x8a0303 : 0xcccccc
      this.ricochet.reset({ pos: point, unitAngle: 0.2, color: ricochetColor })
      const scene = getScene(object)
      scene.add(this.ricochet.mesh)

      if (isEnemy) {
        const mesh = getParent(object, 'enemy')
        mesh.userData.hitAmount = randInt(35, 55)
      }

      this.time -= .5 // recoil
    }, i * 100)
  }

  painEffect() {
    this.shouldDrawPain = true
    shakeCamera(this.camera, this.hitAmount * .005, () => {
      this.shouldDrawPain = this.isDead // true only if dead
    })
  }

  checkHit() {
    if (this.hitAmount) this.painEffect()
    super.checkHit()
  }

  update(delta) {
    if (this.energy > 0) {
      super.update(delta)
      this.time += (input.run ? delta * 2 : delta)
      this.fpsRenderer.render(this.time)
    } else {
      this.fpsRenderer.clear()
      this.fpsRenderer.drawFixedTarget()
    }

    this.ricochet.expand({ velocity: 1.2, maxRounds: 5, gravity: .02 })

    if (this.shouldDrawPain) this.fpsRenderer.drawPain()

    if (!this.mousemove) this.lookAtFront()
  }
}
