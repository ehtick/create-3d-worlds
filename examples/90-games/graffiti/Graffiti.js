// https://github.com/jeromeetienne/learningthreejs.com/blob/master/source/_posts/2014-05-02-easy-to-use-dynamic-texture-to-write-text-in-your-3d-object-with-threex-dot-dynamictexture-game-extensions-for-three-dot-js.markdown
import * as THREE from 'three'

class Graffiti {
  constructor(width, height) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    this.canvas = canvas

    const context = canvas.getContext('2d')
    this.context = context

    const texture = new THREE.Texture(canvas)
    this.texture = texture
  }

  clear(fillStyle = 'gray') {
    this.context.fillStyle = fillStyle
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.texture.needsUpdate = true
    return this
  }

  getCenter(text) {
    return (this.canvas.width - this.context.measureText(text).width) / 2
  }

  drawText(text, x = this.getCenter(text), y, fillStyle, contextFont) {
    if (contextFont) this.context.font = contextFont

    this.context.fillStyle = fillStyle
    this.context.fillText(text, x, y)

    this.texture.needsUpdate = true
    return this
  }
}

export default Graffiti