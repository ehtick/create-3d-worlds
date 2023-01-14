import * as THREE from 'three'

export const simpleCurve = new THREE.SplineCurve([
  new THREE.Vector2(-12, 0),
  new THREE.Vector2(6, 12),
  new THREE.Vector2(-6, 12),
  new THREE.Vector2(-12, -12),
  new THREE.Vector2(-18, -6),
  new THREE.Vector2(-12, 0),
])

export function createPathVisual(curve) {
  const points = curve.getPoints(50)
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial({ color: 0x333333 })
  const mesh = new THREE.Line(geometry, material)
  mesh.rotation.x = Math.PI * .5
  mesh.position.y = 0.05
  return mesh
}
