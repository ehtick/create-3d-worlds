import * as THREE from 'three'
import { camera, scene, renderer } from '/utils/scene.js'
import { material } from '/utils/shaders/snow.js'

const geometry = new THREE.PlaneGeometry(2, 2)

const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

void function loop(delta) {
  requestAnimationFrame(loop)
  material.uniforms.u_time.value = delta * 0.0005
  renderer.render(scene, camera)
}()
