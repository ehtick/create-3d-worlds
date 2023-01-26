import * as THREE from 'three'
import { SteeringEntity } from '/libs/ThreeSteer.js'

import Player from '/utils/fsm/Player.js'
import { camera, scene, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { ambLight } from '/utils/light.js'
import { loadModel, loadRobotko } from '/utils/loaders.js'
import { robotkoAnimations } from '/data/animations.js'

const { randFloatSpread } = THREE.MathUtils

ambLight()

const controls = createOrbitControls()
camera.position.set(0, 10, 15)

const floor = createFloor({ size: 100 })
scene.add(floor)

const { mesh, animations } = await loadRobotko()
const player = new Player({ mesh, animations, dict: robotkoAnimations })
scene.add(mesh)

const { mesh: ghostMesh, mixer: ghostMixer } = await loadModel({ file: 'character/ghost/scene.gltf' })
const ghost = new SteeringEntity(ghostMesh)
ghost.maxSpeed = .05
ghost.position.set(randFloatSpread(50), 0, randFloatSpread(50))
scene.add(ghost)

const boundaries = new THREE.Box3(new THREE.Vector3(-50, 0, -50), new THREE.Vector3(50, 0, 50))

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()

  const distance = mesh.position.distanceTo(ghost.position)
  if (distance > .5) {
    ghost.flee(mesh.position)
    ghost.lookWhereGoing(true)
  } else {
    ghost.idle()
    ghost.lookAt(mesh.position)
  }

  ghost.bounce(boundaries)
  ghost.update()
  ghostMixer.update(delta)
  player.update(delta)
  controls.update()

  renderer.render(scene, camera)
}()