import * as CANNON from '/libs/cannon-es.js'
import { scene, camera, renderer } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import Car from './vehicle.js'
import { createFloor } from './utils.js'

initLights()
const world = new CANNON.World()
world.gravity.set(0, -10, 0)

const floor = createFloor()
scene.add(floor)
world.addBody(floor.body)

const car = new Car()
const { vehicle, chassis, wheelMeshes } = car
vehicle.addToWorld(world)

scene.add(chassis)
wheelMeshes.forEach(mesh => scene.add(mesh))

/** LOOP **/

void function render() {
  requestAnimationFrame(render)
  world.step(1 / 60)
  car.update()
  renderer.render(scene, camera)
}()
