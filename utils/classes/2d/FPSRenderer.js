import Canvas from './Canvas.js'
import input from '../Input.js'

const targetSrc = '/assets/images/crosshair.png'

let time = 0

export default class FPSRenderer extends Canvas {
  constructor({ weaponSrc = '/assets/images/savo-big.png', targetY = 0.5 } = {}) {
    super()
    this.weaponSrc = weaponSrc
    this.weaponImg = new Image()
    this.targetImg = new Image()
    this.targetY = targetY
  }

  drawPain() {
    this.ctx.fillStyle = 'rgba(255, 0, 0, 0.4)'
    this.ctx.fillRect(0, 0, this.width, this.height)
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
    const shaking = input.controlsPressed ? 6 : 1
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

  render(elapsedTime = time += .016) {
    this.clear()
    this.drawWeapon(elapsedTime)
    this.drawTarget(elapsedTime)
  }
}

customElements.define('my-first-person', FPSRenderer, { extends: 'canvas' })
