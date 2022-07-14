import * as THREE from '/node_modules/three127/build/three.module.js'
import { camera, scene, renderer } from '/utils/scene.js'
import { material } from '/utils/shaders/wood.js'

camera.position.z = 400

const geometry = new THREE.BoxGeometry(200, 200, 200)
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

const light = new THREE.AmbientLight(0x404040)
scene.add(light)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  mesh.rotation.x += 0.005
  mesh.rotation.y += 0.01
  renderer.render(scene, camera)
}()