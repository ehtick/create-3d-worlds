import { scene, camera, renderer } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'
import { getHeightData } from '/utils/terrain/heightmap.js'
import { createTerrain } from '/utils/physics.js'
import VehicleCamera from '/utils/classes/VehicleCamera.js'
import PhysicsWorld from '/utils/classes/PhysicsWorld.js'
import { createSphere, createBox } from '/utils/geometry.js'
import Vehicle from '/utils/classes/Vehicle.js'

camera.position.z = 10
scene.add(createSun())

const speedometer = document.getElementById('speedometer')

const world = new PhysicsWorld()
const cameraControls = new VehicleCamera({ camera })

const { data, width, depth } = await getHeightData('/assets/heightmaps/wiki.png', 3)
const terrain = createTerrain({ data, width, depth })
world.add(terrain)

const tremplin = createBox({ width: 8, height: 4, depth: 15, color: 0xfffacd })
tremplin.rotateX(-Math.PI / 15)
tremplin.position.set(-10, -7.5, 20)
world.add(tremplin)

const ball = createSphere({ color: 0x333333 })
ball.position.set(5, 0, -20)
world.add(ball, 3000)

/* VEHICLE */

const { mesh: chassisMesh } = await loadModel({ file: 'racing/hummer.obj', mtl: 'racing/hummer.mtl' })
const { mesh: wheelMesh } = await loadModel({ file: 'racing/hummerTire.obj', mtl: 'racing/hummerTire.mtl' })

const ammoVehicle = new Vehicle({ physicsWorld: world.physicsWorld, chassisMesh, wheelMesh })
scene.add(ammoVehicle.mesh)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  ammoVehicle.updateKeyboard()
  cameraControls.update(ammoVehicle.chassisMesh)
  world.update()
  const speed = ammoVehicle.vehicle.getCurrentSpeedKmHour()
  speedometer.innerHTML = speed.toFixed(1) + ' km/h'
  renderer.render(scene, camera)
}()
