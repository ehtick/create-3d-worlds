// https://codepen.io/shubniggurath/pen/JMzQRw
import * as THREE from '/node_modules/three127/build/three.module.js'
import { camera, scene, renderer } from '/utils/scene.js'

const geometry = new THREE.PlaneBufferGeometry(2, 2)

const uniforms = {
  u_time: { type: 'f', value: 1.0 },
  u_resolution: { type: 'v2', value: new THREE.Vector2() },
}

const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: document.getElementById('vertexShader').textContent,
  fragmentShader: document.getElementById('fragmentShader').textContent })

const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

onWindowResize()

function onWindowResize() {
  uniforms.u_resolution.value.x = renderer.domElement.width
  uniforms.u_resolution.value.y = renderer.domElement.height
}

void function animate() {
  requestAnimationFrame(animate)
  uniforms.u_time.value += 0.05
  renderer.render(scene, camera)
}()

window.addEventListener('resize', onWindowResize, false)
