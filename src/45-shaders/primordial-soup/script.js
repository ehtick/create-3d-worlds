import * as THREE from '/node_modules/three127/build/three.module.js'
import { camera, scene, renderer } from '/utils/scene.js'
import { vertexShader, fragmentShader } from './shader.js'

const uniforms = {
  u_time: { type: 'f', value: 2001.0 },
  u_resolution: { type: 'v2', value: new THREE.Vector2() },
  u_mouse: { type: 'v2', value: new THREE.Vector2() },
}

uniforms.u_resolution.value.x = renderer.domElement.width
uniforms.u_resolution.value.y = renderer.domElement.height

const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader
})

const geometry = new THREE.PlaneBufferGeometry(2, 2)
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

document.onmousemove = function (e) {
  uniforms.u_mouse.value.x = e.pageX
  uniforms.u_mouse.value.y = e.pageY
}

void function animate() {
  requestAnimationFrame(animate)
  uniforms.u_time.value += 0.05 * (1 + uniforms.u_mouse.value.x / 200)
  renderer.render(scene, camera)
}()