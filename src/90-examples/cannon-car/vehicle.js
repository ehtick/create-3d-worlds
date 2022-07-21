import * as THREE from '/node_modules/three127/build/three.module.js'
import * as CANNON from './cannon-es.js'

const phongMaterial = new THREE.MeshPhongMaterial()

export function createChassis() {
  const geometry = new THREE.BoxGeometry(1, 1, 2)
  const mesh = new THREE.Mesh(geometry, phongMaterial)
  mesh.position.y = 3
  mesh.castShadow = true
  const carBodyShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 1))
  const body = new CANNON.Body({ mass: 5 })
  body.addShape(carBodyShape)
  body.position.copy(mesh.position)
  mesh.body = body
  return mesh
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

export class Car {
  constructor() {
    this.chassis = createChassis()
    this.wheelLF = createFrontLeftWheel()
    this.wheelRF = createFrontRightWheel()
    this.wheelLB = createBackLeftWheel()
    this.wheelRB = createBackRightWheel()
    this.meshes = [this.chassis, this.wheelLF, this.wheelRF, this.wheelLB, this.wheelRB]
  }

  update() {
    this.meshes.forEach(mesh => {
      mesh.position.copy(mesh.body.position)
      mesh.quaternion.copy(mesh.body.quaternion)
    })
  }
}