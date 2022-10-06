// https://r105.threejsfundamentals.org/threejs/lessons/threejs-shadertoy.html
import * as THREE from 'three'
import { material, uniforms } from '../../../utils/shaders/lightning-led.js'
import { scene, camera, renderer } from '/utils/scene.js'

scene.background = new THREE.Color(0x000000)

function createCube() {
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const cube = new THREE.Mesh(geometry, material)
  return cube
}

const cube = createCube()
scene.add(cube)

/* LOOP */

void function loop(time) {
  requestAnimationFrame(loop)
  time *= 0.001

  const rot = time
  cube.rotation.x = rot
  cube.rotation.y = rot

  uniforms.iTime.value = time
  renderer.render(scene, camera)
}()
