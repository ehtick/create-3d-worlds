import * as THREE from 'three'
import { camera, scene, renderer, createOrbitControls } from '/utils/scene.js'
import { material } from '/utils/shaders/bricks.js'

const controls = createOrbitControls()
camera.position.set(0, 0, 2)

const geometry = new THREE.BoxGeometry()
const box = new THREE.Mesh(geometry, material)
scene.add(box)

void function loop() {
  requestAnimationFrame(loop)
  controls.update()
  renderer.render(scene, camera)
}()