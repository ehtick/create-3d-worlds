// https://r105.threejsfundamentals.org/threejs/lessons/threejs-shadertoy.html
import * as THREE from 'three'
import { material, uniforms } from '/utils/shaders/lightning-led.js'
import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'

createOrbitControls()
scene.background = new THREE.Color(0x000000)

const geometry = new THREE.BoxGeometry()
const cube = new THREE.Mesh(geometry, material)
scene.add(cube)

/* LOOP */

void function loop(time) {
  requestAnimationFrame(loop)
  time *= 0.001

  uniforms.iTime.value = time
  renderer.render(scene, camera)
}()
