import matrix from '/data/small-map.js'
import Tilemap from '/utils/classes/Tilemap.js'
import Player2D from '/utils/classes/2d/Player2D.js'
import Map2DRenderer from '/utils/classes/2d/Map2DRenderer.js'

const tilemap = new Tilemap(matrix, 30)
const player = new Player2D(tilemap)
const mapRenderer = new Map2DRenderer(tilemap)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  player.update()
  mapRenderer.drawMap()
  mapRenderer.draw2DPlayer(player)
}()
