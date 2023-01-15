import * as THREE from 'three'
import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { createGraffitiTexture } from './graffiti.js'

createOrbitControls()

const geometry	= new THREE.BoxGeometry(2, 2, 2)
const material	= new THREE.MeshBasicMaterial({
  map: createGraffitiTexture({ background: 'gray', color: 'red' })
})
const mesh	= new THREE.Mesh(geometry, material)
scene.add(mesh)

void function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}()