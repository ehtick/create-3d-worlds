import * as THREE from 'three'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import PhysicsWorld from '/utils/classes/PhysicsWorld.js'
import Vehicle from '/utils/VehicleSimple.js'
import { loadModel } from '/utils/loaders.js'
import { createGround } from '/utils/ground.js'
import { createBox, createCrates } from '/utils/geometry.js'
import VehicleCamera from '/utils/classes/VehicleCamera.js'
import { createSun } from '/utils/light.js'

const world = new PhysicsWorld()
const cameraControls = new VehicleCamera({ camera })

scene.add(createSun())

const ground = createGround({ color: 0x509f53 })
world.add(ground, 0)

const jumpBoard = createBox({ width: 8, height: 4, depth: 10, pos: new THREE.Vector3(0, -1.5, 0) })
jumpBoard.rotateX(-Math.PI / 18)
world.add(jumpBoard, 0)

createCrates({ z: 10 }).forEach(mesh => world.add(mesh))

/* VEHICLE */

const { mesh: chassisMesh } = await loadModel({ file: 'tank/steampunk/model.fbx', angle: Math.PI })
chassisMesh.position.set(0, 4, -20)

const wheelFront = { x: 1, y: .4, z: 1.7 }
const wheelBack = { x: 1, y: .4, z: -1 }

const tank = new Vehicle({ physicsWorld: world.physicsWorld, chassisMesh, wheelFront, wheelBack })

scene.add(chassisMesh, ...tank.wheelMeshes) // , ...wheelMeshes

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const dt = clock.getDelta()
  tank.update()
  world.update(dt)
  cameraControls.update(chassisMesh)
  renderer.render(scene, camera)
}()
