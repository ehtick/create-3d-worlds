import * as THREE from '/node_modules/three127/build/three.module.js'
import * as CANNON from './cannon-es.js'

const phongMaterial = new THREE.MeshPhongMaterial()

const wheelMaterial = new CANNON.Material()
wheelMaterial.friction = 0.25
wheelMaterial.restitution = 0.25

export function createCar() {
  const carBodyGeometry = new THREE.BoxGeometry(1, 1, 2)
  const car = new THREE.Mesh(carBodyGeometry, phongMaterial)
  car.position.y = 3
  car.castShadow = true
  const carBodyShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 1))
  const body = new CANNON.Body({ mass: 1 })
  body.addShape(carBodyShape)
  body.position.x = car.position.x
  body.position.y = car.position.y
  body.position.z = car.position.z
  car.body = body
  return car
}

export function createFrontLeftWheel() {
  const geometry = new THREE.CylinderGeometry(0.33, 0.33, 0.2)
  geometry.rotateZ(Math.PI / 2)
  const mesh = new THREE.Mesh(geometry, phongMaterial)
  mesh.position.x = -1
  mesh.position.y = 3
  mesh.position.z = -1
  mesh.castShadow = true
  const wheelLFShape = new CANNON.Sphere(0.33)
  const body = new CANNON.Body({ mass: 1, material: wheelMaterial })
  body.addShape(wheelLFShape)
  body.position.x = mesh.position.x
  body.position.y = mesh.position.y
  body.position.z = mesh.position.z
  mesh.body = body
  return mesh
}

export function createFrontRightWheel() {
  const geometry = new THREE.CylinderGeometry(0.33, 0.33, 0.2)
  geometry.rotateZ(Math.PI / 2)
  const mesh = new THREE.Mesh(geometry, phongMaterial)
  mesh.position.y = 3
  mesh.position.x = 1
  mesh.position.z = -1
  mesh.castShadow = true
  const wheelRFShape = new CANNON.Sphere(0.33)
  const body = new CANNON.Body({ mass: 1, material: wheelMaterial })
  body.addShape(wheelRFShape)
  body.position.x = mesh.position.x
  body.position.y = mesh.position.y
  body.position.z = mesh.position.z
  mesh.body = body
  return mesh
}

export function createBackLeftWheel() {
  const geometry = new THREE.CylinderGeometry(0.4, 0.4, 0.33)
  geometry.rotateZ(Math.PI / 2)
  const mesh = new THREE.Mesh(geometry, phongMaterial)
  mesh.position.y = 3
  mesh.position.x = -1
  mesh.position.z = 1
  mesh.castShadow = true
  const wheelLBShape = new CANNON.Sphere(0.4)
  const body = new CANNON.Body({ mass: 1, material: wheelMaterial })
  body.addShape(wheelLBShape)
  body.position.x = mesh.position.x
  body.position.y = mesh.position.y
  body.position.z = mesh.position.z
  mesh.body = body
  return mesh
}

export function createBackRightWheel() {
  const geometry = new THREE.CylinderGeometry(0.4, 0.4, 0.33)
  geometry.rotateZ(Math.PI / 2)
  const mesh = new THREE.Mesh(geometry, phongMaterial)
  mesh.position.y = 3
  mesh.position.x = 1
  mesh.position.z = 1
  mesh.castShadow = true
  const wheelRBShape = new CANNON.Sphere(0.4)
  const body = new CANNON.Body({ mass: 1, material: wheelMaterial })
  body.addShape(wheelRBShape)
  body.position.x = mesh.position.x
  body.position.y = mesh.position.y
  body.position.z = mesh.position.z
  mesh.body = body
  return mesh
}
