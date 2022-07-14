import * as THREE from '/node_modules/three127/build/three.module.js'
import { camera, scene, renderer } from '/utils/scene.js'
import { vertexShader, fragmentShader } from './shader.js'

const uniforms = {
  u_time: { type: 'f', value: 1.0 },
  u_resolution: { type: 'v2', value: new THREE.Vector2() },
}
uniforms.u_resolution.value.x = renderer.domElement.width
uniforms.u_resolution.value.y = renderer.domElement.height

const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader,
  fragmentShader
})
const geometry = new THREE.PlaneGeometry(2, 2)
const mesh = new THREE.Mesh(geometry, material)

scene.add(mesh)

void function animate(delta) {
  requestAnimationFrame(animate)
  uniforms.u_time.value = delta * 0.0005
  renderer.render(scene, camera)
}()
