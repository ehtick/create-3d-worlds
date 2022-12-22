import * as THREE from 'three'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'
import { createBox, createSphere, createCrates } from '/utils/geometry.js'
import { createTerrain } from '/utils/physics.js'
import VehicleCamera from '/utils/classes/VehicleCamera.js'
import PhysicsWorld from '/utils/classes/PhysicsWorld.js'
import Vehicle from '/utils/classes/Vehicle.js'
import { generateSimplePlayground } from '/utils/terrain/utils.js'
import { leaveDecals, fadeDecals } from '/utils/decals.js'

scene.add(createSun())

const cameraControls = new VehicleCamera({ camera })
const world = new PhysicsWorld()

const width = 90, depth = 150, minHeight = 0, maxHeight = 24
const data = generateSimplePlayground(width, depth, minHeight, maxHeight)
const ground = createTerrain({ data, width, depth, minHeight, maxHeight })
world.add(ground)

const tremplin = createBox({ width: 8, height: 4, depth: 15, color: 0xfffacd })
tremplin.rotateX(-Math.PI / 15)
tremplin.position.set(-10, -tremplin.geometry.parameters.height / 2 + 1.5, 20)
world.add(tremplin, 0)

const ball = createSphere({ color: 0x333333 })
ball.position.set(5, 10, -10)
world.add(ball, 30)
ball.userData.body.setFriction(.9)
ball.userData.body.setRestitution(.95)

createCrates({ z: -10 }).forEach(mesh => world.add(mesh, 10))

/* VEHICLE */

const { mesh: chassisMesh } = await loadModel({ file: 'racing/hummer.obj', mtl: 'racing/hummer.mtl' })
const { mesh: wheelMesh } = await loadModel({ file: 'racing/hummerTire.obj', mtl: 'racing/hummerTire.mtl' })

const quaternion = new THREE.Quaternion(0, 0, 0, 1).setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)
const tank = new Vehicle({ physicsWorld: world.physicsWorld, chassisMesh, wheelMesh, position: new THREE.Vector3(0, 5, 0), quaternion })
scene.add(tank.mesh)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  tank.update()
  leaveDecals({ ground, scene, vehicle: tank.vehicle, body: tank.body, wheelMeshes: tank.wheelMeshes })
  fadeDecals(scene)
  cameraControls.update(tank.chassisMesh)
  const dt = clock.getDelta()
  world.update(dt)
  renderer.render(scene, camera)
}()
