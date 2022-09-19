import { Graphics } from './graphics.js'
import { createOrbitControls } from '/utils/scene.js'

export class Game {
  constructor() {
    this._Initialize()
  }

  _Initialize() {
    this._graphics = new Graphics(this)
    this._graphics.Initialize()
    this.controls = createOrbitControls()
    this._previousRAF = null

    this._OnInitialize()
    this._RAF()
  }

  _DisplayError(errorText) {
    const error = document.getElementById('error')
    error.innerText = errorText
  }

  _RAF() {
    requestAnimationFrame(t => {
      if (this._previousRAF === null)
        this._previousRAF = t

      this._Render(t - this._previousRAF)
      this._previousRAF = t
    })
  }

  _Render(timeInMS) {
    const timeInSeconds = timeInMS * 0.001
    this._OnStep(timeInSeconds)
    this._graphics.Render(timeInSeconds)
    this._RAF()
  }
}
