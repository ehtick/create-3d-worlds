import * as THREE from 'three'
import { scene, renderer, camera, clock, createOrbitControls } from '/utils/scene.js'
import THREEx from './threex.dynamictexture.js'

createOrbitControls()

const dynamicTexture	= new THREEx.DynamicTexture(512, 512)
dynamicTexture.context.font	= 'bolder 90px Verdana'

const geometry	= new THREE.BoxGeometry(1, 1, 1)
const material	= new THREE.MeshBasicMaterial({
  map: dynamicTexture.texture
})
const mesh	= new THREE.Mesh(geometry, material)
scene.add(mesh)

void function animate() {
  requestAnimationFrame(animate)

  dynamicTexture
    .clear('gray')
    .drawText('Zdravo Svete!', undefined, 256, 'black')

  renderer.render(scene, camera)
}()