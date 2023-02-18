import * as THREE from 'three'
import { scene, renderer, camera, clock, createSkyBox } from '/utils/scene.js'
import { createGround } from '/utils/ground.js'
import Map2DRenderer from '/utils/classes/2d/Map2DRenderer.js'
import Savo from '/utils/player/Savo.js'
import Tilemap from '/utils/classes/Tilemap.js'
import { hemLight, lightningStrike } from '/utils/light.js'
import { nemesis } from '/data/maps.js'
import { Rain } from '/utils/classes/Particles.js'
import AI from '/utils/player/AI.js'
import { loadZombieCop } from '/utils/loaders.js'

const light = hemLight()
scene.background = createSkyBox({ folder: 'skybox4' })

const tilemap = new Tilemap(nemesis, 20)
const smallMapRenderer = new Map2DRenderer(tilemap)

scene.add(createGround({ file: 'terrain/ground.jpg' }))
const walls = tilemap.meshFromMatrix({ texture: 'terrain/concrete.jpg' })
scene.add(walls)

const player = new Savo({ camera })
player.position.copy(tilemap.randomEmptyPos)

const { mesh, animations, animDict } = await loadZombieCop()

const enemies = []
for (let i = 0; i < 10; i++) {
  const enemy = new AI({ mesh, animations, animDict, basicState: 'wander', solids: walls, target: player.mesh })
  enemy.position.copy(tilemap.randomEmptyPos)
  enemies.push(enemy)
  scene.add(enemy.mesh)
  const box = new THREE.BoxHelper(enemy.mesh, 0xffff00)
  scene.add(box)
}

const solids = [walls, ...enemies.map(e => e.mesh)]
player.addSolids(solids)

const rain = new Rain()
// TODO: rain.audio.play() on click
scene.add(rain.particles)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()

  player.update(delta)
  enemies.forEach(enemy => enemy.update(delta))
  rain.update({ pos: player.position })

  if (Math.random() > .997) lightningStrike(light)

  smallMapRenderer.render(player.mesh)
  renderer.render(scene, camera)
}()
