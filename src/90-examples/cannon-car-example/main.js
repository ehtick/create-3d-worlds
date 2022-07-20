const demo = new CANNON.Demo()
const mass = 150
let vehicle

demo.addScene('car', () => {
  const world = demo.getWorld()
  world.broadphase = new CANNON.SAPBroadphase(world)
  world.gravity.set(0, 0, -10)
  world.defaultContactMaterial.friction = 0

  const groundMaterial = new CANNON.Material('groundMaterial')
  const wheelMaterial = new CANNON.Material('wheelMaterial')
  const wheelGroundContactMaterial = window.wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
    friction: 0.3,
    restitution: 0,
    contactEquationStiffness: 1000
  })

  // We must add the contact materials to the world
  world.addContactMaterial(wheelGroundContactMaterial)

  let chassisShape
  chassisShape = new CANNON.Box(new CANNON.Vec3(2, 1, 0.5))
  const chassisBody = new CANNON.Body({ mass })
  chassisBody.addShape(chassisShape)
  chassisBody.position.set(0, 0, 4)
  chassisBody.angularVelocity.set(0, 0, 0.5)
  demo.addVisual(chassisBody)

  const options = {
    radius: 0.5,
    directionLocal: new CANNON.Vec3(0, 0, -1),
    suspensionStiffness: 30,
    suspensionRestLength: 0.3,
    frictionSlip: 5,
    dampingRelaxation: 2.3,
    dampingCompression: 4.4,
    maxSuspensionForce: 100000,
    rollInfluence: 0.01,
    axleLocal: new CANNON.Vec3(0, 1, 0),
    chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
    maxSuspensionTravel: 0.3,
    customSlidingRotationalSpeed: -30,
    useCustomSlidingRotationalSpeed: true
  }

  // Create the vehicle
  vehicle = new CANNON.RaycastVehicle({
    chassisBody,
  })

  options.chassisConnectionPointLocal.set(1, 1, 0)
  vehicle.addWheel(options)

  options.chassisConnectionPointLocal.set(1, -1, 0)
  vehicle.addWheel(options)

  options.chassisConnectionPointLocal.set(-1, 1, 0)
  vehicle.addWheel(options)

  options.chassisConnectionPointLocal.set(-1, -1, 0)
  vehicle.addWheel(options)

  vehicle.addToWorld(world)

  const wheelBodies = []
  for (var i = 0; i < vehicle.wheelInfos.length; i++) {
    const wheel = vehicle.wheelInfos[i]
    const cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20)
    const wheelBody = new CANNON.Body({ mass: 1 })
    const q = new CANNON.Quaternion()
    q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
    wheelBody.addShape(cylinderShape, new CANNON.Vec3(), q)
    wheelBodies.push(wheelBody)
    demo.addVisual(wheelBody)
  }

  // Update wheels
  world.addEventListener('postStep', () => {
    for (let i = 0; i < vehicle.wheelInfos.length; i++) {
      vehicle.updateWheelTransform(i)
      const t = vehicle.wheelInfos[i].worldTransform
      wheelBodies[i].position.copy(t.position)
      wheelBodies[i].quaternion.copy(t.quaternion)
    }
  })

  const matrix = []
  const sizeX = 64,
    sizeY = 64

  for (var i = 0; i < sizeX; i++) {
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
  hfBody.position.set(-sizeX * hfShape.elementSize / 2, -sizeY * hfShape.elementSize / 2, -1)
  world.add(hfBody)
  demo.addVisual(hfBody)
})

demo.start()

document.onkeydown = handler
document.onkeyup = handler

const maxSteerVal = 0.5
const maxForce = 1000
const brakeForce = 1000000
function handler(event) {
  const up = (event.type == 'keyup')

  if (!up && event.type !== 'keydown')
    return

  vehicle.setBrake(0, 0)
  vehicle.setBrake(0, 1)
  vehicle.setBrake(0, 2)
  vehicle.setBrake(0, 3)

  switch (event.keyCode) {

    case 38: // forward
      vehicle.applyEngineForce(up ? 0 : -maxForce, 2)
      vehicle.applyEngineForce(up ? 0 : -maxForce, 3)
      break

    case 40: // backward
      vehicle.applyEngineForce(up ? 0 : maxForce, 2)
      vehicle.applyEngineForce(up ? 0 : maxForce, 3)
      break

    case 66: // b
      vehicle.setBrake(brakeForce, 0)
      vehicle.setBrake(brakeForce, 1)
      vehicle.setBrake(brakeForce, 2)
      vehicle.setBrake(brakeForce, 3)
      break

    case 39: // right
      vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 0)
      vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 1)
      break

    case 37: // left
      vehicle.setSteeringValue(up ? 0 : maxSteerVal, 0)
      vehicle.setSteeringValue(up ? 0 : maxSteerVal, 1)
      break

  }
}
