import { createGround } from '/utils/ground.js'
import { scene, renderer, camera, clock } from '/utils/scene.js'
import Map2DRenderer from '/utils/classes/2d/Map2DRenderer.js'
import Savo from '/utils/fsm/Savo.js'
import Tilemap from '/utils/classes/Tilemap.js'
import { hemLight, lightningStrike } from '/utils/light.js'
import { nemesis } from '/data/maps.js'
import Enemy from '/utils/classes/Enemy.js'
import { getCameraIntersects } from '/utils/helpers.js'
import Particles, { Rain } from '/utils/classes/Particles.js'
import { shootDecals } from '/utils/decals.js'

const light = hemLight()

const tilemap = new Tilemap(nemesis, 20)
const smallMapRenderer = new Map2DRenderer(tilemap)

scene.add(createGround({ file: 'terrain/ground.jpg' }))
const walls = tilemap.meshFromMatrix({ texture: 'terrain/concrete.jpg' })
scene.add(walls)

const player = new Savo({ camera })
player.position.copy(tilemap.randomEmptyPos)
player.addSolids(walls)
scene.add(player.mesh)

const rain = new Rain()
scene.add(rain.particles)

const ricochet = new Particles({ num: 100, size: .05, unitAngle: 0.2 })
scene.add(ricochet.particles)

const enemies = []
for (let i = 0; i < 10; i++) {
  const enemy = new Enemy(tilemap.randomEmptyPos)
  enemies.push(enemy)
  scene.add(enemy.mesh)
}

const targets = [walls, ...enemies.map(e => e.mesh)]

function shoot() {
  const intersects = getCameraIntersects(camera, targets)
  if (!intersects.length) return
  const { point, object } = intersects[0]
  if (object.userData?.tag == 'enemy') return

  ricochet.reset({ pos: point, unitAngle: 0.2 })
  shootDecals(intersects[0])
}

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()

  player.update(delta)
  enemies.forEach(enemy => enemy.update(delta))
  rain.update({ pos: player.position })
  ricochet.expand({ scalar: 1.2, maxRounds: 5, gravity: .02 })

  if (Math.random() > .99) lightningStrike(light)

  smallMapRenderer.render(player)
  renderer.render(scene, camera)
}()

/* EVENTS */

document.body.addEventListener('click', shoot)
