import * as THREE from 'three'
import { SteeringEntity } from '/libs/ThreeSteer.js'

import StateMachine from '/utils/fsm/StateMachine.js'
import { camera, scene, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createGround } from '/utils/ground.js'
import { ambLight } from '/utils/light.js'
import { loadModel, loadRobotko } from '/utils/loaders.js'
import { robotkoAnimations } from '/data/animations.js'

const { randFloatSpread } = THREE.MathUtils

ambLight()

const controls = createOrbitControls()
camera.position.set(0, 10, 15)

const floor = createGround({ size: 100 })
scene.add(floor)

const { mesh, animations } = await loadRobotko()
const player = new StateMachine({ mesh, animations, dict: robotkoAnimations })
scene.add(mesh)

const { mesh: ghostMesh, mixer: ghostMixer } = await loadModel({ file: 'character/ghost/scene.gltf' })
const ghost = new SteeringEntity(ghostMesh)
ghost.maxSpeed = .05
ghost.position.set(randFloatSpread(50), 0, randFloatSpread(50))
scene.add(ghost)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()

  const distance = mesh.position.distanceTo(ghost.position)
  if (distance > .5) {
    ghost.seek(mesh.position)
    ghost.lookWhereGoing(true)
  } else {
    ghost.idle()
    ghost.lookAt(mesh.position)
  }

  ghost.update()
  ghostMixer.update(delta)
  player.update(delta)
  controls.update()

  renderer.render(scene, camera)
}()