import * as THREE from '/node_modules/three127/build/three.module.js'

export function createPathVisual(curve) {
  const points = curve.getPoints(50)
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 })
  const splineObject = new THREE.Line(lineGeometry, lineMaterial)
  splineObject.rotation.x = Math.PI * .5
  splineObject.position.y = 0.05
  return splineObject
}

export function createTarget() {
  const targetGeometry = new THREE.SphereBufferGeometry(.5, 6, 3)
  const targetMaterial = new THREE.MeshPhongMaterial({ color: 0x00FF00, flatShading: true })
  const targetMesh = new THREE.Mesh(targetGeometry, targetMaterial)
  const targetOrbit = new THREE.Object3D()
  const targetElevation = new THREE.Object3D()
  targetMesh.castShadow = true
  targetOrbit.add(targetElevation)
  targetElevation.position.z = 16 // carLength * 2
  targetElevation.position.y = 8
  targetElevation.add(targetMesh)
  return { targetMesh, targetOrbit }
}

export const path = new THREE.SplineCurve([
  new THREE.Vector2(-10, 0),
  new THREE.Vector2(-5, 5),
  new THREE.Vector2(0, 0),
  new THREE.Vector2(5, -5),
  new THREE.Vector2(10, 0),
  new THREE.Vector2(5, 10),
  new THREE.Vector2(-5, 10),
  new THREE.Vector2(-10, -10),
  new THREE.Vector2(-15, -8),
  new THREE.Vector2(-10, 0),
])