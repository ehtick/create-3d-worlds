import keyboard from '/utils/classes/Keyboard.js'
import { leaveDecals } from './decals.js'
import { scene } from '/utils/scene.js'

const maxSpeed = 150.0
const turboForce = 1.7
const maxEngineForce = 8000.0
const maxBreakingForce = maxEngineForce * 2

const steeringIncrement = 0.09
const steeringClamp = .44
const steeringReturnRate = .6

let gEngineForce = 0
let gBreakingForce = 0
let gVehicleSteering = 0

export function handleInput({ vehicle, mesh, tires, ground }) {
  const { body } = mesh.userData
  const kmh = vehicle.getCurrentSpeedKmHour()
  const steering = keyboard.left || keyboard.right
  const accelerating = keyboard.up || keyboard.down

  if (vehicle.getWheelInfo(2).get_m_skidInfo() < .9 || (accelerating && Math.abs(kmh) < maxSpeed / 4))
    leaveDecals(ground, body, tires, scene)

  if (!steering) gVehicleSteering *= steeringReturnRate

  if (steering)
    if (keyboard.left) {
      if (gVehicleSteering < .05) gVehicleSteering += .01; else
        gVehicleSteering *= 1 + steeringIncrement

      if (gVehicleSteering > steeringClamp) gVehicleSteering = steeringClamp
    } else if (keyboard.right) {
      if (gVehicleSteering > -.05) gVehicleSteering -= .01; else
        gVehicleSteering *= 1 + steeringIncrement

      if (gVehicleSteering < -steeringClamp) gVehicleSteering = -steeringClamp
    }

  if (!accelerating) {
    gEngineForce = 0
    if (Math.abs(kmh) > 20) gBreakingForce += 5
  }

  if (accelerating)
    if (keyboard.up && kmh < maxSpeed) {
      if (kmh < maxSpeed / 5) gEngineForce = maxEngineForce * turboForce; else gEngineForce = maxEngineForce
      gBreakingForce = 0.0
    } else if (keyboard.up && kmh >= maxSpeed) {
      gEngineForce = 0.0
      gBreakingForce = 0.0
    } else if (keyboard.down && kmh > -maxSpeed) {
      gEngineForce = -maxEngineForce
      gBreakingForce = 0.0
    } else if (keyboard.down && kmh <= maxSpeed) {
      gEngineForce = 0.0
      gBreakingForce = 0.0
    }

  if (keyboard.space) {
    gBreakingForce = maxBreakingForce * 2
    gEngineForce = 0.0
  }

  // 0,1 front; 2,3 back
  vehicle.applyEngineForce(gEngineForce, 0)
  vehicle.setBrake(gBreakingForce, 0)
  vehicle.setSteeringValue(gVehicleSteering, 0)
  vehicle.setSteeringValue(-gVehicleSteering * 1.2, 4)// for drifting, 5th wheel (rear)

  vehicle.applyEngineForce(gEngineForce, 4)
  vehicle.applyEngineForce(gEngineForce, 1)
  vehicle.setBrake(gBreakingForce, 1)
  vehicle.setSteeringValue(gVehicleSteering, 1)
  vehicle.setSteeringValue(-gVehicleSteering * 1.2, 5) // for drifting, 6th wheel (rear)
  vehicle.applyEngineForce(gEngineForce, 5)
}

export function updateTires(tires, vehicle) {
  tires.forEach((tire, i) => {
    vehicle.updateWheelTransform(i, true)
    const wheelTrans = vehicle.getWheelInfo(i).get_m_worldTransform()
    const p = wheelTrans.getOrigin()
    const q = wheelTrans.getRotation()
    tire.position.set(p.x(), p.y(), p.z())
    tire.quaternion.set(q.x(), q.y(), q.z(), q.w())
    if (i == 0) tire.rotateY(-Math.PI)
  })
}
