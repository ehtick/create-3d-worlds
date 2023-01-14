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
  // mesh.position.y = 0.05
  return mesh
}

export function followPath({ path, mesh, elapsedTime, speedFactor = .05 }) {
  const currPosition = new THREE.Vector2()
  const nextPosition = new THREE.Vector2()

  const speed = elapsedTime * speedFactor

  path.getPointAt(speed % 1, currPosition)
  path.getPointAt((speed + 0.01) % 1, nextPosition)
  mesh.position.set(currPosition.x, 1, currPosition.y)
  mesh.lookAt(nextPosition.x, 1, nextPosition.y)
}

export function createEllipse({ xRadius, yRadius }) {
  const path = new THREE.EllipseCurve(0, 0, xRadius, yRadius, 0, 2 * Math.PI, false)
  const geometry = new THREE.BufferGeometry().setFromPoints(path.getPoints(256))
  const material = new THREE.LineBasicMaterial({ color: 0x333333 })
  const curve = new THREE.Line(geometry, material)
  curve.rotation.x = -Math.PI / 2
  curve.userData.path = path
  return curve
}
