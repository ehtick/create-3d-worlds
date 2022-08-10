import * as THREE from 'three'
import { camera, scene, renderer } from '/utils/scene.js'
import { material } from '/utils/shaders/primordial.js'

const geometry = new THREE.PlaneGeometry(2, 2)
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

const mouse = new THREE.Vector2()

document.onmousemove = function(e) {
  mouse.x = e.pageX
  mouse.y = e.pageY
}

void function animate() {
  requestAnimationFrame(animate)
  material.uniforms.u_time.value += 0.05 * (1 + mouse.x / 100)
  renderer.render(scene, camera)
}()