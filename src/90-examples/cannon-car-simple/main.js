import * as THREE from '/node_modules/three127/build/three.module.js'
import * as CANNON from '/libs/cannon-es.js'
import { scene, camera, renderer } from '/utils/scene.js'
import CannonDebugRenderer from '/libs/cannonDebugRenderer.js'
import keyboard from '/classes/Keyboard.js'
import { initLights } from '/utils/light.js'
import { createVehicle } from './vehicle.js'

initLights()
const world = new CANNON.World()
world.broadphase = new CANNON.SAPBroadphase(world)
world.gravity.set(0, -10, 0)
world.defaultContactMaterial.friction = 0

let geometry = new THREE.PlaneGeometry(100, 100, 10)
let material = new THREE.MeshBasicMaterial({ color: 0x999999, side: THREE.DoubleSide })
const plane = new THREE.Mesh(geometry, material)
plane.rotation.x = Math.PI / 2
scene.add(plane)

const q = plane.quaternion
const planeBody = new CANNON.Body({
  mass: 0, // makes body static
  material: new CANNON.Material(),
  shape: new CANNON.Plane(),
  quaternion: new CANNON.Quaternion(-q._x, q._y, q._z, q._w)
})

world.addBody(planeBody)

// car
geometry = new THREE.BoxGeometry(2, 0.6, 4)
material = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide })

const { vehicle, chassis, chassisBody, wheelBodies, wheelVisuals } = createVehicle()
vehicle.addToWorld(world)
scene.add(chassis)
wheelVisuals.forEach(cylinder => scene.add(cylinder))

const cannonDebugRenderer = new CannonDebugRenderer(scene, world)

/** LOOP **/

world.addEventListener('postStep', () => {
  for (let i = 0; i < vehicle.wheelInfos.length; i++) {
    vehicle.updateWheelTransform(i)
    const t = vehicle.wheelInfos[i].worldTransform
    wheelBodies[i].position.copy(t.position)
    wheelBodies[i].quaternion.copy(t.quaternion)
    wheelVisuals[i].position.copy(t.position)
    wheelVisuals[i].quaternion.copy(t.quaternion)
  }
})

void function render() {
  requestAnimationFrame(render)
  cannonDebugRenderer.update()

  handleInput()
  world.step(1 / 60)
  chassis.position.copy(chassisBody.position)
  chassis.quaternion.copy(chassisBody.quaternion)

  renderer.render(scene, camera)
}()

/* INPUT */

function handleInput() {
  const brakeForce = keyboard.pressed.Space ? 10 : 0
  const engineForce = 800
  const maxSteerVal = 0.5

  if (!keyboard.keyPressed) {
    vehicle.applyEngineForce(0, 1)
    vehicle.applyEngineForce(0, 1)
    return
  }

  vehicle.setBrake(brakeForce, 0)
  vehicle.setBrake(brakeForce, 1)
  vehicle.setBrake(brakeForce, 2)
  vehicle.setBrake(brakeForce, 3)

  if (keyboard.down) {
    vehicle.applyEngineForce(-engineForce, 0)
    vehicle.applyEngineForce(-engineForce, 1)
  }

  if (keyboard.up) {
    vehicle.applyEngineForce(engineForce, 0)
    vehicle.applyEngineForce(engineForce, 1)
  }

  if (keyboard.left) {
    vehicle.setSteeringValue(maxSteerVal, 0)
    vehicle.setSteeringValue(maxSteerVal, 1)
  }

  if (keyboard.right) {
    vehicle.setSteeringValue(-maxSteerVal, 0)
    vehicle.setSteeringValue(-maxSteerVal, 1)
  }
}
