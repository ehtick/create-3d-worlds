import CannonDebugRenderer from '/libs/cannonDebugRenderer.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { initLight } from '/utils/light.js'
import { world, createGround, createObstacles } from '/utils/physics-cannon.js'
import { createChaseCamera } from '/utils/helpers.js'
import Vehicle from '/utils/classes/Vehicle.js'

initLight()

const cannonDebugRenderer = new CannonDebugRenderer(scene, world)

const ground = createGround({ size: 100 })
const car = new Vehicle()
const obstacles = createObstacles()

const chaseCam = createChaseCamera(car.chassis)

const physicMeshes = [ground, ...car.meshes, ...obstacles]
physicMeshes.forEach(mesh => {
  scene.add(mesh)
  world.addBody(mesh.body)
})

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  world.step(clock.getDelta())
  car.update()
  chaseCam()
  // cannonDebugRenderer.update()
  renderer.render(scene, camera)
}()