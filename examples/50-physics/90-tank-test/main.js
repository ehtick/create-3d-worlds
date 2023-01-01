import { scene, camera, renderer, clock } from '/utils/scene.js'
import PhysicsWorld from '/utils/classes/PhysicsWorld.js'
import Vehicle from '/utils/classes/Vehicle.js'
import { loadModel } from '/utils/loaders.js'
import { createGround } from '/utils/ground.js'
import VehicleCamera from '/utils/classes/VehicleCamera.js'
import { createSun } from '/utils/light.js'

const world = new PhysicsWorld()
const cameraControls = new VehicleCamera({ camera })

scene.add(createSun())
world.add(createGround({ color: 0x509f53 }), 0)

/* VEHICLE */

const { mesh: chassisMesh } = await loadModel({ file: 'tank/steampunk/model.fbx', angle: Math.PI })
chassisMesh.position.set(0, 2, 0)

const tank = new Vehicle({ physicsWorld: world.physicsWorld, chassisMesh })

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
