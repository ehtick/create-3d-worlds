import * as THREE from 'three'
import { DecalGeometry } from '/node_modules/three/examples/jsm/geometries/DecalGeometry.js'
import { createGround } from '/utils/ground.js'
import { scene, renderer, camera, clock } from '/utils/scene.js'
import Map2DRenderer from '/utils/classes/2d/Map2DRenderer.js'
import Savo from '/utils/fsm/Savo.js'
import Tilemap from '/utils/classes/Tilemap.js'
import { hemLight } from '/utils/light.js'
import { nemesis } from '/data/maps.js'
import Enemy from '/utils/classes/Enemy.js'
import { getCameraIntersects } from '/utils/helpers.js'
import Particles, { Rain } from '/utils/classes/Particles.js'

hemLight()
const mouseHelper = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 10), new THREE.MeshNormalMaterial())
mouseHelper.visible = false
scene.add(mouseHelper)

const tilemap = new Tilemap(nemesis, 20)
const smallMapRenderer = new Map2DRenderer(tilemap)

scene.add(createGround({ file: 'terrain/ground.jpg' }))
const walls = tilemap.meshFromMatrix()
scene.add(walls)

const player = new Savo({ camera })
player.position.copy(tilemap.randomEmptyPos)
player.addSolids(walls)
scene.add(player.mesh)

const rain = new Rain({ num: 10000 })
scene.add(rain.particles)

const ricochet = new Particles({ num: 100, size: .05, unitAngle: 0.2 })
scene.add(ricochet.particles)

const enemies = []
for (let i = 0; i < 5; i++) {
  const enemy = new Enemy(tilemap.randomEmptyPos)
  enemies.push(enemy)
  scene.add(enemy.mesh)
}

const targets = [walls, ...enemies.map(e => e.mesh)]

const textureLoader = new THREE.TextureLoader()

const decalMaterial = new THREE.MeshPhongMaterial({
  color: 0x000000,
  map: textureLoader.load('/assets/textures/decal-diffuse.png'),
  // normalMap: textureLoader.load('/assets/textures/decal-normal.jpg'),
  shininess: 900,
  transparent: true,
  depthTest: true,
  polygonOffset: true,
  polygonOffsetFactor: -4,
  opacity: .8
})

function shootDecals(intersect) {
  const { point, object } = intersect

  mouseHelper.position.copy(point)

  const normal = intersect.face.normal.clone()
  normal.transformDirection(object.matrixWorld)
  normal.multiplyScalar(10)
  normal.add(point)

  mouseHelper.lookAt(normal)

  const orientation = new THREE.Euler()
  const size = new THREE.Vector3(.2, .2, .2)
  orientation.copy(mouseHelper.rotation)
  orientation.z = Math.random() * 2 * Math.PI

  const geometry = new DecalGeometry(walls, point, orientation, size)
  const mesh = new THREE.Mesh(geometry, decalMaterial)
  scene.add(mesh)
}

function shoot() {
  const intersects = getCameraIntersects(camera, targets)
  if (!intersects.length) return

  const { point } = intersects[0]
  ricochet.reset({ pos: point, unitAngle: 0.2 })
  shootDecals(intersects[0])
}

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()

  player.update(delta)
  enemies.forEach(enemy => enemy.update(delta))
  rain.update({ minY: 0, maxY: 200, pos: player.position })
  ricochet.expand({ scalar: 1.2, maxRounds: 5, gravity: .02 })

  smallMapRenderer.render(player)
  renderer.render(scene, camera)
}()

/* EVENTS */

document.body.addEventListener('click', shoot)
