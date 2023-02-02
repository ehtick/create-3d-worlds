import * as THREE from 'three'
import { SteeringEntity } from '/libs/ThreeSteer.js'

import Player from '/utils/player/Player.js'
import { camera, scene, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { ambLight } from '/utils/light.js'
import { loadModel, loadRobotko } from '/utils/loaders.js'
import { robotkoAnimations } from '/data/animations.js'

const { randFloatSpread } = THREE.MathUtils

ambLight()
createOrbitControls()
camera.position.set(0, 10, 15)

const floor = createFloor({ size: 100 })
scene.add(floor)

const player = new Player({ ...await loadRobotko(), dict: robotkoAnimations })
scene.add(player.mesh)

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

  ghost.flee(player.position)
  ghost.lookWhereGoing(true)
  ghost.bounce(boundaries)
  ghost.update()

  ghostMixer.update(delta)
  player.update(delta)

  renderer.render(scene, camera)
}()