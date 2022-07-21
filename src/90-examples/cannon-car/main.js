import * as CANNON from './cannon-es.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import { createObstacles, createGround } from './cannon-utils.js'
import { createChaseCam, updateChaseCam } from './camera.js'
import { Car } from './vehicle.js'

initLights()

const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)

const ground = createGround({ size: 100 })
const car = new Car()
const obstacles = createObstacles()

const chaseCam = createChaseCam()
// car.chassis.add(chaseCam)

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

  renderer.render(scene, camera)
}()