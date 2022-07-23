import * as THREE from '/node_modules/three127/build/three.module.js'
import { scene, renderer, camera, clock } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { createTank } from './tank.js'

const carWidth = 4
const carHeight = 1
const carLength = 8

function makeCamera(fov = 40) {
  const aspect = 2
  const zNear = 0.1
  const zFar = 1000
  return new THREE.PerspectiveCamera(fov, aspect, zNear, zFar)
}

camera.position.set(8, 4, 10).multiplyScalar(3)
camera.lookAt(0, 0, 0)

initLights()

scene.add(createGround({ size: 50 }))

const { tank, bodyMesh, turretMesh, wheelMeshes } = createTank()
scene.add(tank)

const tankCameraFov = 75
const tankCamera = makeCamera(tankCameraFov)
tankCamera.position.y = 3
tankCamera.position.z = -6
tankCamera.rotation.y = Math.PI
bodyMesh.add(tankCamera)

const turretPivot = new THREE.Object3D()
turretPivot.scale.set(5, 5, 5)
turretPivot.position.y = .5
turretPivot.add(turretMesh)
bodyMesh.add(turretPivot)

const turretCamera = makeCamera()
turretCamera.position.y = .75 * .2
turretMesh.add(turretCamera)

const targetGeometry = new THREE.SphereBufferGeometry(.5, 6, 3)
const targetMaterial = new THREE.MeshPhongMaterial({ color: 0x00FF00, flatShading: true })
const targetMesh = new THREE.Mesh(targetGeometry, targetMaterial)
const targetOrbit = new THREE.Object3D()
const targetElevation = new THREE.Object3D()
const targetBob = new THREE.Object3D()
targetMesh.castShadow = true
scene.add(targetOrbit)
targetOrbit.add(targetElevation)
targetElevation.position.z = carLength * 2
targetElevation.position.y = 8
targetElevation.add(targetBob)
targetBob.add(targetMesh)

const targetCamera = makeCamera()
const targetCameraPivot = new THREE.Object3D()
targetCamera.position.y = 1
targetCamera.position.z = -2
targetCamera.rotation.y = Math.PI
targetBob.add(targetCameraPivot)
targetCameraPivot.add(targetCamera)

const curve = new THREE.SplineCurve([
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

const points = curve.getPoints(50)
const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 })
const splineObject = new THREE.Line(lineGeometry, lineMaterial)
splineObject.rotation.x = Math.PI * .5
splineObject.position.y = 0.05
scene.add(splineObject)

const targetPosition = new THREE.Vector3()
const tankPosition = new THREE.Vector2()
const tankTarget = new THREE.Vector2()

/* LOOP */

void function loop() {
  const time = clock.getElapsedTime()

  // Move target
  targetOrbit.rotation.y = time * .27
  targetBob.position.y = Math.sin(time * 2) * 4
  targetMesh.rotation.x = time * 7
  targetMesh.rotation.y = time * 13
  targetMaterial.emissive.setHSL(time * 10 % 1, 1, .25)
  targetMaterial.color.setHSL(time * 10 % 1, 1, .25)

  // Move tank
  const tankTime = time * 0.05
  curve.getPointAt(tankTime % 1, tankPosition)
  curve.getPointAt((tankTime + 0.01) % 1, tankTarget)
  tank.position.set(tankPosition.x, 0, tankPosition.y)
  tank.lookAt(tankTarget.x, 0, tankTarget.y)

  // Face turret at the target
  targetMesh.getWorldPosition(targetPosition)
  turretPivot.lookAt(targetPosition)

  // turretCamera
  turretCamera.lookAt(targetPosition)

  // targetCameraPivot
  tank.getWorldPosition(targetPosition)
  targetCameraPivot.lookAt(targetPosition)

  // Rotate the wheels
  wheelMeshes.forEach(obj => {
    obj.rotation.x = time * 3
  })

  renderer.render(scene, camera)
  requestAnimationFrame(loop)
}()
