import * as THREE from 'three'
import { scene, camera, renderer } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'
import { createBox } from '/utils/geometry.js'
import { getHeightData } from '/utils/terrain/heightmap.js'

import CameraControls from './CameraControls.js'
import AmmoTerrain from './AmmoTerrain.js'
import AmmoWorld from './AmmoWorld.js'
import AmmoVehicle from './AmmoVehicle.js'
import AmmoBody from './AmmoBody.js'

camera.position.z = 10
scene.add(createSun())

const speedometer = document.getElementById('speedometer')
const cameraControls = new CameraControls(camera)
const ammoWorld = new AmmoWorld()

const { data, width, depth } = await getHeightData('/assets/heightmaps/wiki.png', 3)

const ammoTerrain = new AmmoTerrain({ data, width, depth })
ammoWorld.physicsWorld.addRigidBody(ammoTerrain.body)
scene.add(ammoTerrain.mesh)

const tremplinMesh = createTremplin()
tremplinMesh.position.set(-10, -7.5, 20)
scene.add(tremplinMesh)
const tremplin = new AmmoBody({ mesh: tremplinMesh, mass: 0 })
ammoWorld.add(tremplin)

// ball
const ballMesh = createBall()
ballMesh.position.set(5, 0, -20)
scene.add(ballMesh)

const ball = new AmmoBody({ mesh: ballMesh, mass: 30 })
ball.setFriction(0.9)
ball.setRestitution(0.95)
ammoWorld.add(ball)

// vehicle
const position = new THREE.Vector3(0, 5, 0)
const ammoVehicle = new AmmoVehicle(ammoWorld.physicsWorld, position)
scene.add(ammoVehicle.mesh)

const { mesh: bodyMesh } = await loadModel({ file: 'racing/hummer.obj', mtl: 'racing/hummer.mtl' })
const { mesh: tireMesh } = await loadModel({ file: 'racing/hummerTire.obj', mtl: 'racing/hummerTire.mtl' })

bodyMesh.position.y = 0.25
ammoVehicle.mesh.getObjectByName('chassis').add(bodyMesh)

for (let i = 0; i < 4; i++) {
  const wheelmesh = tireMesh.clone()
  if (i == 0 || i == 3) wheelmesh.quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI)
  ammoVehicle.mesh.getObjectByName('wheel_' + i).add(wheelmesh)
}

/* FUNCTIONS */

function createBall() {
  const geometry = new THREE.SphereGeometry(1, 32, 16)
  const material = new THREE.MeshPhongMaterial({ color: 0x333333 })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.castShadow = mesh.receiveShadow = true
  return mesh
}

function createTremplin() {
  const geometry = new THREE.BoxGeometry(8, 4, 15)
  const material = new THREE.MeshPhongMaterial({ color: 0xfffacd })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.rotateX(-Math.PI / 15)
  mesh.receiveShadow = true
  return mesh
}

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  ammoVehicle.updateKeyboard()
  cameraControls.update(ammoVehicle)
  ammoWorld.update()
  const speed = ammoVehicle.vehicle.getCurrentSpeedKmHour()
  speedometer.innerHTML = speed.toFixed(1) + ' km/h'
  renderer.render(scene, camera)
}()
