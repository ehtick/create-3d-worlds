import * as THREE from 'three'
import { scene, camera, renderer } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'
import { createBox } from '/utils/geometry.js'
import { createTerrain } from '/utils/physics.js'
import VehicleCamera from '/utils/classes/VehicleCamera.js'
import PhysicsWorld from '/utils/classes/PhysicsWorld.js'

import AmmoVehicle from './AmmoVehicle.js'

camera.position.z = 10
scene.add(createSun())

const cameraControls = new VehicleCamera({ camera })
const world = new PhysicsWorld()

world.add(createTerrain())

const tremplin = createTremplin()
tremplin.position.set(-10, -tremplin.geometry.parameters.height / 2 + 1.5, 20)
world.add(tremplin)

const ball = createBall()
ball.position.set(5, 10, -10)
world.add(ball, 30)
ball.userData.body.setFriction(.9)
ball.userData.body.setRestitution(.95)

buildCrates({ z: -10 })

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

function buildCrates({ width = 8, height = 6, depth = 2, boxSize = .75, x = 0, z = 0 } = {}) {
  const box = createBox({ size: boxSize })
  for (let w = 0; w < width; w++)
    for (let h = 0; h < height; h++)
      for (let d = 0; d < depth; d++) {
        const mesh = box.clone()

        mesh.position.x = (w - width / 2 + 0.5) * boxSize + x
        mesh.position.y = (h - height / 2 + 0.5) * boxSize
        mesh.position.z = (d - depth / 2 + 0.5) * boxSize + z

        mesh.position.y += height / 2 * boxSize
        mesh.position.z += 6

        world.add(mesh, 10)
      }
}

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  ammoVehicle.updateKeyboard()
  cameraControls.update(ammoVehicle)
  world.update()
  renderer.render(scene, camera)
}()
