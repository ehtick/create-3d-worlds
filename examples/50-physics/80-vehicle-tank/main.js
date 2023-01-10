import * as THREE from 'three'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import PhysicsWorld from '/utils/classes/PhysicsWorld.js'
import Vehicle from '/utils/classes/Vehicle.js'
import VehicleCamera from '/utils/classes/VehicleCamera.js'
import { loadModel } from '/utils/loaders.js'
import { createGround } from '/utils/ground.js'
import { createJumpBoard, createCrates, createSimpleCastle, createCrate, createBarrel } from '/utils/geometry.js'
import { createSun } from '/utils/light.js'
import { addTexture, sample } from '/utils/helpers.js'
import { createMoon } from '/utils/geometry/planets.js'

const { randFloat } = THREE.MathUtils

const tankX = -20

const world = new PhysicsWorld()
const cameraControls = new VehicleCamera({ camera, offsetCamera: [0, 2, -6], lookatCamera: [0, 2, 4] })

scene.add(createSun())

const ground = createGround({ color: 0x509f53 })
world.add(ground, 0)

const jumpBoard = createJumpBoard()
jumpBoard.position.x = tankX
world.add(jumpBoard, 0)

createCrates({ x: tankX, z: 10 }).forEach(mesh => world.add(mesh))

createSimpleCastle({rows: 6, brickInWall: 15}).forEach(block => world.add(block, 5))

/* GEOMETRIES */

const createBall = () => createMoon({ r: .5 })
const createDarkBarrel = () => createBarrel({ file: 'barrel/metal-barrel-side.jpg', topFile: 'metal/metal01.jpg' })

const factories = [createBall, createCrate, createBarrel, createDarkBarrel]

for (let i = 0; i < 10; i++) {
  const mesh = sample(factories)()
  const x = randFloat(-10, -50)
  const z = randFloat(-20, 20)
  mesh.position.set(x, .5, z)
  world.add(mesh, 10)
}

/* VEHICLE */

const wheelFront = { x: .75, y: .1, z: .25 }
const wheelBack = { x: .75, y: .1, z: -.25 }
const { mesh: chassisMesh } = await loadModel({ file: 'tank/t-50/model.fbx' })
addTexture({ mesh: chassisMesh, file: 'metal/metal01.jpg' })

chassisMesh.position.set(tankX, 2, -20)
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
