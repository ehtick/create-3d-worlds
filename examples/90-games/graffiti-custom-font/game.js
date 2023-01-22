import * as THREE from 'three'
import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { createGraffitiTexture } from '/utils/city.js'

createOrbitControls()

await new Promise(resolve => window.addEventListener('load', resolve)) // window.onload

const geometry	= new THREE.BoxGeometry(2, 2, 2)
const material	= new THREE.MeshBasicMaterial({
  map: createGraffitiTexture({ background: '#dddddd', fontWeight: 'normal', fontSize: 24, fontFamily: 'Lobster', color: 'teal' })
})
const mesh	= new THREE.Mesh(geometry, material)
scene.add(mesh)

void function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}()