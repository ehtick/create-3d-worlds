import * as THREE from 'three'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import PhysicsWorld from '/utils/classes/PhysicsWorld.js'
import { createSimpleVehicle, updateVehicle } from '/utils/vehicle-simple.js'
import { loadModel } from '/utils/loaders.js'
import { createGround } from '/utils/ground.js'
import { createBox, createCrates } from '/utils/geometry.js'
import VehicleCamera from '/utils/classes/VehicleCamera.js'
import { createSun } from '/utils/light.js'

const world = new PhysicsWorld()
const cameraControls = new VehicleCamera({ camera })

const { Vector3 } = THREE

scene.add(createSun())

const ground = createGround({ color: 0x509f53 })
world.add(ground, 0)

const quat = new THREE.Quaternion(0, 0, 0, 1)
quat.setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 18)

const jumpBoard = createBox({ width: 8, height: 4, depth: 10, pos: new Vector3(0, -1.5, 0), quat })
world.add(jumpBoard, 0)

createCrates({ z: 10 }).forEach(mesh => world.add(mesh))

const width = 1.8, height = .6, length = 4
const { mesh: carMesh } = await loadModel({ file: 'tank/steampunk/model.fbx', angle: Math.PI })

const { vehicle, wheelMeshes } = createSimpleVehicle({
  physicsWorld: world.physicsWorld, width, height, length, position: new Vector3(0, 4, -20),
})

scene.add(carMesh) // , ...wheelMeshes

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const dt = clock.getDelta()
  updateVehicle({ vehicle, mesh: carMesh, wheelMeshes })
  world.update(dt)
  cameraControls.update(carMesh)
  renderer.render(scene, camera)
}()
