import * as THREE from 'three'
import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'

scene.add(createSun())
createOrbitControls()

camera.position.set(1, 1, 1)
camera.lookAt(new THREE.Vector3(0, 0.4, 0))

const barrel = await loadModel({ file: 'item/barrel/scene.gltf', size: 1 })

scene.add(barrel.mesh)

void function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}()
