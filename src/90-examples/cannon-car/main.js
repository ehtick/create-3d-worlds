import * as CANNON from '/libs/cannon-es.js'
import CannonDebugRenderer from '/libs/cannonDebugRenderer.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import { createObstacles, createGround } from './utils.js'
import { createChaseCam, updateChaseCam } from './camera.js'
import { Car } from './vehicle.js'

initLights()

const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)
const cannonDebugRenderer = new CannonDebugRenderer(scene, world)

const ground = createGround({ size: 100 })
const car = new Car()
const obstacles = createObstacles()

const chaseCam = createChaseCam()
car.chassis.add(chaseCam)

;[ground, ...obstacles, ...car.meshes].forEach(mesh => {
  scene.add(mesh)
  world.addBody(mesh.body)
})

world.addConstraint(car.frontLeftWheel)
world.addConstraint(car.frontRightWheel)
world.addConstraint(car.backLeftWheel)
world.addConstraint(car.backRightWheel)

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