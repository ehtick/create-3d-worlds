import * as THREE from 'three'
import { scene, camera, renderer } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'
import { createBox, createSphere, createCrates } from '/utils/geometry.js'
import { createTerrain } from '/utils/physics.js'
import VehicleCamera from '/utils/classes/VehicleCamera.js'
import PhysicsWorld from '/utils/classes/PhysicsWorld.js'

import AmmoVehicle from './AmmoVehicle.js'

camera.position.z = 10
scene.add(createSun())

const cameraControls = new VehicleCamera({ camera })
const world = new PhysicsWorld()

world.add(createTerrain())

const tremplin = createBox({ width: 8, height: 4, depth: 15, color: 0xfffacd })
tremplin.rotateX(-Math.PI / 15)
tremplin.position.set(-10, -tremplin.geometry.parameters.height / 2 + 1.5, 20)
world.add(tremplin)

const ball = createSphere({ color: 0x333333 })
ball.position.set(5, 10, -10)
world.add(ball, 30)
ball.userData.body.setFriction(.9)
ball.userData.body.setRestitution(.95)

createCrates({ z: -10 }).forEach(mesh => world.add(mesh, 10))

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

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  ammoVehicle.updateKeyboard()
  cameraControls.update(ammoVehicle)
  world.update()
  renderer.render(scene, camera)
}()
