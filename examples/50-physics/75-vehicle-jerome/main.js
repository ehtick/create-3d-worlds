import * as THREE from 'three'
import { scene, camera, renderer } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'

import AmmoTerrain from './AmmoTerrain.js'
import CameraControls from './CameraControls.js'
import AmmoWorld from './AmmoWorld.js'
import AmmoVehicle from './AmmoVehicle.js'
import AmmoBody from './AmmoBody.js'

camera.position.z = 10
scene.add(createSun())

const speedometer = document.getElementById('speedometer')
const cameraControls = new CameraControls(camera)
const ammoWorld = new AmmoWorld()

// tremplin
const tremplinMesh = createTremplin()
tremplinMesh.position.set(-10, -tremplinMesh.geometry.parameters.height / 2 + 1.5, 20)
scene.add(tremplinMesh)

const tremplin = new AmmoBody(tremplinMesh, { mass: 0 })
ammoWorld.add(tremplin)

// ball
const ballMesh = createBall()
ballMesh.position.set(0, 5, -20)
scene.add(ballMesh)

const ball = new AmmoBody(ballMesh, { mass: 30 })
ball.setFriction(0.9)
ball.setRestitution(0.95)
ammoWorld.add(ball)

// crates
const size = new THREE.Vector3(8, 6, 1)
buildCrates(size)

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

function buildCrates(nCubes) {
  const boxGeometry = new THREE.BoxGeometry(0.75, 0.75, 0.75)
  const boxMaterial = new THREE.MeshPhongMaterial()
  const box = new THREE.Mesh(boxGeometry, boxMaterial)
  box.castShadow = box.receiveShadow = true

  for (let x = 0; x < nCubes.x; x++)
    for (let y = 0; y < nCubes.y; y++)
      for (let z = 0; z < nCubes.z; z++) {
        const mesh = box.clone()

        mesh.position.x = (x - nCubes.x / 2 + 0.5) * mesh.scale.x * boxGeometry.parameters.width
        mesh.position.y = (y - nCubes.y / 2 + 0.5) * mesh.scale.y * boxGeometry.parameters.height
        mesh.position.z = (z - nCubes.z / 2 + 0.5) * mesh.scale.z * boxGeometry.parameters.depth

        mesh.position.y += nCubes.y / 2 * mesh.scale.y * boxGeometry.parameters.height
        mesh.position.z += 6
        scene.add(mesh)

        const ammoBody = new AmmoBody(mesh)
        ammoWorld.add(ammoBody)
      }
}

// Heightfield parameters
const terrain3dWidth = 60
const terrain3dDepth = 120
const terrainWidth = 128 * 2
const terrainDepth = 256 * 2
const terrainMaxHeight = 24 * 2
const terrainMinHeight = 0

const ammoTerrain = new AmmoTerrain(terrainWidth, terrainDepth, terrainMinHeight, terrainMaxHeight, terrain3dWidth, terrain3dDepth)

ammoTerrain.body.setRestitution(0.9)
ammoWorld.physicsWorld.addRigidBody(ammoTerrain.body)
scene.add(ammoTerrain.mesh)

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
