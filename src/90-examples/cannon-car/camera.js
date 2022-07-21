import * as THREE from '/node_modules/three127/build/three.module.js'
import { camera } from '/utils/scene.js'

export function createChaseCam() {
  const chaseCam = new THREE.Object3D()
  chaseCam.position.set(0, 0, 0)
  const pivot = new THREE.Object3D()
  pivot.position.set(0, 2, 4)
  pivot.name = 'pivot'
  chaseCam.add(pivot)
  return chaseCam
}

export function updateChaseCam(chaseCam, car) {
  const v = new THREE.Vector3()
  const camPivot = chaseCam.getObjectByName('pivot')
  camera.lookAt(car.position)
  camPivot.getWorldPosition(v)
  if (v.y < 1) v.y = 1
  camera.position.lerpVectors(camera.position, v, 0.05)
}