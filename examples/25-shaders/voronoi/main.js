// https://2pha.com/demos/threejs/shaders/voronoi_with_borders.html
import * as THREE from 'three'
import { camera, scene, renderer } from '/utils/scene.js'
import { material } from '/utils/shaders/voronoi.js'

material.uniforms.color = { value: new THREE.Color(0xFFC00F) },

camera.position.set(0, 0, 2)

const geometry = new THREE.BoxGeometry()
const box = new THREE.Mesh(geometry, material)
scene.add(box)

const light = new THREE.AmbientLight(0x404040)
scene.add(light)

void function loop() {
  requestAnimationFrame(loop)
  box.rotation.x += 0.005
  box.rotation.y += 0.01
  renderer.render(scene, camera)
}()