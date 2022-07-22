let container = document.querySelector('body'),
  w = container.clientWidth,
  h = container.clientHeight,
  scene = new THREE.Scene(),
  camera = new THREE.PerspectiveCamera(75, w / h, 0.001, 100),
  renderConfig = { antialias: true, alpha: true },
  renderer = new THREE.WebGLRenderer(renderConfig)
camera.position.set(0, 1, -10)
camera.lookAt(0, 0, 0)
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(w, h)
container.appendChild(renderer.domElement)

window.addEventListener('resize', () => {
  w = container.clientWidth
  h = container.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
})

var geometry = new THREE.PlaneGeometry(10, 10, 10)
var material = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide })
const plane = new THREE.Mesh(geometry, material)
plane.rotation.x = Math.PI / 2
scene.add(plane)

const sunlight = new THREE.DirectionalLight(0xffffff, 1.0)
sunlight.position.set(-10, 10, 0)
scene.add(sunlight)

/**
* Physics
**/

const world = new CANNON.World()
world.broadphase = new CANNON.SAPBroadphase(world)
world.gravity.set(0, -10, 0)
world.defaultContactMaterial.friction = 0

const groundMaterial = new CANNON.Material('groundMaterial')
const wheelMaterial = new CANNON.Material('wheelMaterial')
const wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
  friction: 0.3,
  restitution: 0,
  contactEquationStiffness: 1000,
})

world.addContactMaterial(wheelGroundContactMaterial)

// car physics body
const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.3, 2))
const chassisBody = new CANNON.Body({ mass: 150 })
chassisBody.addShape(chassisShape)
chassisBody.position.set(0, 0.2, 0)
chassisBody.angularVelocity.set(0, 0, 0) // initial velocity

// car visual body
var geometry = new THREE.BoxGeometry(2, 0.6, 4) // double chasis shape
var material = new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide })
const box = new THREE.Mesh(geometry, material)
scene.add(box)

// parent vehicle object
const vehicle = new CANNON.RaycastVehicle({
  chassisBody,
  indexRightAxis: 0, // x
  indexUpAxis: 1, // y
  indexForwardAxis: 2, // z
})

// wheel options
const options = {
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
options.chassisConnectionPointLocal.set(axlewidth, 0, -1)
vehicle.addWheel(options)

options.chassisConnectionPointLocal.set(-axlewidth, 0, -1)
vehicle.addWheel(options)

options.chassisConnectionPointLocal.set(axlewidth, 0, 1)
vehicle.addWheel(options)

options.chassisConnectionPointLocal.set(-axlewidth, 0, 1)
vehicle.addWheel(options)

vehicle.addToWorld(world)

// car wheels
const wheelBodies = [],
  wheelVisuals = []
vehicle.wheelInfos.forEach(wheel => {
  const shape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20)
  const body = new CANNON.Body({ mass: 1, material: wheelMaterial })
  const q = new CANNON.Quaternion()
  q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
  body.addShape(shape, new CANNON.Vec3(), q)
  wheelBodies.push(body)
  // wheel visual body
  const geometry = new THREE.CylinderGeometry(wheel.radius, wheel.radius, 0.4, 32)
  const material = new THREE.MeshPhongMaterial({
    color: 0xd0901d,
    emissive: 0xaa0000,
    side: THREE.DoubleSide,
    flatShading: true,
  })
  const cylinder = new THREE.Mesh(geometry, material)
  cylinder.geometry.rotateZ(Math.PI / 2)
  wheelVisuals.push(cylinder)
  scene.add(cylinder)
})

// update the wheels to match the physics
world.addEventListener('postStep', () => {
  for (let i = 0; i < vehicle.wheelInfos.length; i++) {
    vehicle.updateWheelTransform(i)
    const t = vehicle.wheelInfos[i].worldTransform
    // update wheel physics
    wheelBodies[i].position.copy(t.position)
    wheelBodies[i].quaternion.copy(t.quaternion)
    // update wheel visuals
    wheelVisuals[i].position.copy(t.position)
    wheelVisuals[i].quaternion.copy(t.quaternion)
  }
})

const q = plane.quaternion
const planeBody = new CANNON.Body({
  mass: 0, // mass = 0 makes the body static
  material: groundMaterial,
  shape: new CANNON.Plane(),
  quaternion: new CANNON.Quaternion(-q._x, q._y, q._z, q._w)
})
world.add(planeBody)

/**
* Main
**/

function updatePhysics() {
  world.step(1 / 60)
  // update the chassis position
  box.position.copy(chassisBody.position)
  box.quaternion.copy(chassisBody.quaternion)
}

function render() {
  requestAnimationFrame(render)
  renderer.render(scene, camera)
  updatePhysics()
}

function navigate(e) {
  if (e.type != 'keydown' && e.type != 'keyup') return
  const keyup = e.type == 'keyup'
  vehicle.setBrake(0, 0)
  vehicle.setBrake(0, 1)
  vehicle.setBrake(0, 2)
  vehicle.setBrake(0, 3)

  const engineForce = 800,
    maxSteerVal = 0.3
  switch (e.keyCode) {

    case 38: // forward
      vehicle.applyEngineForce(keyup ? 0 : -engineForce, 2)
      vehicle.applyEngineForce(keyup ? 0 : -engineForce, 3)
      break

    case 40: // backward
      vehicle.applyEngineForce(keyup ? 0 : engineForce, 2)
      vehicle.applyEngineForce(keyup ? 0 : engineForce, 3)
      break

    case 39: // right
      vehicle.setSteeringValue(keyup ? 0 : -maxSteerVal, 2)
      vehicle.setSteeringValue(keyup ? 0 : -maxSteerVal, 3)
      break

    case 37: // left
      vehicle.setSteeringValue(keyup ? 0 : maxSteerVal, 2)
      vehicle.setSteeringValue(keyup ? 0 : maxSteerVal, 3)
      break
  }
}

window.addEventListener('keydown', navigate)
window.addEventListener('keyup', navigate)

render()