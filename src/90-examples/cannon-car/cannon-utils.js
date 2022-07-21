import * as THREE from '/node_modules/three127/build/three.module.js'
import * as CANNON from './cannon-es.js'
// import { scene } from '/utils/scene.js'

const phongMaterial = new THREE.MeshPhongMaterial()

export function createObstacles() {
  const obstacles = []
  for (let i = 0; i < 100; i++) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0, 1, 0.5, 5), phongMaterial)
    mesh.position.x = Math.random() * 100 - 50
    mesh.position.y = 0.5
    mesh.position.z = Math.random() * 100 - 50
    const cylinderShape = new CANNON.Cylinder(0.01, 1, 0.5, 5)
    const body = new CANNON.Body({ mass: 0 })
    body.addShape(cylinderShape, new CANNON.Vec3())
    body.position.x = mesh.position.x
    body.position.y = mesh.position.y
    body.position.z = mesh.position.z
    mesh.body = body
    obstacles.push(mesh)
  }
  return obstacles
}