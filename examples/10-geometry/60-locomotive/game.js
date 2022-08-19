import * as THREE from 'three'
import { camera, scene, renderer, hemLight, createOrbitControls } from '/utils/scene.js'
import { createLocomotive } from '/utils/geometry/shapes.js'

createOrbitControls()
camera.position.set(0, 2, 6)

hemLight()

scene.background = new THREE.Color(0x8FBCD4)
scene.add(createLocomotive())

/* LOOP */

renderer.setAnimationLoop(() => {
  renderer.render(scene, camera)
})
