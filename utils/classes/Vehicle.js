import * as THREE from 'three'
import { DecalGeometry } from '/node_modules/three/examples/jsm/geometries/DecalGeometry.js'

import { Ammo, createRigidBody } from '/utils/physics.js'
import keyboard from '/utils/classes/Keyboard.js'

const textureLoader = new THREE.TextureLoader()

const FRONT_LEFT = 0
const FRONT_RIGHT = 1
const BACK_LEFT = 2
const BACK_RIGHT = 3

const steeringIncrement = .04
const steeringClamp = .5
const maxEngineForce = 2000
const maxBreakingForce = 100

const boxShape = ({ width = 1.8, height = .6, length = 4 } = {}) => {
  const size = new Ammo.btVector3(width * .5, height * .5, length * .5)
  return new Ammo.btBoxShape(size)
}

const oldCarPos = new THREE.Vector3(0, 0, 0)
const oldCarPos2 = new THREE.Vector3(0, 0, 0)

let decRot = 0
const decals = []

const decalMaterial = new THREE.MeshPhongMaterial({
  specular: 0x444444,
  map: textureLoader.load('/assets/images/car-track.png'),
  shininess: 900,
  transparent: true,
  depthTest: true,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: -4,
  wireframe: false,
  opacity: .4
})

function fixAngleRad(a) {
  if (a > Math.PI) a -= Math.PI * 2
  else if (a < -Math.PI) a += Math.PI * 2
  return a
}

export function leaveDecals(ground, body, tires, scene) {
  const groundMesh = ground?.children?.length ? ground.children[0] : ground
  const velocity = new THREE.Vector3(0, 0, 0)
  const dec = new Ammo.btVector3(0, 0, 0)
  const dec2 = new Ammo.btVector3(0, 0, 0)
  const dec3 = new Ammo.btVector3(0, 0, 0)

  const p_d = new THREE.Vector3(0, 0, 0)
  const r_d = new THREE.Euler(0, 0, 0, 'XYZ')
  const s_d = new THREE.Vector3(90, 90, 90)

  const wheelRot = body.getWorldTransform().getBasis()
  dec.setValue(-.2, 0, .2)
  dec2.setValue(
    wheelRot.getRow(0).x() * dec.x() + wheelRot.getRow(0).y() * dec.y() + wheelRot.getRow(0).z() * dec.z(),
    wheelRot.getRow(1).x() * dec.x() + wheelRot.getRow(1).y() * dec.y() + wheelRot.getRow(1).z() * dec.z(),
    wheelRot.getRow(2).x() * dec.x() + wheelRot.getRow(2).y() * dec.y() + wheelRot.getRow(2).z() * dec.z()
  )
  dec3.setValue(
    dec2.x() + tires[3].position.x,
    dec2.y() + tires[3].position.y,
    dec2.z() + tires[3].position.z
  )

  p_d.set(dec3.x(), dec3.y(), dec3.z())

  velocity.x = p_d.x - oldCarPos.x
  velocity.y = p_d.y - oldCarPos.y
  velocity.z = p_d.z - oldCarPos.z

  oldCarPos.x = p_d.x
  oldCarPos.y = p_d.y
  oldCarPos.z = p_d.z
  // angle from velocity
  decRot = -fixAngleRad(Math.atan2(velocity.z, velocity.x) + Math.PI / 2)

  r_d.set(0, decRot, 0)
  if (velocity.length() > 2) {
    velocity.x = 0
    velocity.y = 0
    velocity.z = 0
  }
  s_d.set(1, 1, velocity.length())
  const material_d = decalMaterial.clone()

  let md = new THREE.Mesh(new DecalGeometry(groundMesh, p_d, r_d, s_d), material_d)
  decals.push(md)
  scene.add(md)

  dec.setValue(.2, 0, .2)
  dec2.setValue(
    wheelRot.getRow(0).x() * dec.x() + wheelRot.getRow(0).y() * dec.y() + wheelRot.getRow(0).z() * dec.z(),
    wheelRot.getRow(1).x() * dec.x() + wheelRot.getRow(1).y() * dec.y() + wheelRot.getRow(1).z() * dec.z(),
    wheelRot.getRow(2).x() * dec.x() + wheelRot.getRow(2).y() * dec.y() + wheelRot.getRow(2).z() * dec.z()
  )
  dec3.setValue(
    dec2.x() + tires[2].position.x,
    dec2.y() + tires[2].position.y,
    dec2.z() + tires[2].position.z
  )
  p_d.set(dec3.x(), dec3.y(), dec3.z())

  velocity.x = p_d.x - oldCarPos2.x
  velocity.y = p_d.y - oldCarPos2.y
  velocity.z = p_d.z - oldCarPos2.z

  oldCarPos2.x = p_d.x
  oldCarPos2.y = p_d.y
  oldCarPos2.z = p_d.z

  decRot = -fixAngleRad(Math.atan2(velocity.z, velocity.x) + Math.PI / 2)
  r_d.set(0, decRot, 0)

  if (velocity.length() > 2) {
    velocity.x = 0; velocity.y = 0; velocity.z = 0
  }
  s_d.set(1, 1, velocity.length())

  md = new THREE.Mesh(new DecalGeometry(groundMesh, p_d, r_d, s_d), material_d)
  decals.push(md)
  scene.add(md)
}

function updateMesh(mesh, transform) {
  const position = transform.getOrigin()
  const quaternion = transform.getRotation()
  mesh.position.set(position.x(), position.y(), position.z())
  mesh.quaternion.set(quaternion.x(), quaternion.y(), quaternion.z(), quaternion.w())
}

export default class Vehicle {
  constructor({ physicsWorld, chassisMesh, wheelMesh, position, quaternion }) {
    this.mesh = new THREE.Group

    if (position) chassisMesh.position.copy(position)
    if (quaternion) chassisMesh.quaternion.copy(quaternion)

    this.mesh.add(chassisMesh)
    this.chassisMesh = chassisMesh

    this.body = createRigidBody({ mesh: chassisMesh, mass: 800, shape: boxShape() })
    physicsWorld.addRigidBody(this.body)

    const tuning = new Ammo.btVehicleTuning()
    const rayCaster = new Ammo.btDefaultVehicleRaycaster(physicsWorld)
    this.vehicle = new Ammo.btRaycastVehicle(tuning, this.body, rayCaster)
    this.vehicle.setCoordinateSystem(0, 1, 2)
    physicsWorld.addAction(this.vehicle)

    this.createWheels(tuning)
    this.addWheelMeshes(wheelMesh)

    this.vehicleSteering = 0
  }

  addWheelMeshes(wheelMesh) {
    this.wheelMeshes = []
    for (let i = 0; i < 4; i++) {
      const mesh = wheelMesh.clone()
      if (i == 0 || i == 3) mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI)
      this.wheelMeshes.push(mesh)
      this.mesh.add(mesh)
    }
  }

  createWheels(tuning) {
    const wheelFront = { x: 1.15, y: .3, z: 1.55 }
    const wheelBack = { x: 1.15, y: .3, z: -1.8 }
    const wheelRadiusFront = .45
    const wheelRadiusBack = .45

    this.createWheel(true, new Ammo.btVector3(wheelFront.x, wheelFront.y, wheelFront.z), wheelRadiusFront, tuning)
    this.createWheel(true, new Ammo.btVector3(-wheelFront.x, wheelFront.y, wheelFront.z), wheelRadiusFront, tuning)
    this.createWheel(false, new Ammo.btVector3(-wheelBack.x, wheelBack.y, wheelBack.z), wheelRadiusBack, tuning)
    this.createWheel(false, new Ammo.btVector3(wheelBack.x, wheelBack.y, wheelBack.z), wheelRadiusBack, tuning)
  }

  createWheel(isFront, position, radius, tuning) {
    const friction = 1000
    const suspensionStiffness = 20.0
    const suspensionDamping = 2.3
    const suspensionCompression = 4.4
    const suspensionRestLength = 0.6
    const rollInfluence = 0.2

    const wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0)
    const wheelAxleCS = new Ammo.btVector3(-1, 0, 0)

    const wheelInfo = this.vehicle.addWheel(
      position, wheelDirectionCS0, wheelAxleCS, suspensionRestLength,
      radius, tuning, isFront
    )

    wheelInfo.set_m_suspensionStiffness(suspensionStiffness)
    wheelInfo.set_m_wheelsDampingRelaxation(suspensionDamping)
    wheelInfo.set_m_wheelsDampingCompression(suspensionCompression)

    wheelInfo.set_m_frictionSlip(friction)
    wheelInfo.set_m_rollInfluence(rollInfluence)
  }

  updateMeshes() {
    const { vehicle, wheelMeshes } = this

    const numWheels = vehicle.getNumWheels()
    for (let i = 0; i < numWheels; i++) {
      vehicle.updateWheelTransform(i, true)
      updateMesh(wheelMeshes[i], vehicle.getWheelTransformWS(i))
    }

    updateMesh(this.chassisMesh, vehicle.getChassisWorldTransform())
  }

  updatePhysics(engineForce, breakingForce) {
    const { vehicle } = this
    vehicle.applyEngineForce(engineForce, BACK_LEFT)
    vehicle.applyEngineForce(engineForce, BACK_RIGHT)

    vehicle.setBrake(breakingForce / 2, FRONT_LEFT)
    vehicle.setBrake(breakingForce / 2, FRONT_RIGHT)
    vehicle.setBrake(breakingForce, BACK_LEFT)
    vehicle.setBrake(breakingForce, BACK_RIGHT)

    vehicle.setSteeringValue(this.vehicleSteering, FRONT_LEFT)
    vehicle.setSteeringValue(this.vehicleSteering, FRONT_RIGHT)
  }

  update() {
    const { vehicle } = this
    const speed = vehicle.getCurrentSpeedKmHour()
    let breakingForce = 0
    let engineForce = 0

    if (keyboard.up)
      if (speed < -1)
        breakingForce = maxBreakingForce
      else engineForce = maxEngineForce

    if (keyboard.down)
      if (speed > 1)
        breakingForce = maxBreakingForce
      else engineForce = -maxEngineForce / 2

    if (keyboard.left) {
      if (this.vehicleSteering < steeringClamp)
        this.vehicleSteering += steeringIncrement
    } else if (keyboard.right) {
      if (this.vehicleSteering > -steeringClamp)
        this.vehicleSteering -= steeringIncrement
    } else if (this.vehicleSteering < -steeringIncrement)
      this.vehicleSteering += steeringIncrement
    else if (this.vehicleSteering > steeringIncrement)
      this.vehicleSteering -= steeringIncrement
    else
      this.vehicleSteering = 0

    this.updatePhysics(engineForce, breakingForce)
    this.updateMeshes()
  }
}