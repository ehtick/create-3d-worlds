import * as THREE from 'three'
import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import Graffiti from './Graffiti.js'

createOrbitControls()

const graffiti	= new Graffiti(512, 512)
graffiti.context.font	= 'bolder 90px Verdana'

const geometry	= new THREE.BoxGeometry(1, 1, 1)
const material	= new THREE.MeshBasicMaterial({
  map: graffiti.texture
})
const mesh	= new THREE.Mesh(geometry, material)
scene.add(mesh)

graffiti
  .clear('gray')
  .drawText('Zdravo Svete!', undefined, 256, 'black')

void function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}()