import * as THREE from 'three'
import { createGround } from '/utils/ground.js'
import { scene, renderer, camera, clock } from '/utils/scene.js'
import FPSRenderer from '/utils/classes/2d/FPSRenderer.js'
import Map2DRenderer from '/utils/classes/2d/Map2DRenderer.js'
import Savo from '/utils/fsm/Savo.js'
import Tilemap from '/utils/classes/Tilemap.js'
import { hemLight } from '/utils/light.js'
import { createRain, updateRain } from '/utils/particles.js'
import { nemesis } from '/data/maps.js'

hemLight()

camera.position.y = 2
camera.position.z = 1
const fpsRenderer = new FPSRenderer()

const matrix = nemesis
const tilemap = new Tilemap(matrix, 20)
const map2DRenderer = new Map2DRenderer(tilemap)

scene.add(createGround({ file: 'terrain/ground.jpg' }))
const walls = tilemap.meshFromMatrix()
scene.add(walls)

const player = new Savo()
const { x, z } = tilemap.randomEmptyPos

player.mesh.position.set(x, 0, z)
player.add(camera)
player.addSolids(walls)
scene.add(player.mesh)

const rain = createRain()
scene.add(rain)

const UNITSIZE = 15
const MOVESPEED = 10

const enemies = []

const textureLoader = new THREE.TextureLoader()

for (let i = 0; i < 5; i++) {
  const mesh = createEnemy(tilemap.randomEmptyPos)
  enemies.push(mesh)
  scene.add(mesh)
}

/* FUNCTIONS */

function createEnemy({ x, z, size = UNITSIZE * .2 }) {
  // TODO: reuse box
  const geometry = new THREE.BoxGeometry(size, size, size)
  const material = new THREE.MeshBasicMaterial({ map: textureLoader.load('images/face.png') })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(x, UNITSIZE * .1, z)
  mesh.pathPos = 1
  mesh.lastRandomX = Math.random()
  mesh.lastRandomZ = Math.random()
  mesh.lastShot = Date.now()
  return mesh
}

const moveEnemy = (enemy, delta) => {
  const speed = delta * MOVESPEED
  if (Math.random() > 0.995) {
    enemy.lastRandomX = Math.random() * 2 - 1
    enemy.lastRandomZ = Math.random() * 2 - 1
  }
  enemy.translateX(speed * enemy.lastRandomX)
  enemy.translateZ(speed * enemy.lastRandomZ)
}

function updateEnemies(delta) {
  enemies.forEach(enemy => moveEnemy(enemy, delta))
}

/* LOOP */

player.mesh.rotation.order = 'YZX'

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()
  const time = clock.getElapsedTime()

  player.update(delta)
  updateRain({ particles: rain, minY: 0, maxY: 200 })
  updateEnemies(delta)

  map2DRenderer.render({ ...player.position, angle: player.angle })
  fpsRenderer.render(time)
  renderer.render(scene, camera)
}()
