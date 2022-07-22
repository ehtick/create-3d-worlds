import * as THREE from '/node_modules/three127/build/three.module.js'
import * as CANNON from '/libs/cannon-es.js'

export function createFloor() {
  const geometry = new THREE.PlaneGeometry(100, 100, 10)
  const material = new THREE.MeshBasicMaterial({ color: 0x999999, side: THREE.DoubleSide })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotateX(-Math.PI * 0.5)

  const q = mesh.quaternion
  const body = new CANNON.Body({
    mass: 0, // makes body static
    material: new CANNON.Material(),
    shape: new CANNON.Plane(),
    quaternion: new CANNON.Quaternion(q._x, q._y, q._z, q._w)
  })

  return { mesh, body }
}
