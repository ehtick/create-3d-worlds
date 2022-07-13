/* global CANNON */

export function createWorld() {
  const world = new CANNON.World()
  world.broadphase = new CANNON.SAPBroadphase(world)
  world.gravity.set(0, -10, 0)
  const groundMaterial = new CANNON.Material()
  const wheelMaterial = new CANNON.Material()
  const contactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
    friction: 0.3,
    restitution: 0,
    contactEquationStiffness: 1000
  })
  world.addContactMaterial(contactMaterial)
  return world
}

export const createVehicle = car => {
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
    useCustomSlidingRotationalSpeed: true
  }

  const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.3, 2))
  const chassisBody = new CANNON.Body({ mass: 150 })
  const pos = car.chassis.position.clone()
  pos.y += 1
  chassisBody.addShape(chassisShape)
  chassisBody.position.copy(pos)
  chassisBody.angularVelocity.set(0, 0, 0)
  chassisBody.threemesh = car.chassis

  const vehicle = new CANNON.RaycastVehicle({
    chassisBody,
    indexRightAxis: 0,
    indexUpAxis: 1,
    indexForwardAxis: 2
  })

  const axlewidth = 0.8
  options.chassisConnectionPointLocal.set(axlewidth, 0, -1)
  vehicle.addWheel(options)

  options.chassisConnectionPointLocal.set(-axlewidth, 0, -1)
  vehicle.addWheel(options)

  options.chassisConnectionPointLocal.set(axlewidth, 0, 1)
  vehicle.addWheel(options)

  options.chassisConnectionPointLocal.set(-axlewidth, 0, 1)
  vehicle.addWheel(options)

  const wheels = [car.wheel[0]]
  for (let i = 0; i < 3; i++) {
    const wheel = car.wheel[0].clone()
    wheels.push(wheel)
  }

  car.wheels = vehicle.wheelInfos.map((wheel, i) => {
    const shape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20)
    const body = new CANNON.Body({ mass: 1 })
    const q = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2)
    body.addShape(shape, new CANNON.Vec3(), q)
    body.threemesh = wheels[i]
    return body
  })

  return vehicle
}

export function updateDrive(vehicle, joystick) {
  const { forward, turn } = joystick
  const maxSteerVal = 0.6
  const maxForce = 500
  const force = maxForce * forward
  const steer = maxSteerVal * turn
  const brakeForce = forward == 0 ? 10 : 0

  vehicle.setBrake(brakeForce, 0)
  vehicle.setBrake(brakeForce, 1)
  vehicle.setBrake(brakeForce, 2)
  vehicle.setBrake(brakeForce, 3)

  if (forward != 0) {
    vehicle.applyEngineForce(force, 0)
    vehicle.applyEngineForce(force, 1)
  }

  vehicle.setSteeringValue(steer, 2)
  vehicle.setSteeringValue(steer, 3)
}

export const updateWheels = (vehicle, car) => {
  vehicle.wheelInfos.forEach((wheel, i) => {
    vehicle.updateWheelTransform(i)
    const transform = wheel.worldTransform
    car.wheels[i].threemesh.position.copy(transform.position)
    car.wheels[i].threemesh.quaternion.copy(transform.quaternion)
  })
}
