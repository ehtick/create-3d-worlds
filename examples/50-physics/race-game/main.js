/* global THREE, Ammo */
import keyboard from '/utils/classes/Keyboard.js'
import { leaveDecals, fadeDecals } from './utils.js'
import { makeVehicle } from './vehicle.js'

const SCREEN_HEIGHT = window.innerHeight
const SCREEN_WIDTH = window.innerWidth
const physicsWorld = createPhysicsWorld()
let worldModel

const tempVector = new Ammo.btVector3(0, 0, 0)
const center = new Ammo.btVector3(0, -38, 0)
const worldScale = 25

const carNames = ['hummer', 'lada']
const numCars = carNames.length
const currentCarIndex = 0
const carModels = []
const tireClones = []
const hubClones = []
const objFile = [
  ['hummer.obj', 'hummerTire.obj'],
  ['ladavaz.obj', 'ladavazTire.obj'],
]
const mtlFile = [
  ['hummer.mtl', 'hummerTire.mtl'],
  ['ladavaz.mtl', 'ladavazTire.mtl'],
]

const DISABLE_DEACTIVATION = 4
const numObjects = 2 // ground is 0, camera is 1

const maxSpeed = 150.0
const turboForce = 1.7
const maxEngineForce = 8000.0
const maxBreakingForce = maxEngineForce * 2

const steeringIncrement = 0.09
const steeringClamp = .44
const steeringReturnRate = .6

const bodies = []
const vehicles = []
const carPos = []
const chassisWorldTrans = []
let gEngineForce = 0
let gBreakingForce = 0
let gVehicleSteering = 0

for (let c = 0; c < numCars; c++) {
  bodies[c] = []
  vehicles[c] = []
  carModels[c] = []
  tireClones[c] = []
  hubClones[c] = []
  chassisWorldTrans[c] = new Ammo.btTransform()
}

const triMeshBody = []
let tbody

const rigidBodies = []
const threeObject = [] // index 0 is for the ground, 1 for the camera

const matBlank = new THREE.MeshBasicMaterial()
matBlank.visible = false
matBlank.side = THREE.FrontSide

const obTrans = new Ammo.btTransform()
const triMeshBodyTrans = new Ammo.btTransform()

/* INIT */

const container = document.createElement('div')
container.style.height = window.innerHeight + 'px'
container.style.width = window.innerWidth + 'px'
container.focus()
document.body.appendChild(container)

const camera = new THREE.PerspectiveCamera(70, SCREEN_WIDTH / SCREEN_HEIGHT, .01, 9000)
const scene = new THREE.Scene()

skyInit()

rigidBodies.push({})

initObjects(numObjects)
for (let i = 1; i < rigidBodies.length; i++)
  scene.add(threeObject[i])

for (let c = 0; c < numCars; c++)
  initVehicle(c)

const hemiLight = new THREE.HemisphereLight(0xd7bb60, 0xf0d7bb, 1.0)
hemiLight.position.set(0, 1, 0)
scene.add(hemiLight)

const dirLight = new THREE.DirectionalLight(0xffffff, 2.6)
dirLight.castShadow = true
scene.add(dirLight)

objWorldModelLoader('courser14a.obj', 'courser14a.mtl', worldScale)

for (let c = 0; c < numCars; c++)
  for (let i = 0; i < numCars; i++)
    objCarModelLoader(c, i, objFile[c][i], mtlFile[c][i])

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT)
container.appendChild(renderer.domElement)

/* FUNCTION */

function createPhysicsWorld() {
  const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration()
  const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration)
  const worldMin = new Ammo.btVector3(-1000, -1000, -1000)
  const worldMax = new Ammo.btVector3(1000, 1000, 1000)
  const overlappingPairCache = new Ammo.btAxisSweep3(worldMin, worldMax)
  const solver = new Ammo.btSequentialImpulseConstraintSolver()

  const physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration)
  physicsWorld.setGravity(new Ammo.btVector3(0, -40, 0))
  return physicsWorld
}

function setChaseCam(camHeight = 4, camDist = 8) {
  const carRot = bodies[currentCarIndex].getWorldTransform().getBasis()
  const c2 = new Ammo.btVector3(0, camHeight, -camDist)
  const camPointer = new Ammo.btVector3(
    carRot.getRow(0).x() * c2.x() + carRot.getRow(0).y() * c2.y() + carRot.getRow(0).z() * c2.z(),
    carRot.getRow(1).x() * c2.x() + carRot.getRow(1).y() * c2.y() + carRot.getRow(1).z() * c2.z(),
    carRot.getRow(2).x() * c2.x() + carRot.getRow(2).y() * c2.y() + carRot.getRow(2).z() * c2.z()
  )

  const carOrigin = bodies[currentCarIndex].getWorldTransform().getOrigin()
  camera.position.set(
    camPointer.x() + carOrigin.x(),
    camPointer.y() + carOrigin.y(),
    camPointer.z() + carOrigin.z()
  )
  tempVector.setValue(0, 0, 0)
  rigidBodies[1].setLinearVelocity(tempVector)
  rigidBodies[1].setAngularVelocity(tempVector)

  camera.lookAt(new THREE.Vector3(carOrigin.x(), carOrigin.y(), carOrigin.z()))
}

function triMeshBuilder(model, scale) {
  const trimesh = new Ammo.btTriangleMesh()
  const v = model.children[0].geometry.attributes.position.array
  const vcount = v.length
  for (let c = 0; c < vcount; c += 9) {
    const v0 = v[c] * scale
    const v1 = v[c + 1] * scale
    const v2 = v[c + 2] * scale
    const v3 = v[c + 3] * scale
    const v4 = v[c + 4] * scale
    const v5 = v[c + 5] * scale
    const v6 = v[c + 6] * scale
    const v7 = v[c + 7] * scale
    const v8 = v[c + 8] * scale

    // need 9 numbers per triangle
    trimesh.addTriangle(
      new Ammo.btVector3(v0, v1, v2),
      new Ammo.btVector3(v3, v4, v5),
      new Ammo.btVector3(v6, v7, v8)
    )
  }

  const concaveShape = new Ammo.btBvhTriangleMeshShape(trimesh, true)
  triMeshBodyTrans.setIdentity()
  triMeshBodyTrans.setOrigin(center)
  const motionStated = new Ammo.btDefaultMotionState(triMeshBodyTrans)
  tempVector.setValue(0, 0, 0)
  tbody = new Ammo.btRigidBody(0, motionStated, concaveShape, tempVector)
  tbody.setCollisionFlags(tbody.getCollisionFlags() | 1)
  tbody.setActivationState(DISABLE_DEACTIVATION)
  tbody.setFriction(.1)
  physicsWorld.addRigidBody(tbody)
  triMeshBody.push(tbody)
}

function initVehicle(c) {
  const startTransform = new Ammo.btTransform()
  startTransform.setIdentity()
  tempVector.setValue(1.2, .5, 2.4)
  const chassisShape = new Ammo.btBoxShape(tempVector)
  const compound = new Ammo.btCompoundShape()
  const localTrans = new Ammo.btTransform()
  localTrans.setIdentity()
  tempVector.setValue(0, 1, 0)
  localTrans.setOrigin(tempVector)
  compound.addChildShape(localTrans, chassisShape)
  const mass = 680

  const localInertia = new Ammo.btVector3(1, 1, 1)
  compound.calculateLocalInertia(mass, localInertia)
  const myMotionState = new Ammo.btDefaultMotionState(startTransform)
  const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, compound, localInertia)
  bodies[c] = new Ammo.btRigidBody(rbInfo)
  bodies[c].setFriction(1)
  physicsWorld.addRigidBody(bodies[c])
  vehicles[c] = makeVehicle(c, physicsWorld, bodies)
}

function initObjects(numObjects) {
  for (let i = 1; i < numObjects; i++) {// 0 is ground, 1 is camera
    let colShape
    let mass
    if (i == 1) {// camera object with index 1 gets built here
      threeObject[i] = new THREE.Mesh(new THREE.SphereGeometry(.1, 20, 20), matBlank)
      colShape = new Ammo.btSphereShape(1)
      mass = 1
    }

    const startTransform = new Ammo.btTransform()
    startTransform.setIdentity()

    const isDynamic = (mass !== 0)
    const localInertia = new Ammo.btVector3(0, 0, 0)
    if (isDynamic) colShape.calculateLocalInertia(mass, localInertia)
    tempVector.setValue(0, 0, 0)
    startTransform.setOrigin(tempVector)
    const myMotionState = new Ammo.btDefaultMotionState(startTransform)
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, colShape, localInertia)
    const body = new Ammo.btRigidBody(rbInfo)
    threeObject[i].userData.physicsBody = body
    threeObject[i].receiveShadow = true
    threeObject[i].castShadow = true
    body.setFriction(3.0)
    if (i == 1) {// no contact response for camera
      body.setCollisionFlags(body.getCollisionFlags() | 4)
      body.setActivationState(DISABLE_DEACTIVATION)
    }
    physicsWorld.addRigidBody(body)
    rigidBodies.push(body)
  }
}

function findGround(c) {
  const downRayDir = new Ammo.btVector3(0, 0, 0)
  if (worldModel && carModels[c]) {
    bodies[c].getMotionState().getWorldTransform(chassisWorldTrans[c])
    carPos[c] = chassisWorldTrans[c].getOrigin()
    downRayDir.setX(carPos[c].x())
    downRayDir.setY(carPos[c].y() - 2000)
    downRayDir.setZ(carPos[c].z())
    let downRay = new Ammo.ClosestRayResultCallback(carPos[c], downRayDir)
    physicsWorld.rayTest(carPos[c], downRayDir, downRay)

    if (downRay.hasHit())
      bodies[c].setDamping(0, 0)
    else {
      const cp = new Ammo.btVector3(carPos[c].x(), carPos[c].y() + 1, carPos[c].z())
      downRayDir.setY(carPos[c].y() + 400)
      downRay = new Ammo.ClosestRayResultCallback(cp, downRayDir)
      physicsWorld.rayTest(cp, downRayDir, downRay)
      if (downRay.hasHit()) {
        const pointAbove = downRay.get_m_hitPointWorld()
        bodies[c].setDamping(.99, .99)
        bodies[c].getMotionState().getWorldTransform(chassisWorldTrans[c])
        pointAbove.setY(pointAbove.y() + 1.5)
        chassisWorldTrans[c].setOrigin(pointAbove)
        bodies[c].setWorldTransform(chassisWorldTrans[c])
      }
    }
  }
}

function skyInit() {
  const fogColor = new THREE.Color(0xae9a7b)
  scene.background = fogColor
  scene.fog = new THREE.Fog(fogColor, 0, 500)
}

function objCarModelLoader(c, i, objFile, mtlFile, scale = .57) {
  const mtlLoader = new THREE.MTLLoader()
  mtlLoader.load(mtlFile, materials => {
    materials.preload()
    const objLoader = new THREE.OBJLoader()
    objLoader.setMaterials(materials)
    objLoader.load(objFile, object => {
      object.scale.set(scale, scale, scale)
      object.traverse(
        child => {
          child.castShadow = child.receiveShadow = child.isMesh
        })
      // make three copies each of tire
      if (i == 1)
        for (let j = 0; j < 3; j++) {
          tireClones[c][j] = object.clone()
          scene.add(tireClones[c][j])
        }
      scene.add(object)
      carModels[c][i] = object
    })
  })
}

function objWorldModelLoader(objFile, mtlFile, scale) {
  const mtlLoader = new THREE.MTLLoader()
  mtlLoader.load(mtlFile, materials => {
    materials.preload()
    const objLoader = new THREE.OBJLoader()
    objLoader.setMaterials(materials)
    objLoader.load(objFile, object => {
      object.position.set(0, -38, 0)
      object.scale.set(scale, scale, scale)
      object.traverse(child => {
        child.castShadow = child.receiveShadow = child.isMesh
      })
      triMeshBuilder(object, worldScale)
      scene.add(object)
      worldModel = object
    })
  })
}

/* LOOP */

function handleInput() {
  const vehicle = vehicles[0]
  const kmh = vehicle.getCurrentSpeedKmHour()

  if (vehicle.getWheelInfo(2).get_m_skidInfo() < .9 || ((keyboard.up || keyboard.down) && Math.abs(kmh) < maxSpeed / 4))
    leaveDecals(carModels[0], worldModel, bodies[0], tireClones[0], scene)

  const steering = (keyboard.left || keyboard.right)

  if (!steering) gVehicleSteering *= steeringReturnRate
  else if (steering)
    if (keyboard.left) {
      if (gVehicleSteering < .05) gVehicleSteering += .01; else
        gVehicleSteering *= 1 + steeringIncrement

      if (gVehicleSteering > steeringClamp) gVehicleSteering = steeringClamp
    } else
    if (keyboard.right) {
      if (gVehicleSteering > -.05) gVehicleSteering -= .01; else
        gVehicleSteering *= 1 + steeringIncrement

      if (gVehicleSteering < -steeringClamp) gVehicleSteering = -steeringClamp
    }

  const accelerating = keyboard.up || keyboard.down

  if (!accelerating) {
    gEngineForce = 0
    if (Math.abs(kmh) > 20) gBreakingForce += 5
  } else if (accelerating)
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

function updatePhysics() {
  physicsWorld.stepSimulation(1 / 60)

  for (let c = 0; c < numCars; c++) {
    findGround(c)
    handleInput()
    // chassis
    bodies[c].getMotionState().getWorldTransform(chassisWorldTrans[c])
    carPos[c] = chassisWorldTrans[c].getOrigin()

    for (let i = 0; i < numCars; i++)
      if (carModels[c][i]) {
        carModels[c][i].position.set(carPos[c].x(), carPos[c].y(), carPos[c].z())
        carModels[c][i].quaternion.set(
          chassisWorldTrans[c].getRotation().x(),
          chassisWorldTrans[c].getRotation().y(),
          chassisWorldTrans[c].getRotation().z(),
          chassisWorldTrans[c].getRotation().w()
        )
      }

    // wheels, index 0 is chassis shape
    for (let i = 0; i < 4; i++) {
      // synchronize wheels with chassis
      vehicles[c].updateWheelTransform(i, true)
      let wheelTrans = new Ammo.btTransform()
      wheelTrans = vehicles[c].getWheelInfo(i).get_m_worldTransform()
      const p = wheelTrans.getOrigin()
      const q = wheelTrans.getRotation()
      // clones of tire and hub
      if (i < 3) {
        if (tireClones[c][i]) {
          tireClones[c][i].position.set(p.x(), p.y(), p.z())
          tireClones[c][i].quaternion.set(q.x(), q.y(), q.z(), q.w())
          if (i == 0) tireClones[c][i].rotateY(- Math.PI)
        }
        if (hubClones[c][i]) {
          hubClones[c][i].position.set(p.x(), p.y(), p.z())
          hubClones[c][i].quaternion.set(q.x(), q.y(), q.z(), q.w())
          if (i == 0) hubClones[c][i].rotateY(- Math.PI)
        }
      } else if (i == 3)
        // original copy of tire and hub for wheels
        if (carModels[c][1]) {
          carModels[c][1].position.set(p.x(), p.y(), p.z())
          carModels[c][1].quaternion.set(q.x(), q.y(), q.z(), q.w())
          carModels[c][1].rotateY(- Math.PI)
        }
    }
  }

  // index 0 is ground, index 1 is camera
  for (let i = 2; i < rigidBodies.length; i++) {
    rigidBodies[i].getMotionState().getWorldTransform(obTrans)
    const p = obTrans.getOrigin()
    const q = obTrans.getRotation()
    threeObject[i].position.set(p.x(), p.y(), p.z())
    threeObject[i].quaternion.set(q.x(), q.y(), q.z(), q.w())
  }
}

void function animate() {
  requestAnimationFrame(animate)
  updatePhysics()
  fadeDecals(scene)
  setChaseCam()
  renderer.render(scene, camera)
}()

/* EVENTS */

document.addEventListener('keydown', () => {
  if (keyboard.space) {
    gBreakingForce = maxBreakingForce * 2
    gEngineForce = 0.0
  }
})
