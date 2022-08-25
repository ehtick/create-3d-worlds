import * as THREE from 'three'
import Avatar from '/utils/classes/Avatar.js'
import ThirdPersonCamera from '/utils/classes/ThirdPersonCamera.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import keyboard from '/utils/classes/Keyboard.js'

initLights()
const controls = createOrbitControls()

scene.background = new THREE.Color(0x8FBCD4)
scene.add(createGround({ size: 100 }))

const player = new Avatar()
scene.add(player.mesh)

const thirdPersonCamera = new ThirdPersonCamera({ camera, mesh: player.mesh, offset: [0, 2, 3], lookAt: [0, 2, 0] })

/* LOOP */

void function update() {
  requestAnimationFrame(update)
  const delta = clock.getDelta()

  player.update(delta)

  if (keyboard.pressed.mouse)
    controls.target = player.mesh.position.clone().add(new THREE.Vector3(0, 2, 0))

  // TODO: dodati default kameru na avatara

  if (!keyboard.pressed.mouse) {
    thirdPersonCamera.currentPosition = camera.position.clone()
    thirdPersonCamera.update(delta)
  }
  renderer.render(scene, camera)
}()
