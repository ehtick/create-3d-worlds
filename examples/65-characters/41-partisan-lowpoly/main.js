import * as THREE from 'three'
import Player from '/utils/fsm/Player.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { loadModel } from '/utils/loaders.js'
import { partisanAnimations } from '/data/animations.js'

scene.add(createSun())

scene.add(createGround({ size: 100 }))

const { mesh, animations } = await loadModel({ file: 'model-lowpoly.fbx', angle: Math.PI, animNames: partisanAnimations, prefix: 'character/partisan/', fixColors: true })

const player = new Player({ mesh, animations, dict: partisanAnimations, useJoystick: true })

scene.add(mesh)

const controls = createOrbitControls()
controls.target = mesh.position

const { mesh: weapon } = await loadModel({ file: 'weapon/rifle.fbx', size: 25, angle: Math.PI })
scene.add(weapon)

let rightHand, leftHand

mesh.traverse(child => {
  if (child.name === 'mixamorigRightHand') rightHand = child
  if (child.name === 'mixamorigLeftHandMiddle1') leftHand = child
})

rightHand.add(weapon)
weapon.translateY(34)
weapon.translateZ(4)
weapon.rotateX(Math.PI * .25)
weapon.rotateZ(-Math.PI * .5)

/* LOOP */

const pos = new THREE.Vector3()

void function update() {
  requestAnimationFrame(update)
  const delta = clock.getDelta()
  player.update(delta)

  leftHand.getWorldPosition(pos)
  weapon.lookAt(pos)

  renderer.render(scene, camera)
}()
