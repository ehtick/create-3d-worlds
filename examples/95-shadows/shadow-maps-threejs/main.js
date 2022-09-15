import * as THREE from 'three'
import { scene, renderer, camera, clock } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { dirLight } from '/utils/light.js'
import StateMachine from '/utils/fsm/StateMachine.js'
import { loadSorceress } from '/utils/loaders.js'
import { sorceressAnimations } from '/data/animations.js'

function lightFollow(light, target, distance = [12, 8, 1]) {
  const newPos = new THREE.Vector3(...distance).add(target.position)
  light.position.copy(newPos)
}

const plane = createFloor()
scene.add(plane)

const { mesh, animations } = await loadSorceress()
const player = new StateMachine({ mesh, animations, dict: sorceressAnimations })
scene.add(mesh)

const light = dirLight({ intensity: 1.5, target: mesh })

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()
  lightFollow(light, mesh)
  player.update(delta)
  renderer.render(scene, camera)
}()
