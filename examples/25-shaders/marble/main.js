import * as THREE from 'three'
import { camera, scene, renderer } from '/utils/scene.js'
import { material } from './marble.js'

const geometry = new THREE.PlaneGeometry(2, 2)

const plane = new THREE.Mesh(geometry, material)
scene.add(plane)

camera.position.set(0, 0, 1)

void function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}()