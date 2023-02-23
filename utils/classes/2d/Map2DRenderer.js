import Canvas from './Canvas.js'
import input from '../Input.js'
import { mapRange } from '/utils/helpers.js'

const CIRCLE = Math.PI * 2
const colors = ['#fff', '#444', '#701206', '#000']

function angleFrom(mesh) {
  mesh.rotation.order = 'YZX' // rotate y full circle
  return mapRange(-mesh.rotation.y, -Math.PI, Math.PI, 0, 2 * Math.PI) + Math.PI / 2
}

export default class Map2DRenderer extends Canvas {
  constructor(tilemap) {
    super()
    this.tilemap = tilemap
    this.matrix = tilemap.matrix
    this.cellSize = tilemap.cellSize
    this.mapSize = tilemap.mapSize
    this.width = this.height = this.matrix.length * this.cellSize
    this.initiallyRendered = false

    document.addEventListener('keypress', this.toggleMap.bind(this))
  }

  toggleMap(e) {
    if (e.code != 'KeyM') return
    this.style.display = this.style.display == 'none' ? 'block' : 'none'
  }

  drawRect(x, y, size, color) {
    this.ctx.fillStyle = color
    this.ctx.fillRect(x * size, y * size, size, size)
  }

  drawMap() {
    this.matrix.forEach((row, y) => row.forEach((val, x) =>
      this.drawRect(x, y, this.cellSize, colors[val])
    ))
  }

  drawCircle(x, y, radius = 5, color = '#f00') {
    this.ctx.fillStyle = color
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, CIRCLE)
    this.ctx.fill()
  }

  drawLamp(x, y, angle, radius = 5, color = '#ff0') {
    this.ctx.fillStyle = color
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, angle, angle)
    this.ctx.arc(x, y, radius * 3, angle - 0.15 * Math.PI, angle + 0.15 * Math.PI)
    this.ctx.fill()
  }

  drawIndicator(x, y, angle) {
    this.drawCircle(x, y)
    this.drawLamp(x, y, angle)
  }

  draw2DPlayer(player) {
    const x = player.x * player.map.cellSize
    const y = player.y * player.map.cellSize
    this.drawIndicator(x, y, player.angle)
  }

  drawMesh(mesh, tilemap = this.tilemap) {
    const pos = tilemap.getRelativePos(mesh.position)
    const x = pos.x * this.mapSize + this.cellSize * .5
    const y = pos.y * this.mapSize + this.cellSize * .5
    const angle = angleFrom(mesh)
    this.drawIndicator(x, y, angle)
  }

  render(mesh, tilemap = this.tilemap) {
    if (this.initiallyRendered && !input.controlsPressed) return
    this.drawMap()
    this.drawMesh(mesh, tilemap)
    this.initiallyRendered = true
  }
}

customElements.define('my-small-map', Map2DRenderer, { extends: 'canvas' })
