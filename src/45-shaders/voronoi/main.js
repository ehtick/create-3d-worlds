// https://2pha.com/demos/threejs/shaders/voronoi_with_borders.html
import * as THREE from '/node_modules/three127/build/three.module.js'
import { camera, scene, renderer } from '/utils/scene.js'
import { vertexShader, fragmentShader } from './shader.js'

camera.position.set(0, 0, 2)

const uniforms = {
  amount: { type: 'f', value: 1.0 },
  color: { type: 'c', value: new THREE.Color(0xffffff) },
  borderWidth: { type: 'f', value: 10.0 },
  borderColor: { type: 'c', value: new THREE.Color(0x000000) },
  blur: { type: 'f', value: 0.0 }
}

const material = new THREE.ShaderMaterial(
  {
    uniforms,
    vertexShader,
    fragmentShader,
  })

const geometry = new THREE.BoxGeometry()
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

const light = new THREE.AmbientLight(0x404040)
scene.add(light)

void function animate() {
  requestAnimationFrame(animate)
  mesh.rotation.x += 0.005
  mesh.rotation.y += 0.01
  renderer.render(scene, camera)
}()