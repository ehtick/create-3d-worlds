import * as CANNON from '/libs/cannon-es.js'
import { scene, camera, renderer } from '/utils/scene.js'
import CannonDebugRenderer from '/libs/cannonDebugRenderer.js'
import { initLights } from '/utils/light.js'
import { createVehicle, handleInput } from './vehicle.js'
import { createFloor } from './utils.js'

initLights()
const world = new CANNON.World()
world.gravity.set(0, -10, 0)

const { mesh, body } = createFloor()
scene.add(mesh)
world.addBody(body)

const { vehicle, chassis, chassisBody, wheelBodies, wheelVisuals } = createVehicle()
vehicle.addToWorld(world)

scene.add(chassis)
wheelVisuals.forEach(cylinder => scene.add(cylinder))

const cannonDebugRenderer = new CannonDebugRenderer(scene, world)

/** LOOP **/

void function render() {
  requestAnimationFrame(render)
  world.step(1 / 60)
  cannonDebugRenderer.update()

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
