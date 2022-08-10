import * as THREE from 'three'
import { Octree } from '/node_modules/three/examples/jsm/math/Octree.js'
import { scene, clock, camera, renderer } from '/utils/scene.js'
import { hemLight } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'
import FPSRenderer from '/utils/classes/2d/FPSRenderer.js'
import { handleInput, updatePlayer } from './player.js'
import { bullets, updateBullets } from './bullets.js'

camera.rotation.order = 'YXZ'
renderer.toneMapping = THREE.ACESFilmicToneMapping

hemLight({ intensity: 0.5, groundColor: 0x002244 })

bullets.forEach(bullet => scene.add(bullet.mesh))

const fpsRenderer = new FPSRenderer()

const world = new Octree()

const { mesh } = await loadModel({ file: 'world/collision-world.glb' })
mesh.material.map = null

world.fromGraphNode(mesh)
scene.add(mesh)

/* LOOP */

void function gameLoop() {
  const deltaTime = clock.getDelta()
  handleInput(deltaTime)
  updatePlayer(deltaTime, world)
  updateBullets(deltaTime, world)
  renderer.render(scene, camera)
  fpsRenderer.render(clock.getElapsedTime())
  requestAnimationFrame(gameLoop)
}()
