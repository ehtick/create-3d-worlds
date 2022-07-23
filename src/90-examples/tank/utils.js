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