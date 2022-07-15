import * as THREE from '/node_modules/three127/build/three.module.js'
import { camera, scene, renderer } from '/utils/scene.js'
import { material } from './shader.js'

const geometry = new THREE.PlaneGeometry(2, 2)
const mesh = new THREE.Mesh(geometry, material)

scene.add(mesh)

void function animate(delta) {
  requestAnimationFrame(animate)
  material.uniforms.u_time.value = delta * 0.0005
  renderer.render(scene, camera)
}()
