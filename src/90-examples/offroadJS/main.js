/* global CANNON */
import * as THREE from '/node_modules/three127/build/three.module.js'

import heightMap from './data/terrainHeightMap.js'
import createVehicle from './vehicle.js'
import { cameraHelper } from './cameraHelper.js'
import { scene, renderer, camera } from '/utils/scene.js'
import { ambLight, createSunLight } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'

scene.background = new THREE.Color(0xbfd1e5)
ambLight({ intensity: .5 })
scene.add(createSunLight())

let pause = false

const world = new CANNON.World()
world.gravity.set(0, -10, 0)

const { mesh: terrain } = await loadModel('world/terrain.glb')
const { mesh: chassis } = await loadModel({ file: 'vehicle/jeep/scene.gltf' })
const { mesh: wheel } = await loadModel('vehicle/lowPoly_car_wheel.gltf')
chassis.scale.set(0.7, 0.7, 0.7)

chassis.traverse(child => {
  if (child.isMesh) child.material.color = new THREE.Color(0x4b5320)
})

// TODO: kako dodati teren u fiziku?
scene.add(terrain)
const heightField = generateTerrain()
world.addBody(heightField)

const meshes = {
  chassis,
  wheel_front_r: wheel,
  wheel_front_l: wheel.clone(),
  wheel_rear_r: wheel.clone(),
  wheel_rear_l: wheel.clone(),
}
meshes.wheel_front_r.scale.x *= -1
meshes.wheel_rear_r.scale.x *= -1

const vehicle = createVehicle()
vehicle.addToWorld(world, meshes)

for (const mesh in meshes) scene.add(meshes[mesh])

cameraHelper.init(camera, chassis)

resetVehicle()

/* FUNCTIONS */

function generateTerrain() {
  const material = new CANNON.Material('groundMaterial')
  const shape = new CANNON.Heightfield(heightMap, { elementSize: 1.475 })
  const terrain = new CANNON.Body({ mass: 0, shape, material })

  terrain.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
  terrain.position.set(-69.07913208007812, 0, 68.98860168457031)

  return terrain
}

function resetVehicle() {
  const position = new THREE.Vector3(70, 2, 60)
  const rotation = new THREE.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, -1, 0), -Math.PI / 2)
  vehicle.chassisBody.position.copy(position)
  vehicle.chassisBody.quaternion.copy(rotation)
  vehicle.chassisBody.velocity.set(0, 0, 0)
  vehicle.chassisBody.angularVelocity.set(0, 0, 0)
}

/* LOOP */

void function render() {
  requestAnimationFrame(render)
  if (pause) return

  world.step(1 / 60)
  cameraHelper.update()
  renderer.render(scene, camera)
}()

/* EVENTS */

window.addEventListener('keyup', e => {
  switch (e.key.toUpperCase()) {
    case 'C':
      cameraHelper.switch()
      break
    case 'P':
      pause = !pause
      break
    case 'R':
      resetVehicle()
      break
    case 'ESCAPE':
      document.getElementById('instructions-container').classList.toggle('hidden')
      break
  }
})
