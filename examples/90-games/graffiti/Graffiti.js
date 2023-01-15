import * as THREE from 'three'

export function createGraffitiTexture({
  width = 256, height = 256, background = 'gray', color = 'red', contextFont = 'bolder 16px Verdana', text = 'Punk is not dead!', x, y = height / 2
} = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  const texture = new THREE.Texture(canvas)

  context.fillStyle = background
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.font = contextFont
  context.fillStyle = color
  if (!x) x = (canvas.width - context.measureText(text).width) / 2
  context.fillText(text, x, y)

  texture.needsUpdate = true
  return texture
}
