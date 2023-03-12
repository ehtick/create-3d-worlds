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

export default class FPSPlayer extends Player {
  constructor({
    camera = defaultCamera,
    mouseSensitivity = .002,
    useMouse = false,
    rifleBurst = false,
    ...rest
  } = {}) {
    super({ jumpStyle: jumpStyles.FLY, ...rest })
    this.mouseSensitivity = mouseSensitivity
    this.useMouse = useMouse
    this.rifleBurst = rifleBurst
    this.time = 0
    this.energy = 200
    this.hurting = false

    const file = rifleBurst ? 'rifle-burst' : 'rifle'
    this.audio = new Audio(`/assets/sounds/${file}.mp3`)
    this.audio.volume = config.volume

    this.fpsRenderer = new FPSRenderer()
    this.camera = camera
    camera.position.set(0, this.cameraHeight, this.height / 4)
    camera.rotation.set(0, 0, 0)
    this.mesh.add(camera)

    this.ricochet = new Particles({ num: 100, size: .05, unitAngle: 0.2 })

    document.body.addEventListener('click', () => this.fire())
    if (useMouse) document.addEventListener('mousemove', e => this.moveCursor(e))
  }

  get cameraHeight() {
    return this.height * .8
  }

  get cameraTarget() {
    const pos = this.mesh.position.clone()
    pos.y += this.cameraHeight
    return pos
  }

  updateCamera() {
    if (!this.useMouse) this.camera.lookAt(this.cameraTarget)
  }

  moveCursor(e) {
    if (this.hurting || this.isDead) return
    this.mesh.rotateY(-e.movementX * this.mouseSensitivity)
    this.camera.rotateX(-e.movementY * this.mouseSensitivity)
    this.camera.rotation.x = Math.max(-0.1, Math.min(Math.PI / 8, this.camera.rotation.x))
  }

  shoot() {
    const intersects = getCameraIntersects(this.camera, this.solids)
    if (!intersects.length) return

    const { point, object } = intersects[0]
    shootDecals(intersects[0], { color: 0x000000 })
    let ricochetColor = 0xcccccc

    if (belongsTo(object, 'enemy')) {
      const mesh = getParent(object, 'enemy')
      mesh.userData.hitAmount = randInt(35, 55)
      ricochetColor = mesh.userData.hitColor
    }

    this.ricochet.reset({ pos: point, unitAngle: 0.2, color: ricochetColor })
    const scene = getScene(object)
    scene.add(this.ricochet.mesh)

    shakeCamera(this.camera, 0.14)
  }

  fire() {
    if (this.isDead) return

    this.audio.currentTime = 0
    this.audio.play()

    const shoots = this.rifleBurst ? 5 : 1
    for (let i = 0; i < shoots; i++)
      setTimeout(() => this.shoot(), i * 100)
  }

  painEffect() {
    this.hurting = true
    shakeCamera(this.camera, this.hitAmount * .009, () => {
      this.hurting = this.isDead // true only if dead
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

    if (this.hurting) this.fpsRenderer.drawPain()

    this.updateCamera()
  }
}
