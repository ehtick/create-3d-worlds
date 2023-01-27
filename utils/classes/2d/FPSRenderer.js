import Canvas from './Canvas.js'
import keyboard from '../Keyboard.js'

const targetSrc = '/assets/images/crosshair.png'

export default class FPSRenderer extends Canvas {
  constructor({ weaponSrc = '/assets/images/savo.png', targetY = 0.5 } = {}) {
    super()
    this.weaponSrc = weaponSrc
    this.weaponImg = new Image()
    this.targetImg = new Image()
    this.targetY = targetY
  }

  drawWeapon(elapsedTime) {
    this.handleLoad(this.weaponImg, this.weaponSrc, 'drawWeaponOnLoad', elapsedTime)
  }

  drawTarget(elapsedTime) {
    this.handleLoad(this.targetImg, targetSrc, 'drawTargetOnLoad', elapsedTime)
  }

  handleLoad(img, src, drawMethod, elapsedTime) {
    if (img.complete && img.naturalWidth) this[drawMethod](elapsedTime)
    else {
      img.onload = () => this[drawMethod](elapsedTime)
      img.src = src
    }
  }

  drawWeaponOnLoad(elapsedTime) {
    this.drawShake(this.weaponImg, elapsedTime, 0.51)
  }

  drawTargetOnLoad(elapsedTime) {
    this.drawShake(this.targetImg, elapsedTime, 0.5, this.targetY)
  }

  drawShake(img, elapsedTime = 1, xAlign = 0.5, yAlign = 1) {
    const shaking = keyboard.controlsPressed ? 6 : 1
    const shakeX = Math.cos(elapsedTime * 2) * shaking
    const shakeY = Math.sin(elapsedTime * 4) * shaking

    this.draw(img, xAlign, yAlign, shakeX, shakeY)
  }

  draw(img, xAlign = 0.5, yAlign = 1, shakeX = 0, shakeY = 0) {
    const x = window.innerWidth * xAlign - img.width * 0.5 + shakeX
    const y = window.innerHeight * yAlign - img.height + shakeY + 10 // korekcija
    this.ctx.drawImage(img, x, y)
  }

  drawFixedTarget() {
    this.draw(this.targetImg, 0.5, this.targetY)
  }

  renderTarget() {
    this.clear()
    this.handleLoad(this.targetImg, targetSrc, 'drawFixedTarget')
  }

  render(elapsedTime) {
    this.clear()
    this.drawWeapon(elapsedTime)
    this.drawTarget(elapsedTime)
  }
}

customElements.define('my-first-person', FPSRenderer, { extends: 'canvas' })
