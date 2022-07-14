// https://2pha.com/demos/threejs/shaders/wood_grain.html
import * as THREE from '/node_modules/three127/build/three.module.js'
import { camera, scene, renderer } from '/utils/scene.js'

camera.position.z = 400
const uniforms = {
  scale: { type: 'f', value: 1.038 },
  frequency: { type: 'f', value: 7.6 },
  noiseScale: { type: 'f', value: 6.4 },
  ringScale: { type: 'f', value: 0.6 },
  color1: { type: 'c', value: new THREE.Color(0x703600) },
  color2: { type: 'c', value: new THREE.Color(0xea8021) }
}
const vertexShader = document.getElementById('vertexShader').text
const fragmentShader = document.getElementById('fragmentShader').text
const material = new THREE.ShaderMaterial(
  {
    uniforms,
    vertexShader,
    fragmentShader,
  })

const geometry = new THREE.BoxGeometry(200, 200, 200)
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

const light = new THREE.AmbientLight(0x404040)
scene.add(light)

const directionalLight = new THREE.DirectionalLight(0xffffff)
directionalLight.position.set(1, 1, 1).normalize()
scene.add(directionalLight)

void function animate() {
  requestAnimationFrame(animate)
  mesh.rotation.x += 0.005
  mesh.rotation.y += 0.01
  renderer.render(scene, camera)
}()