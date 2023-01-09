import * as THREE from 'three'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import PhysicsWorld from '/utils/classes/PhysicsWorld.js'
import Vehicle from '/utils/classes/Vehicle.js'
import { loadModel } from '/utils/loaders.js'
import { createGround } from '/utils/ground.js'
import { createBox, createCrates, createWall } from '/utils/geometry.js'
import VehicleCamera from '/utils/classes/VehicleCamera.js'
import { createSun } from '/utils/light.js'
import { addTexture } from '/utils/helpers.js'

const world = new PhysicsWorld()
const cameraControls = new VehicleCamera({
  camera,
  offsetCamera: new THREE.Vector3(0, 2, -6),
  lookatCamera: new THREE.Vector3(0, 2, 4),
})

scene.add(createSun())

const ground = createGround({ color: 0x509f53 })
world.add(ground, 0)

const jumpBoard = createBox({ width: 8, height: 4, depth: 10, pos: new THREE.Vector3(0, -1.5, 0) })
jumpBoard.rotateX(-Math.PI / 18)
world.add(jumpBoard, 0)

createCrates({ z: 10 }).forEach(mesh => world.add(mesh))

createWall({ rows: 10, columns: 20, startX: 16 }).forEach(mesh => world.add(mesh))

/* VEHICLE */

// const wheelFront = { x: 1, y: .45, z: 1.7 }
// const wheelBack = { x: 1, y: .45, z: -1 }
// const { mesh: chassisMesh } = await loadModel({ file: 'tank/a7v/model.fbx', angle: Math.PI })

const wheelFront = { x: 1, y: .1, z: 1.7 }
const wheelBack = { x: 1, y: .1, z: -1 }
const { mesh: chassisMesh } = await loadModel({ file: 'tank/t-50/model.fbx' })
addTexture({ mesh: chassisMesh, file: 'metal/metal01.jpg' })

chassisMesh.position.set(0, 2, -20)
const tank = new Vehicle({ physicsWorld: world.physicsWorld, chassisMesh, wheelFront, wheelBack, maxEngineForce: 1000 })

scene.add(chassisMesh)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const dt = clock.getDelta()
  tank.update()
  world.update(dt)
  cameraControls.update(chassisMesh)
  renderer.render(scene, camera)
}()
