import * as THREE from 'three'
import { scene, camera, renderer } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'
import { getHeightData } from '/utils/terrain/heightmap.js'
import { createTerrain } from '/utils/physics.js'
import VehicleCamera from '/utils/classes/VehicleCamera.js'
import PhysicsWorld from '/utils/classes/PhysicsWorld.js'
import { createSphere } from '/utils/geometry.js'

import AmmoVehicle from '../75-vehicle-jerome/AmmoVehicle.js'

camera.position.z = 10
scene.add(createSun())

const speedometer = document.getElementById('speedometer')

const world = new PhysicsWorld()
const cameraControls = new VehicleCamera({ camera })

const { data, width, depth } = await getHeightData('/assets/heightmaps/wiki.png', 3)
const terrain = createTerrain({ data, width, depth })
world.add(terrain)

const tremplin = createTremplin()
tremplin.position.set(-10, -7.5, 20)
world.add(tremplin)

const ball = createSphere({ color: 0x333333 })
ball.position.set(5, 0, -20)
world.add(ball, 3000)

/* VEHICLE */

const position = new THREE.Vector3(0, 5, 0)
const ammoVehicle = new AmmoVehicle(world.physicsWorld, position)
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
  world.update()
  const speed = ammoVehicle.vehicle.getCurrentSpeedKmHour()
  speedometer.innerHTML = speed.toFixed(1) + ' km/h'
  renderer.render(scene, camera)
}()
