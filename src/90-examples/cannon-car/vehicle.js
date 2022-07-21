import * as THREE from '/node_modules/three127/build/three.module.js'
import * as CANNON from './cannon-es.js'

const phongMaterial = new THREE.MeshPhongMaterial()

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

function createWheel({ size, width, position }) {
  const geometry = new THREE.CylinderGeometry(size, size, width)
  geometry.rotateZ(Math.PI / 2)
  const mesh = new THREE.Mesh(geometry, phongMaterial)
  mesh.castShadow = true
  mesh.position.set(...position)
  const shape = new CANNON.Sphere(size)
  const wheelMaterial = new CANNON.Material()
  wheelMaterial.friction = 0.25
  wheelMaterial.restitution = 0.25
  const body = new CANNON.Body({ mass: 1, material: wheelMaterial })
  body.addShape(shape)
  body.position.set(...position)
  mesh.body = body
  return mesh
}

export function createFrontLeftWheel() {
  return createWheel({ size: .33, width: .2, position: [-1, 3, -1] })
}

export function createFrontRightWheel() {
  return createWheel({ size: .33, width: .2, position: [1, 3, -1] })
}

export function createBackLeftWheel() {
  return createWheel({ size: .5, width: .33, position: [-1, 3, 1] })
}

export function createBackRightWheel() {
  return createWheel({ size: .5, width: .33, position: [1, 3, 1] })
}
