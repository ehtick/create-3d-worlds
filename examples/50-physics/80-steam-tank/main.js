import * as THREE from 'three'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import PhysicsWorld from '/utils/classes/PhysicsWorld.js'
import { createSimpleVehicle, updateVehicle } from '/utils/vehicle-simple.js'
import { loadModel } from '/utils/loaders.js'
import { createGround } from '/utils/ground.js'
import { createBox, createCrates } from '/utils/geometry.js'
import VehicleCamera from '/utils/classes/VehicleCamera.js'

const world = new PhysicsWorld()
const cameraControls = new VehicleCamera({ camera })

const { Vector3 } = THREE

const ambientLight = new THREE.AmbientLight(0x404040)
scene.add(ambientLight)

const dirLight = new THREE.DirectionalLight(0xffffff, 1)
dirLight.position.set(10, 10, 5)
scene.add(dirLight)

const ground = createGround({ color: 0x509f53 })
world.add(ground, 0)

const quat = new THREE.Quaternion(0, 0, 0, 1)
quat.setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 18)

const jumpBoard = createBox({ width: 8, height: 4, depth: 10, pos: new Vector3(0, -1.5, 0), quat })
world.add(jumpBoard, 0)

createCrates({ z: 10 }).forEach(mesh => world.add(mesh))

const width = 1.8, height = .6, length = 4
const { mesh: carMesh } = await loadModel({ file: 'tank/steampunk/model.fbx', angle: Math.PI })

const { vehicle, wheels, body } = createSimpleVehicle({
  physicsWorld: world.physicsWorld, width, height, length, pos: new Vector3(0, 4, -20),
})

scene.add(carMesh) // , ...wheels

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const dt = clock.getDelta()
  updateVehicle({ vehicle, mesh: carMesh, wheels })
  cameraControls.update(carMesh)
  world.update(dt)
  renderer.render(scene, camera)
}()
