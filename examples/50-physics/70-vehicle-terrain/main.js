import { scene, camera, renderer, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { loadModel } from '/utils/loaders.js'
import { getHeightData } from '/utils/terrain/heightmap.js'
import { createTerrain } from '/utils/physics.js'
import VehicleCamera from '/utils/classes/VehicleCamera.js'
import PhysicsWorld from '/utils/classes/PhysicsWorld.js'
import { createSphere, createBox } from '/utils/geometry.js'
import Vehicle from '/utils/classes/Vehicle.js'

scene.add(createSun({ sunColor: 0xB0E0E6 }))

const speedometer = document.getElementById('speedometer')

const world = new PhysicsWorld()
const cameraControls = new VehicleCamera({ camera })

const { data, width, depth } = await getHeightData('/assets/heightmaps/wiki.png', 3)
const terrain = createTerrain({ data, width, depth })
world.add(terrain)

const tremplin = createBox({ width: 8, height: 4, depth: 15, color: 0xfffacd })
tremplin.rotateX(-Math.PI / 15)
tremplin.position.set(-10, -7.5, 20)
world.add(tremplin, 0)

for (let i = 0; i < 3; i++) {
  const ball = createSphere({ color: 0x333333 })
  ball.position.set(5 * Math.random(), 0, -20 * Math.random())
  world.add(ball, 3000)
}

/* VEHICLE */

const { mesh: chassisMesh } = await loadModel({ file: 'vehicle/ready/humvee/hummer.obj', mtl: 'vehicle/ready/humvee/hummer.mtl' })
const { mesh: wheelMesh } = await loadModel({ file: 'vehicle/ready/humvee/hummerTire.obj', mtl: 'vehicle/ready/humvee/hummerTire.mtl' })

const tank = new Vehicle({ physicsWorld: world.physicsWorld, chassisMesh, wheelMesh })
scene.add(tank.mesh)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  tank.update()
  cameraControls.update(tank.chassisMesh)
  const dt = clock.getDelta()
  world.update(dt)
  const speed = tank.vehicle.getCurrentSpeedKmHour()
  speedometer.innerHTML = speed.toFixed(1) + ' km/h'
  renderer.render(scene, camera)
}()
