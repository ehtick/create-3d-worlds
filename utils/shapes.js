import * as THREE from '/node_modules/three127/build/three.module.js'
import { DEGREE, RIGHT_ANGLE } from '/utils/constants.js'

/*  AIRPLANE */

export function createAirplane() {
  const airplane = new THREE.Object3D()
  const material = new THREE.MeshPhongMaterial({ shininess: 100 })

  const nose = new THREE.Mesh(new THREE.SphereGeometry(15, 32, 16), material)
  nose.rotation.x = RIGHT_ANGLE
  nose.scale.y = 3
  nose.position.y = 0
  nose.position.z = 70
  airplane.add(nose)

  const body = new THREE.Mesh(new THREE.CylinderGeometry(15, 15, 180, 32), material)
  body.rotation.x = RIGHT_ANGLE
  body.position.y = 0
  body.position.z = -20
  airplane.add(body)

  const wing = new THREE.Mesh(new THREE.CylinderGeometry(20, 20, 250, 32), material)
  wing.scale.x = 0.2
  wing.rotation.z = RIGHT_ANGLE
  wing.position.y = 5
  airplane.add(wing)

  const tailWing = new THREE.Mesh(new THREE.CylinderGeometry(15, 15, 100, 32), material)
  tailWing.scale.x = 0.2
  tailWing.rotation.z = RIGHT_ANGLE
  tailWing.position.y = 5
  tailWing.position.z = -90
  airplane.add(tailWing)

  const tail = new THREE.Mesh(new THREE.CylinderGeometry(10, 15, 40, 32), material)
  tail.scale.x = 0.15
  tail.rotation.x = -10 * DEGREE
  tail.position.y = 20
  tail.position.z = -96
  airplane.add(tail)
  return airplane
}

/*  LOCOMOTIVE */

export function createLocomotive() {
  const group = new THREE.Group()
  // materials
  const redMaterial = new THREE.MeshStandardMaterial({ color: 0xff1111 })
  const blackMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 })
  // geometries
  const noseGeo = new THREE.CylinderBufferGeometry(0.75, 0.75, 3, 12)
  const cabinGeo = new THREE.BoxBufferGeometry(2, 2.25, 1.5)
  const chimneyGeo = new THREE.CylinderBufferGeometry(0.3, 0.1, 0.5)
  const wheelGeo = new THREE.CylinderBufferGeometry(0.4, 0.4, 1.75, 16)
  wheelGeo.rotateX(RIGHT_ANGLE)
  // meshes
  const nose = new THREE.Mesh(noseGeo, redMaterial)
  nose.rotation.z = RIGHT_ANGLE
  nose.position.x = -1
  const cabin = new THREE.Mesh(cabinGeo, redMaterial)
  cabin.position.set(1.5, 0.4, 0)
  const chimney = new THREE.Mesh(chimneyGeo, blackMaterial)
  chimney.position.set(-2, 0.9, 0)
  const smallWheelRear = new THREE.Mesh(wheelGeo, blackMaterial)
  smallWheelRear.position.set(0, -0.5, 0)
  const smallWheelCenter = smallWheelRear.clone()
  smallWheelCenter.position.x = -1
  const smallWheelFront = smallWheelRear.clone()
  smallWheelFront.position.x = -2
  const bigWheel = smallWheelRear.clone()
  bigWheel.scale.set(2, 2, 1.25)
  bigWheel.position.set(1.5, -0.1, 0)
  group.add(nose, cabin, chimney, smallWheelRear, smallWheelCenter, smallWheelFront, bigWheel)
  return group
}

/*  CLOUD */

export function createCloud() {
  const group = new THREE.Group()
  const material = new THREE.MeshStandardMaterial({
    color: 0xacb3fb,
    roughness: 1,
    flatShading: true
  })

  const partGeometry = new THREE.IcosahedronGeometry(1, 0)
  const upperPart = new THREE.Mesh(partGeometry, material)
  upperPart.name = 'upperPart'
  group.add(upperPart)

  const leftPart = upperPart.clone()
  leftPart.position.set(-1.2, -0.3, 0)
  leftPart.scale.set(0.8, 0.8, 0.8)
  leftPart.name = 'leftPart'
  group.add(leftPart)

  const rightPart = leftPart.clone()
  rightPart.position.x = -leftPart.position.x
  rightPart.name = 'rightPart'
  group.add(rightPart)

  const frontPart = leftPart.clone()
  frontPart.position.set(0, -0.4, 0.9)
  frontPart.scale.set(0.7, 0.7, 0.7)
  frontPart.name = 'frontPart'
  group.add(frontPart)

  const backPart = frontPart.clone()
  backPart.position.z = -frontPart.position.z
  backPart.name = 'backPart'
  group.add(backPart)

  group.traverse(part => {
    part.castShadow = true
    part.receiveShadow = true
  })
  group.scale.set(1.5, 1.5, 1.5)
  return group
}

export function updateCloud(group, elapsedTime) {
  const time = elapsedTime * 2
  group.getObjectByName('upperPart').position.y = -Math.cos(time) * 0.12
  group.getObjectByName('leftPart').position.y = -Math.cos(time) * 0.1 - 0.3
  group.getObjectByName('rightPart').position.y = -Math.cos(time) * 0.1 - 0.3
  group.getObjectByName('frontPart').position.y = -Math.cos(time) * 0.08 - 0.3
  group.getObjectByName('backPart').position.y = -Math.cos(time) * 0.08 - 0.3
}