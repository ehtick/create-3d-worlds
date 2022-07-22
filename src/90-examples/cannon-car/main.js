import CannonDebugRenderer from '/libs/cannonDebugRenderer.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import { world, createGround, createObstacles } from '/utils/physics-cannon.js'
import { createChaseCam, updateChaseCam } from './camera.js'
import Vehicle from './Vehicle.js'

initLights()

const cannonDebugRenderer = new CannonDebugRenderer(scene, world)

const ground = createGround({ size: 100 })
const car = new Vehicle()
const obstacles = createObstacles()

const chaseCam = createChaseCam()
car.chassis.add(chaseCam)

;[ground, ...obstacles, ...car.meshes].forEach(mesh => {
  scene.add(mesh)
  world.addBody(mesh.body)
})

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()
  world.step(delta)

  car.update()
  updateChaseCam(chaseCam, car.chassis)
  // cannonDebugRenderer.update()

  renderer.render(scene, camera)
}()