import * as THREE from 'three'

export function createPathVisual(curve) {
  const points = curve.getPoints(50)
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 })
  const splineObject = new THREE.Line(lineGeometry, lineMaterial)
  splineObject.rotation.x = Math.PI * .5
  splineObject.position.y = 0.05
  return splineObject
}

export const simplePath = new THREE.SplineCurve([
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