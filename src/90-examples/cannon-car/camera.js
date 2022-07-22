import * as THREE from '/node_modules/three127/build/three.module.js'
import { camera } from '/utils/scene.js'

export function createChaseCam(mesh) {
  const chaseCam = new THREE.Object3D()
  chaseCam.position.set(0, 0, 0)
  const pivot = new THREE.Object3D()
  pivot.position.set(0, 2, 4)
  pivot.name = 'pivot'
  chaseCam.add(pivot)
  mesh.add(chaseCam)

  return function() {
    const v = new THREE.Vector3()
    camera.lookAt(mesh.position)
    pivot.getWorldPosition(v)
    if (v.y < 1) v.y = 1
    camera.position.lerpVectors(camera.position, v, 0.05)
  }
}
