export default function Renderer() {
  const canvas = this.canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 600
  canvas.style.backgroundColor = 'black'
  document.body.appendChild(canvas)
  this.context = canvas.getContext('2d')

  this.clear = function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  this.draw = function(sprite) {
    const { context } = this
    context.save()

    context.translate(sprite.x, sprite.y)

	  context.drawImage(sprite.image,
      0 - (sprite.width / 2),
      0 - (sprite.height / 2),
      sprite.width, sprite.height)

    context.restore()
  }
}
