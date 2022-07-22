import * as CANNON from '/libs/cannon-es.js'
import { scene, camera, renderer } from '/utils/scene.js'
import { initLights } from '/utils/light.js'
import { createVehicle, createWheels, handleInput } from './vehicle.js'
import { createFloor } from './utils.js'

initLights()
const world = new CANNON.World()
world.gravity.set(0, -10, 0)

const floor = createFloor()
scene.add(floor)
world.addBody(floor.body)

const { vehicle, chassis, chassisBody } = createVehicle()
const { wheelBodies, wheelVisuals } = createWheels(vehicle)

vehicle.addToWorld(world)

scene.add(chassis)
wheelVisuals.forEach(cylinder => scene.add(cylinder))

/** LOOP **/

void function render() {
  requestAnimationFrame(render)
  world.step(1 / 60)

  handleInput(vehicle)

  vehicle.wheelInfos.forEach((wheel, i) => {
    const t = wheel.worldTransform
    wheelBodies[i].position.copy(t.position)
    wheelBodies[i].quaternion.copy(t.quaternion)
    wheelVisuals[i].position.copy(t.position)
    wheelVisuals[i].quaternion.copy(t.quaternion)
  })
  chassis.position.copy(chassisBody.position)
  chassis.quaternion.copy(chassisBody.quaternion)

  renderer.render(scene, camera)
}()
