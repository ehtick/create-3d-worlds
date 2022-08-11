import * as THREE from 'three'
import { camera, scene, renderer } from '/utils/scene.js'
import { material } from '/utils/shaders/primordial.js'

const geometry = new THREE.PlaneGeometry(2, 2)
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

let mouseX = window.innerWidth / 2

document.onmousemove = function(e) {
  mouseX = e.pageX
}

void function animate() {
  requestAnimationFrame(animate)
  material.uniforms.u_time.value += mouseX * 0.0005
  renderer.render(scene, camera)
}()