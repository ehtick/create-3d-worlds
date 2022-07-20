/* global THREE, CANNON */
// import * as THREE from '/node_modules/three127/build/three.module.js'
import JoyStick from '/classes/JoyStick.js'
import { createVisual } from './cannon-helpers.js'

let scene, camera, renderer, world, vehicle, dt, light, lightOffset

scene = new THREE.Scene()
scene.background = new THREE.Color(0xaaaaff)

camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(10, 10, 10)

const ambient = new THREE.HemisphereLight(0x555555, 0xFFFFFF)
scene.add(ambient)

light = new THREE.DirectionalLight(0xffffff, 0.5)
light.position.set(1, 1.25, 1.25)
scene.add(light)

renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

initPhysics()

new JoyStick({ onMove })

function onMove(forward, turn) {
  const maxSteerVal = 0.5
  const maxForce = 500
  const brakeForce = 5

  const force = maxForce * forward
  const steer = maxSteerVal * -turn

  if (forward != 0) {
    vehicle.setBrake(0, 0)
    vehicle.setBrake(0, 1)
    vehicle.setBrake(0, 2)
    vehicle.setBrake(0, 3)

    vehicle.applyEngineForce(force, 2)
    vehicle.applyEngineForce(force, 3)
  } else {
    vehicle.setBrake(brakeForce, 0)
    vehicle.setBrake(brakeForce, 1)
    vehicle.setBrake(brakeForce, 2)
    vehicle.setBrake(brakeForce, 3)
  }

  vehicle.setSteeringValue(steer, 0)
  vehicle.setSteeringValue(steer, 1)
}

function initPhysics() {
  world = new CANNON.World()

  dt = 1 / 60

  world.broadphase = new CANNON.SAPBroadphase(world)
  world.gravity.set(0, -10, 0)
  world.defaultContactMaterial.friction = 0

  const groundMaterial = new CANNON.Material('groundMaterial')
  const wheelMaterial = new CANNON.Material('wheelMaterial')
  const wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
    friction: 0.3,
    restitution: 0,
    contactEquationStiffness: 1000
  })

  world.addContactMaterial(wheelGroundContactMaterial)

  const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2))
  const chassisBody = new CANNON.Body({ mass: 150, material: groundMaterial })
  chassisBody.addShape(chassisShape)
  chassisBody.position.set(0, 4, 0)
  scene.add(createVisual(chassisBody, 0x0000aa, 'car'))
  light.target = chassisBody.threemesh
  lightOffset = chassisBody.threemesh.position.clone().sub(light.position)

  const options = {
    radius: 0.5,
    directionLocal: new CANNON.Vec3(0, -1, 0),
    suspensionStiffness: 30,
    suspensionRestLength: 0.8,
    frictionSlip: 1,
    dampingRelaxation: 2.3,
    dampingCompression: 4.4,
    maxSuspensionForce: 100000,
    rollInfluence: 0.01,
    axleLocal: new CANNON.Vec3(-1, 0, 0),
    chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
    maxSuspensionTravel: 0.3,
    customSlidingRotationalSpeed: 30,
    useCustomSlidingRotationalSpeed: true
  }

  vehicle = new CANNON.RaycastVehicle({
    chassisBody,
    indexRightAxis: 0,
    indexUpAxis: 1,
    indexForwardAxis: 2
  })

  options.chassisConnectionPointLocal.set(1, 0, -1)
  vehicle.addWheel(options)

  options.chassisConnectionPointLocal.set(-1, 0, -1)
  vehicle.addWheel(options)

  options.chassisConnectionPointLocal.set(1, 0, 1)
  vehicle.addWheel(options)

  options.chassisConnectionPointLocal.set(-1, 0, 1)
  vehicle.addWheel(options)

  vehicle.addToWorld(world)

  const wheelBodies = []
  vehicle.wheelInfos.forEach(wheel => {
    const cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20)
    const wheelBody = new CANNON.Body({ mass: 1, material: wheelMaterial })
    const q = new CANNON.Quaternion()
    q.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2)
    wheelBody.addShape(cylinderShape, new CANNON.Vec3(), q)
    wheelBodies.push(wheelBody)
    scene.add(createVisual(wheelBody, 0x111111, 'wheel'))
  })

  world.addEventListener('postStep', () => {
    vehicle.wheelInfos.forEach((wheel, i) => {
      vehicle.updateWheelTransform(i)
      const t = wheel.worldTransform
      wheelBodies[i].threemesh.position.copy(t.position)
      wheelBodies[i].threemesh.quaternion.copy(t.quaternion)
    })
  })

  const matrix = []
  const sizeX = 64, sizeY = 64

  for (let i = 0; i < sizeX; i++) {
    matrix.push([])
    for (let j = 0; j < sizeY; j++) {
      let height = Math.cos(i / sizeX * Math.PI * 5) * Math.cos(j / sizeY * Math.PI * 5) * 2 + 2
      if (i === 0 || i === sizeX - 1 || j === 0 || j === sizeY - 1)
        height = 3
      matrix[i].push(height)
    }
  }

  const hfShape = new CANNON.Heightfield(matrix, {
    elementSize: 100 / sizeX
  })
  const hfBody = new CANNON.Body({ mass: 0 })
  hfBody.addShape(hfShape)
  hfBody.position.set(-sizeX * hfShape.elementSize / 2, -4, sizeY * hfShape.elementSize / 2)
  hfBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
  world.add(hfBody)
  scene.add(createVisual(hfBody, 0x00aa00, 'landscape'))
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  world.step(dt)
  world.bodies.forEach(body => {
    if (!body.threemesh) return
    body.threemesh.position.copy(body.position)
    body.threemesh.quaternion.copy(body.quaternion)
  })
  camera.lookAt(vehicle.chassisBody.threemesh.position)
  renderer.render(scene, camera)
}()