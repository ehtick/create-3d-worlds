/* global THREE, CANNON */
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { createSunLight } from '/utils/light.js'
import JoyStick from './JoyStick.js'
import { createWorld, createVehicle, updateDrive, updateWheels } from './phy-utils.js'

const loader = new THREE.FBXLoader()
const world = createWorld()

const joystick = { forward: 0, turn: 0 }
const car = { chassis: null, wheel: [], selected: {} }
const checkpoints = []

let vehicle, assets

const click = new Audio('assets/sfx/click.mp3')
click.volume = 0.3

const engine = new Audio('assets/sfx/engine.mp3')
engine.loop = true
engine.volume = 0.1

const skid = new Audio('assets/sfx/skid.mp3')
skid.volume = 0.3

/* PRE-INIT */

camera.position.set(0, 6, -15)

const ambient = new THREE.AmbientLight(0xaaaaaa)
scene.add(ambient)

const followCam = new THREE.Object3D()
followCam.position.copy(camera.position)
scene.add(followCam)

const sun = createSunLight({ x: 30, y: 100, z: 40, color: 0xaaaaaa })
scene.add(sun)

loadAssets()

/* FUNCTIONS */

function startGame() {
  click.play()

  ;['car-parts', 'play-btn'].forEach(id => {
    document.getElementById(id).style.display = 'none'
  })
  document.getElementById('reset-btn').style.display = 'block'

  scene.add(assets)
  initPhysics()

  engine.play()
  new JoyStick({ onMove: joystickCallback })
  scene.background = new THREE.Color(0xbfd1e5)
}

const findNearestCheckpoint = () => {
  let nearest = checkpoints[0]
  let minDistance = Infinity
  const carPos = vehicle.chassisBody.position
  checkpoints.forEach(checkpoint => {
    const distance = checkpoint.position.distanceTo(carPos)
    if (distance < minDistance) {
      nearest = checkpoint
      minDistance = distance
    }
  })
  vehicle.chassisBody.position.copy(nearest.position)
  vehicle.chassisBody.quaternion.copy(nearest.quaternion)
}

function resetCar() {
  skid.play()
  findNearestCheckpoint()
  vehicle.chassisBody.velocity.set(0, 0, 0)
  vehicle.chassisBody.angularVelocity.set(0, 0, 0)
}

function loadAssets() {
  loader.load('/assets/models/runway/source/rc_time_trial.fbx', object => {
    object.traverse(child => {
      if (child.isMesh) {
        child.castShadow = child.receiveShadow = true
        if (child.name == 'Chassis') {
          car.chassis = child
          followCam.parent = child
          sun.target = child
        } else if (child.name.includes('Bonnet'))
          child.visible = false // if true looks armored
        else if (child.name.includes('Wheel') && child.children.length) {
          car.wheel.push(child)
          child.parent = scene
          child.visible = false
        } else if (child.name.includes('Xtra') || child.name.includes('Proxy'))
          child.visible = false
      } else
      if (child.name.includes('Checkpoint'))
        checkpoints.push(child)
    })
    customiseCar()
    assets = object
  })
}

function customiseCar() {
  car.selected.wheel = car.wheel[0]
  for (const x in car.selected) car.selected[x].visible = true
}

function initPhysics() {
  vehicle = createVehicle(car)
  vehicle.addToWorld(world)

  car.wheels.forEach(wheel => {
    scene.add(wheel.threemesh)
  })

  createColliders()
  world.addEventListener('postStep', () => updateWheels(vehicle, car))
}

function createColliders() {
  const scaleAdjust = .9
  const divisor = 2 / scaleAdjust
  assets.children.forEach(child => {
    if (!child.isMesh || !child.name.includes('Collider')) return
    child.visible = false
    const half = new CANNON.Vec3(child.scale.x / divisor, child.scale.y / divisor, child.scale.z / divisor)
    const box = new CANNON.Box(half)
    const body = new CANNON.Body({ mass: 0 })
    body.addShape(box)
    body.position.copy(child.position)
    body.quaternion.copy(child.quaternion)
    world.add(body)
  })
}

function joystickCallback(forward, turn) {
  joystick.forward = -forward
  joystick.turn = -turn
}

function updateCamera() {
  if (!followCam || !car.chassis) return
  camera.position.lerp(followCam.getWorldPosition(new THREE.Vector3()), 0.05)
  const { x, y, z } = car.chassis.position
  camera.lookAt(new THREE.Vector3(x, y + .3, z))

  sun.position.copy(camera.position)
  sun.position.y += 10
}

const updatePhysics = body => {
  if (!body.threemesh) return
  body.threemesh.position.copy(body.position)
  body.threemesh.quaternion.copy(body.quaternion)
}

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  engine.volume = Math.abs(joystick.forward) * 0.1
  if (vehicle) updateDrive(vehicle, joystick)

  const delta = clock.getDelta()
  world.step(1 / 60, delta, 10)
  world.bodies.forEach(updatePhysics)
  updateCamera()
  renderer.render(scene, camera)
}()

/* EVENTS */

document.getElementById('play-btn').addEventListener('click', startGame)

document.getElementById('reset-btn').addEventListener('click', resetCar)
