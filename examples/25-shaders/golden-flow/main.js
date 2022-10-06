import * as THREE from 'three'
import { material, uniforms } from './shader.js'
import { scene, camera, renderer } from '/utils/scene.js'

scene.background = new THREE.Color(0x000000)
camera.position.y = 0

const geometry = new THREE.PlaneGeometry(5, 5)
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

/* LOOP */

void function loop(time) {
  requestAnimationFrame(loop)
  uniforms.iTime.value = time * 0.001
  renderer.render(scene, camera)
}()
