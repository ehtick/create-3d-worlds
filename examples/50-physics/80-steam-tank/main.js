import * as THREE from 'three'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { Ammo } from '/utils/physics.js'
import PhysicsWorld from '/utils/classes/PhysicsWorld.js'
import { createSimpleVehicle, updateVehicle } from '/utils/vehicle-simple.js'
import { loadModel } from '/utils/loaders.js'
import { createGround } from '/utils/ground.js'
import { createBox, createCrates } from '/utils/geometry.js'

const world = new PhysicsWorld()

function chaseCam({ body, camHeight = 4, distance = 8, camera } = {}) {
  const row = n => body.getWorldTransform().getBasis().getRow(n)
  const dist = new Ammo.btVector3(0, camHeight, -distance)
  const camPointer = new Ammo.btVector3(
    row(0).x() * dist.x() + row(0).y() * dist.y() + row(0).z() * dist.z(),
    row(1).x() * dist.x() + row(1).y() * dist.y() + row(1).z() * dist.z(),
    row(2).x() * dist.x() + row(2).y() * dist.y() + row(2).z() * dist.z()
  )

  const target = body.getWorldTransform().getOrigin()
  camera.position.set(
    camPointer.x() + target.x(),
    camPointer.y() + target.y(),
    camPointer.z() + target.z()
  )
  camera.lookAt(new THREE.Vector3(target.x(), target.y(), target.z()))
}

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

camera.position.set(0, 5, -4)

const lookAt = new Vector3(carMesh.position.x, carMesh.position.y, carMesh.position.z + 4)
camera.lookAt(lookAt)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const dt = clock.getDelta()
  updateVehicle({ vehicle, mesh: carMesh, wheels })
  chaseCam({ camera, body })
  world.update(dt)
  renderer.render(scene, camera)
}()
