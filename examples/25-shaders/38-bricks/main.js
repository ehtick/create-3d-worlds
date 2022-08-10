import * as THREE from 'three'
import { camera, scene, renderer } from '/utils/scene.js'
import { material } from '/utils/shaders/bricks.js'

camera.position.set(0, 0, 2)

const geometry = new THREE.BoxGeometry()
const box = new THREE.Mesh(geometry, material)
scene.add(box)

const light = new THREE.AmbientLight(0x404040)
scene.add(light)

void function animate() {
  requestAnimationFrame(animate)
  box.rotation.x += 0.005
  box.rotation.y += 0.01
  renderer.render(scene, camera)
}()