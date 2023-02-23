import { camera, scene, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { ambLight } from '/utils/light.js'
import { loadGolem, loadSorceress } from '/utils/loaders.js'
import { golemAnimation, sorceressAnimations } from '/data/animations.js'
import AI from '/utils/player/AI.js'
import Player from '/utils/player/Player.js'

const mapSize = 100
const npcs = []

ambLight()
camera.position.set(0, 10, 15)
createOrbitControls()

scene.add(createFloor({ size: mapSize }))

const player = new Player({ ...await loadSorceress(), animDict: sorceressAnimations })
scene.add(player.mesh)

const { mesh, animations } = await loadGolem()

for (let i = 0; i < 20; i++) {
  const ai = new AI({ mesh, animations, animDict: golemAnimation, mapSize, basicState: 'wander' })
  npcs.push(ai)
  scene.add(ai.mesh)
}

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()

  player.update()
  npcs.forEach(ai => ai.update(delta))

  renderer.render(scene, camera)
}()
