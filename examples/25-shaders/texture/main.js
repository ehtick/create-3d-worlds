// https://gamedevelopment.tutsplus.com/tutorials/a-beginners-guide-to-coding-graphics-shaders-part-3--cms-24351
import * as THREE from 'three'
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js'
import { camera, scene, renderer } from '/utils/scene.js'
import { material } from '/utils/shaders/texture.js'

camera.position.z = 2

const geometry = new THREE.BoxGeometry(1, 1, 1)
const cube = new THREE.Mesh(geometry, material)
scene.add(cube)

new OrbitControls(camera, renderer.domElement)

void function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}()