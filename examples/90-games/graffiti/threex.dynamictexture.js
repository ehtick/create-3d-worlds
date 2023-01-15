// https://github.com/jeromeetienne/learningthreejs.com/blob/master/source/_posts/2014-05-02-easy-to-use-dynamic-texture-to-write-text-in-your-3d-object-with-threex-dot-dynamictexture-game-extensions-for-three-dot-js.markdown
import * as THREE from 'three'

const THREEx	= {}

THREEx.DynamicTexture	= function(width, height) {
  const canvas	= document.createElement('canvas')
  canvas.width	= width
  canvas.height	= height
  this.canvas	= canvas

  const context	= canvas.getContext('2d')
  this.context	= context

  const texture	= new THREE.Texture(canvas)
  this.texture	= texture
}

THREEx.DynamicTexture.prototype.clear = function(fillStyle) {
  // depends on fillStyle
  if (fillStyle !== undefined) {
    this.context.fillStyle	= fillStyle
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
  } else
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

  // make the texture as .needsUpdate
  this.texture.needsUpdate	= true
  // for chained API
  return this
}

/**
 * @param  {String}		text	- the text to display
 * @param  {Number|undefined}	x	- if provided, it is the x where to draw, if not, the text is centered
 * @param  {Number}		y	- the y where to draw the text
 * @param  {String*} 		fillStyle - the fillStyle to clear with, if not provided, fallback on .clearRect
 * @param  {String*} 		contextFont - the font to use
 */
THREEx.DynamicTexture.prototype.drawText = function(text, x, y, fillStyle, contextFont) {
  // set font if needed
  if (contextFont !== undefined)	this.context.font = contextFont
  // if x isnt provided
  if (x === undefined || x === null) {
    const textSize	= this.context.measureText(text)
    x = (this.canvas.width - textSize.width) / 2
  }
  this.context.fillStyle = fillStyle
  this.context.fillText(text, x, y)
  this.texture.needsUpdate	= true
  // for chained API
  return this
}

export default THREEx