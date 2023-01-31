import { createGround } from '/utils/ground.js'
import { scene, renderer, camera, clock } from '/utils/scene.js'
import Map2DRenderer from '/utils/classes/2d/Map2DRenderer.js'
import Savo from '/utils/fsm/Savo.js'
import Tilemap from '/utils/classes/Tilemap.js'
import { hemLight, lightningStrike } from '/utils/light.js'
import { nemesis } from '/data/maps.js'
import Enemy from '/utils/classes/Enemy.js'
import { Rain } from '/utils/classes/Particles.js'

const light = hemLight()

const tilemap = new Tilemap(nemesis, 20)
const smallMapRenderer = new Map2DRenderer(tilemap)

scene.add(createGround({ file: 'terrain/ground.jpg' }))
const walls = tilemap.meshFromMatrix({ texture: 'terrain/concrete.jpg' })
scene.add(walls)

const enemies = []
for (let i = 0; i < 10; i++) {
  const enemy = new Enemy(tilemap.randomEmptyPos)
  enemies.push(enemy)
  scene.add(enemy.mesh)
}

const solids = [walls, ...enemies.map(e => e.mesh)]
const player = new Savo({ camera, solids })
player.position.copy(tilemap.randomEmptyPos)

const rain = new Rain()
scene.add(rain.particles)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()

  player.update(delta)
  enemies.forEach(enemy => enemy.update(delta))
  rain.update({ pos: player.position })

  if (Math.random() > .99) lightningStrike(light)

  smallMapRenderer.render(player)
  renderer.render(scene, camera)
}()

/* EVENTS */

