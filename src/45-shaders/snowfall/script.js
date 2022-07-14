import * as THREE from '/node_modules/three127/build/three.module.js'
import { camera, scene, renderer } from '/utils/scene.js'

const loader = new THREE.TextureLoader()

const texture = await loader.loadAsync('noise.png')
texture.wrapS = THREE.RepeatWrapping
texture.wrapT = THREE.RepeatWrapping

const geometry = new THREE.PlaneBufferGeometry(2, 2)

const uniforms = {
  u_time: { type: 'f', value: 1.0 },
  u_resolution: { type: 'v2', value: new THREE.Vector2() },
  u_noise: { type: 't', value: texture },
}

uniforms.u_resolution.value.x = renderer.domElement.width
uniforms.u_resolution.value.y = renderer.domElement.height

const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: document.getElementById('vertexShader').textContent,
  fragmentShader: document.getElementById('fragmentShader').textContent })

material.extensions.derivatives = true

const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

void function animate(delta) {
  requestAnimationFrame(animate)
  uniforms.u_time.value = -10000 + delta * 0.0005
  renderer.render(scene, camera)
}()
