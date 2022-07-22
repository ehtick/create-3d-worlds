import * as THREE from '/node_modules/three127/build/three.module.js'
import * as CANNON from '/libs/cannon-es.js'
import { scene, camera, renderer } from '/utils/scene.js'
import CannonDebugRenderer from '/libs/cannonDebugRenderer.js'
import keyboard from '/classes/Keyboard.js'
import { initLights } from '/utils/light.js'

// camera.position.set(0, 1, -10)
// camera.lookAt(0, 0, 0)

let geometry = new THREE.PlaneGeometry(100, 100, 10)
let material = new THREE.MeshBasicMaterial({ color: 0x999999, side: THREE.DoubleSide })
const plane = new THREE.Mesh(geometry, material)
plane.rotation.x = Math.PI / 2
scene.add(plane)

initLights()

const world = new CANNON.World()
world.broadphase = new CANNON.SAPBroadphase(world)
world.gravity.set(0, -10, 0)
world.defaultContactMaterial.friction = 0

const groundMaterial = new CANNON.Material()
const wheelMaterial = new CANNON.Material()
const wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
  friction: 0.3,
  restitution: 0,
  contactEquationStiffness: 1000,
})

world.addContactMaterial(wheelGroundContactMaterial)
const cannonDebugRenderer = new CannonDebugRenderer(scene, world)

// car
const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.3, 2))
const chassisBody = new CANNON.Body({ mass: 150 })
chassisBody.addShape(chassisShape)
chassisBody.position.set(0, 0.2, 0)
chassisBody.angularVelocity.set(0, 0, 0) // initial velocity

geometry = new THREE.BoxGeometry(2, 0.6, 4)
material = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide })
const chassis = new THREE.Mesh(geometry, material)
scene.add(chassis)

const vehicle = new CANNON.RaycastVehicle({
  chassisBody,
  indexRightAxis: 0, // x
  indexUpAxis: 1, // y
  indexForwardAxis: 2, // z
})

const wheelOptions = {
  radius: 0.3,
  directionLocal: new CANNON.Vec3(0, -1, 0),
  suspensionStiffness: 45,
  suspensionRestLength: 0.4,
  frictionSlip: 5,
  dampingRelaxation: 2.3,
  dampingCompression: 4.5,
  maxSuspensionForce: 200000,
  rollInfluence: 0.01,
  axleLocal: new CANNON.Vec3(-1, 0, 0),
  chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
  maxSuspensionTravel: 0.25,
  customSlidingRotationalSpeed: -30,
  useCustomSlidingRotationalSpeed: true,
}

const axlewidth = 0.7
wheelOptions.chassisConnectionPointLocal.set(axlewidth, 0, -1)
vehicle.addWheel(wheelOptions)

wheelOptions.chassisConnectionPointLocal.set(-axlewidth, 0, -1)
vehicle.addWheel(wheelOptions)

wheelOptions.chassisConnectionPointLocal.set(axlewidth, 0, 1)
vehicle.addWheel(wheelOptions)

wheelOptions.chassisConnectionPointLocal.set(-axlewidth, 0, 1)
vehicle.addWheel(wheelOptions)

vehicle.addToWorld(world)

const wheelBodies = [], wheelVisuals = []

vehicle.wheelInfos.forEach(wheel => {
  const shape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20)
  const body = new CANNON.Body({ mass: 1, material: wheelMaterial })
  const q = new CANNON.Quaternion()
  q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
  body.addShape(shape, new CANNON.Vec3(), q)
  wheelBodies.push(body)
  const geometry = new THREE.CylinderGeometry(wheel.radius, wheel.radius, 0.4, 32)
  const material = new THREE.MeshPhongMaterial({
    color: 0x444444,
    side: THREE.DoubleSide,
    flatShading: true,
  })
  const cylinder = new THREE.Mesh(geometry, material)
  cylinder.geometry.rotateZ(Math.PI / 2)
  wheelVisuals.push(cylinder)
  scene.add(cylinder)
})

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

const q = plane.quaternion
const planeBody = new CANNON.Body({
  mass: 0, // makes body static
  material: groundMaterial,
  shape: new CANNON.Plane(),
  quaternion: new CANNON.Quaternion(-q._x, q._y, q._z, q._w)
})

world.addBody(planeBody)

/** LOOP **/

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

void function render() {
  requestAnimationFrame(render)
  cannonDebugRenderer.update()

  handleInput()
  world.step(1 / 60)
  chassis.position.copy(chassisBody.position)
  chassis.quaternion.copy(chassisBody.quaternion)

  renderer.render(scene, camera)
}()
