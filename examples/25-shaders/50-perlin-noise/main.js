import * as THREE from 'three'
import { camera, scene, renderer } from '/utils/scene.js'
import { material } from '/utils/shaders/perlin.js'

camera.position.z = 400

// const geometry = new THREE.BoxGeometry(200, 200, 200, 20, 20, 20)
const geometry = new THREE.SphereGeometry(200, 20, 20)
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