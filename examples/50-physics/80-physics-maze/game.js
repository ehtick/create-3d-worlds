import * as THREE from 'three'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { binaryTreeMatrix } from '/utils/mazes/algorithms.js'
import { createGround } from '/utils/ground.js'
import { hemLight } from '/utils/light.js'
import { createBox } from '/utils/geometry.js'
import VehicleCamera from '/utils/classes/VehicleCamera.js'
import PhysicsWorld from '/utils/classes/PhysicsWorld.js'
import Vehicle from '/utils/classes/Vehicle.js'
import { loadModel } from '/utils/loaders.js'

const { randInt } = THREE.MathUtils

const world = new PhysicsWorld()
const cameraControls = new VehicleCamera({ camera })

hemLight()

camera.position.set(0, 7, 10)

world.add(createGround({ file: 'terrain/ground.jpg', size: 100 }), 0)

const matrix = binaryTreeMatrix(10)
const meshes = meshFromMatrix({ matrix, texture: 'terrain/concrete.jpg' })
meshes.forEach(mesh => world.add(mesh))

const controls = createOrbitControls()

/* VEHICLE */

const { mesh: chassisMesh } = await loadModel({ file: 'vehicle/ready/humvee/hummer.obj', mtl: 'vehicle/ready/humvee/hummer.mtl' })
const { mesh: wheelMesh } = await loadModel({ file: 'vehicle/ready/humvee/hummerTire.obj', mtl: 'vehicle/ready/humvee/hummerTire.mtl' })

const tank = new Vehicle({ physicsWorld: world.physicsWorld, chassisMesh, wheelMesh })
scene.add(tank.mesh)

/* FUNCTIONS */

function meshFromMatrix({ matrix, size = 1 } = {}) {
  const meshes = []
  matrix.forEach((row, j) => row.forEach((val, i) => {
    if (!val) return
    const height = randInt(size, size * 4)
    const block = createBox({ size, height })
    block.position.set(i * size, height * .5, j * size)
    meshes.push(block)
  }))
  return meshes
}

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  controls.update()
  tank.update()
  cameraControls.update(tank.chassisMesh)
  const dt = clock.getDelta()
  world.update(dt)
  renderer.render(scene, camera)
}()
