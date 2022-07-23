import * as THREE from '/node_modules/three127/build/three.module.js'

const carWidth = 4
const carHeight = 1
const carLength = 8

export function createTank() {
  const tank = new THREE.Object3D()

  const bodyGeometry = new THREE.BoxBufferGeometry(
    carWidth,
    carHeight,
    carLength
  )
  const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x6688aa })
  const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial)
  bodyMesh.position.y = 1.4
  bodyMesh.castShadow = true
  tank.add(bodyMesh)

  const wheelRadius = 1
  const wheelThickness = 0.5
  const wheelSegments = 6
  const wheelGeometry = new THREE.CylinderBufferGeometry(
    wheelRadius,
    wheelRadius,
    wheelThickness,
    wheelSegments
  )
  const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 })
  const wheelPositions = [
    [-carWidth / 2 - wheelThickness / 2, -carHeight / 2, carLength / 3],
    [carWidth / 2 + wheelThickness / 2, -carHeight / 2, carLength / 3],
    [-carWidth / 2 - wheelThickness / 2, -carHeight / 2, 0],
    [carWidth / 2 + wheelThickness / 2, -carHeight / 2, 0],
    [-carWidth / 2 - wheelThickness / 2, -carHeight / 2, -carLength / 3],
    [carWidth / 2 + wheelThickness / 2, -carHeight / 2, -carLength / 3]
  ]
  const wheelMeshes = wheelPositions.map(position => {
    const mesh = new THREE.Mesh(wheelGeometry, wheelMaterial)
    mesh.position.set(...position)
    mesh.rotation.z = Math.PI * 0.5
    mesh.castShadow = true

    bodyMesh.add(mesh)
    return mesh
  })

  const domeRadius = 2
  const domeWidthSubdivisions = 12
  const domeHeightSubdivisions = 12
  const domePhiStart = 0
  const domePhiEnd = Math.PI * 2
  const domeThetaStart = 0
  const domeThetaEnd = Math.PI * 0.5
  const domeGeometry = new THREE.SphereBufferGeometry(
    domeRadius,
    domeWidthSubdivisions,
    domeHeightSubdivisions,
    domePhiStart,
    domePhiEnd,
    domeThetaStart,
    domeThetaEnd
  )
  const domeMesh = new THREE.Mesh(domeGeometry, bodyMaterial)
  domeMesh.castShadow = true
  domeMesh.position.y = 0.5
  bodyMesh.add(domeMesh)

  const turretWidth = 0.1
  const turretHeight = 0.1
  const turretLength = carLength * 0.75 * 0.2
  const turretGeometry = new THREE.BoxBufferGeometry(
    turretWidth,
    turretHeight,
    turretLength
  )
  const turretMesh = new THREE.Mesh(turretGeometry, bodyMaterial)
  turretMesh.castShadow = true
  turretMesh.position.z = turretLength * .5

  return { tank, bodyMesh, turretMesh, wheelMeshes }
}