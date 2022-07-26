/*
* Singleton object for user input (including keyboard, touchscreen and mouse)
* see keycode.info
*/
let startX = null
let startY = null
const swipeThreshold = 5

class Keyboard {

  constructor() {
    this.pressed = {}
    this.capsLock = false

    this.SwipeX = 0
    this.SwipeY = 0

    document.addEventListener('keydown', e => {
      this.preventShake(e)
      this.pressed[e.code] = true
    })
    document.addEventListener('keyup', e => {
      this.pressed[e.code] = false
      this.capsLock = e.getModifierState('CapsLock')
    })

    document.addEventListener('pointerdown', e => {
      this.pressed.mouse = e.button === 0
      this.pressed.mouse2 = e.button === 2
      startX = e.pageX
      startY = e.pageY
    })
    document.addEventListener('pointerup', e => {
      if (e.button === 0) {
        this.pressed.mouse = false
        this.resetSwipe()
      }
      if (e.button === 2)
        this.pressed.mouse2 = false
    })
    document.addEventListener('pointermove', e => this.checkDirection(e))

    document.addEventListener('mousedown', e => {
      this.pressed.mouse = e.button === 0
      this.pressed.mouse2 = e.button === 2
      startX = e.pageX
      startY = e.pageY
    })
    document.addEventListener('mouseup', e => {
      if (e.button === 0) {
        this.pressed.mouse = false
        this.resetSwipe()
      }
      if (e.button === 2)
        this.pressed.mouse2 = false
    })
    document.addEventListener('mousemove', e => this.checkDirection(e))

    document.addEventListener('visibilitychange', () => this.reset())
    window.addEventListener('blur', () => this.reset())
  }

  checkDirection(e) {
    if (!this.pressed.mouse) return
    this.SwipeX = e.pageX - startX
    this.SwipeY = e.pageY - startY
  }

  resetSwipe() {
    this.SwipeX = this.SwipeY = 0
  }

  reset() {
    for (const key in this.pressed) this.pressed[key] = false
  }

  preventShake(e) {
    if (e.code == 'Space' || e.code.startsWith('Arrow')) e.preventDefault()
  }

  /* GETTERS */

  get up() {
    return this.pressed.ArrowUp || this.pressed.KeyW
  }

  get down() {
    return this.pressed.ArrowDown || this.pressed.KeyS
  }

  get left() {
    return this.pressed.ArrowLeft || this.pressed.KeyA
  }

  get right() {
    return this.pressed.ArrowRight || this.pressed.KeyD
  }

  get space() {
    return this.pressed.Space
  }

  get backspace() {
    return this.pressed.Backspace
  }

  get arrowPressed() {
    return this.pressed.ArrowRight || this.pressed.ArrowLeft || this.pressed.ArrowDown || this.pressed.ArrowUp
  }

  get controlsPressed() {
    return this.arrowPressed || this.pressed.KeyW || this.pressed.KeyA || this.pressed.KeyS || this.pressed.KeyD
  }

  get totalPressed() {
    return Object.values(this.pressed).filter(x => x).length
  }

  get keyPressed() {
    return this.totalPressed > 0
  }

  /* SWIPES */

  get swipeLeft() {
    return this.SwipeX < -swipeThreshold
  }

  get swipeRight() {
    return this.SwipeX > swipeThreshold
  }

  get swipeUp() {
    return this.SwipeY < -swipeThreshold
  }

  get swipeDown() {
    return this.SwipeY > swipeThreshold
  }

}

export default new Keyboard
