/* global THREE, Ammo */
const heightLimit = 1
const widthLimit = 1
const SCREEN_HEIGHT = window.innerHeight * heightLimit
const SCREEN_WIDTH = window.innerWidth * widthLimit

const worldFiles = ['courser14a']
let worldModel

let container
const textureLoader_d = new THREE.TextureLoader()
const decalDiffuse = textureLoader_d.load('track5.png')

const loadingDone = false
const tv = new Ammo.btVector3(0, 0, 0)
const tCamPoint = new Ammo.btVector3(0, 0, 0)
let carHit = false
let dp
let numMan
let num_contacts = 0
let bodyA
let bodyB
let carHitForce = []
let manifolder = []
let highestHitForce = 0

const downRayDir = new Ammo.btVector3(0, 0, 0)

const positioner = [
  new Ammo.btVector3(0, -38, 0), // center
  new Ammo.btVector3(-880, -38, 0), // forward
  new Ammo.btVector3(880, -38, 0), // back
  new Ammo.btVector3(0, -38, 880), // left
  new Ammo.btVector3(0, -38, -880), // right
  new Ammo.btVector3(-880, -38, 880), // forward-left
  new Ammo.btVector3(-880, -38, -880), // forward-right
  new Ammo.btVector3(880, -38, 880), // back-right
  new Ammo.btVector3(880, -38, -880) // back-left
]
const positionerSave = []
positionerSave[0] = new Ammo.btVector3(positioner[0].x(), positioner[0].y(), positioner[0].z())

let cci = 3
const dec = new Ammo.btVector3(0, 0, 0)
const dec2 = new Ammo.btVector3(0, 0, 0)
const dec3 = new Ammo.btVector3(0, 0, 0)
const smo = new Ammo.btVector3(0, 0, 0)
const smo2 = new Ammo.btVector3(0, 0, 0)
const smo3 = new Ammo.btVector3(0, 0, 0)
const smo4 = new THREE.Vector3(0, 0, 0)
let s_material, s_material2, s_material3, smoker, smoker2, smoker3, smoker4, sparksMesh
let smokerCount = 0, smokerCount2 = 6
const frame = []
let opacDown = false, opac = .1
const sparks = []
let sparkler = false
const hitPoint = new Ammo.btVector3(0, 0, 0)
let sparksCount = 0
const smokerCount3 = [0, 5]
const smoUp = [true, true]
let smoker2Scale = .1
const carVel = new THREE.Vector3(0, 0, 0)
const oldCarPos = new THREE.Vector3(0, 0, 0)
const oldCarPos2 = new THREE.Vector3(0, 0, 0)
let decRot = 0
let decalCounter = 0
let decals = []
let material_d
const p_d = new THREE.Vector3(0, 0, 0)
const r_d = new THREE.Euler(0, 0, 0, 'XYZ')
const s_d = new THREE.Vector3(90, 90, 90)

let objLoader, mtlLoader
const worldScale = 22
const fogColor = new THREE.Color(0xae9a7b)// ae9a7b
let groundY = 0
let xvelc = 0, yvelc = 0, zvelc = 0, ctFac = 1.35
const tranCam = new Ammo.btTransform()
const tranChass = new Ammo.btTransform()
let chaseCamO = new Ammo.btVector3()
let carRot = new Ammo.btMatrix3x3()
let bodRot = -1
const fogFar = 500
let camera, scene, renderer, hemiLight, dirLight, pointLight
const clock = new THREE.Clock()
let pageUpper = false, pageDowner = false
let camHeight = 4.0
let camDist = 8.0
const minCamHeight = .1, maxCamHeight = 20
const camHeightS = camHeight, camDistS = camDist
let dt = 0.0
const chaseCammer = true
let chaseStarter = chaseCammer
let md

const carNames = ['lada', 'hummer']
const numCars = carNames.length
if (cci >= numCars) cci = numCars - 1

const carModel = []
const tireClones = []
const hubClones = []
const objFile = []
const mtlFile = []
const objScales = []
const worldSwitching = []
const carHeightAboveGround = []

for (let c = 0; c < numCars; c++) {
  carHeightAboveGround[c] = 0
  worldSwitching[c] = true
  objScales[c] = [.57, .57]
  if (c == 0) {
    objFile[c] = ['ladavaz.obj', 'ladavazTire.obj']
    mtlFile[c] = ['ladavaz.mtl', 'ladavazTire.mtl']
  } else if (c == 1) {
    objFile[c] = ['hummer.obj', 'hummerTire.obj']
    mtlFile[c] = ['hummer.mtl', 'hummerTire.mtl']
  }
}

const DISABLE_DEACTIVATION = 4
const numObjects = 2 // ground is 0, camera is 1
let resetBulletObjectsBool = true

const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration()
const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration)
const worldMin = new Ammo.btVector3(-1000, -1000, -1000)
const worldMax = new Ammo.btVector3(1000, 1000, 1000)
const overlappingPairCache = new Ammo.btAxisSweep3(worldMin, worldMax)
const solver = new Ammo.btSequentialImpulseConstraintSolver()

const dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(
  dispatcher,
  overlappingPairCache,
  solver,
  collisionConfiguration
)

/* for reference
  CF_STATIC_OBJECT= 1,
  CF_KINEMATIC_OBJECT= 2,
  CF_NO_CONTACT_RESPONSE=4,
  CF_CUSTOM_MATERIAL_CALLBACK=8,//this allows per-triangle material (friction/restitution)
  CF_CHARACTER_OBJECT=16,
*/
const maxSpeed = []
const goingTooFast = []
const spinningTooFast = []
const rightIndex = 0
const upIndex = 1
const forwardIndex = 2
const wheelDirectionCS0 = new Ammo.btVector3(0, -1, 0)
let wheelTrans = new Ammo.btTransform()
const wheelAxleCS = new Ammo.btVector3(-1, 0, 0)
const gEngineForce = []
const gBreakingForce = []
const turboForce = 1.7
const maxEngineForce = []
const maxBreakingForce = []
const gVehicleSteering = []

const steeringIncrement = []
const steeringClamp = []
const steeringReturnRate = []
const wheelRadius = [.36, .42, .36, .41, .36, .36, .36]
const wheelWidth = [.2, .5, .2, -.05, .2, .2, .2]
const frictionSlip = []
const rearWheelFriction = []

const suspensionStiffness = [58.0, 45.0, 58.0, 36.0, 58.0, 58.0, 58.0]
const suspensionDamping = []
const suspensionCompression = []
const rollInfluence = [.01, .01, .01, .01, .01, .01, .01]
const maxSuspensionTravelCm = []
const maxSuspensionForce = []
const CUBE_HALF_EXTENTS = [.96, 1.12, .97, 1., .94, .99, .99]
const suspensionRestLength = [1.1, 1.05, 1.1, 1.25, 1.1, 1.2, 1.2]
const connectionHeight = []

const kmh = []
const lastKmh = []
const steering = []
const accelerating = []
const moveCarForward = []
const moveCarBackward = []
const steerCarLeft = []
const steerCarRight = []
let m_tuning

const coordi = []
const coordRange = 300
const numCoords = 100
const coordx = []
const coordz = []
const bodRotTick = []

const m_carChassis = []
const m_vehicle = []
const carPos = []
const carMat = []
const carColor = []
const rimColor = []
const chassisWorldTrans = []
const tuneup = []
const carObjects = []
const allCoordSame = true

for (let c = 0; c < numCars; c++) {
  bodRotTick[c] = 0
  coordi[c] = 0
  coordx[c] = []
  coordz[c] = []

  for (let i = 0; i < numCoords; i++)
    if (c > 0 && allCoordSame) {
      coordx[c][i] = coordx[0][i]
      coordz[c][i] = coordz[0][i]
    } else {
      coordx[c][i] = randRange(-coordRange, coordRange)
      coordz[c][i] = randRange(-coordRange, coordRange)
    }

  maxSpeed[c] = 150.0
  goingTooFast[c] = false
  spinningTooFast[c] = false
  kmh[c] = .00001
  lastKmh[c] = kmh[c]
  steering[c] = false
  accelerating[c] = false
  moveCarForward[c] = false
  moveCarBackward[c] = false
  steerCarLeft[c] = false
  steerCarRight[c] = false

  gEngineForce[c] = 0
  gBreakingForce[c] = 0
  gVehicleSteering[c] = 0

  maxEngineForce[c] = 8000.0
  maxBreakingForce[c] = maxEngineForce[c] * 2
  steeringIncrement[c] = 0.09
  steeringClamp[c] = .44
  steeringReturnRate[c] = .6
  frictionSlip[c] = 3.5
  rearWheelFriction[c] = 4.5
  suspensionCompression[c] = 2.4
  maxSuspensionTravelCm[c] = 1500.0
  maxSuspensionForce[c] = 50000.0
  connectionHeight[c] = 1.2
  suspensionDamping[c] = 4

  carObjects[c] = {}
  m_carChassis[c] = []
  m_vehicle[c] = []
  carModel[c] = []
  tireClones[c] = []
  hubClones[c] = []
  carPos[c] = new Ammo.btVector3(0, 0, 0)
  carMat[c] = []
  if (c == cci) {
    carColor[c] = new THREE.Color('rgb(95,118,103)')
    rimColor[c] = new THREE.Color('rgb(90,90,90)')
  } else {
    carColor[c] = new THREE.Color('rgb(90,90,80)')
    rimColor[c] = new THREE.Color('rgb(80,80,80)')
  }
  chassisWorldTrans[c] = new Ammo.btTransform()
  tuneup[c] = false
}

tv.setValue(0, -40, 0)
dynamicsWorld.setGravity(tv)

const triMeshBody = []
let tbody

const worldID = 0
const bodies = []

const threeObject = [] // index 0 is for the ground, 1 for the camera

const matBlank = new THREE.MeshBasicMaterial()
matBlank.visible = false
matBlank.side = THREE.FrontSide

const obTrans = new Ammo.btTransform()
const triMeshBodyTrans = new Ammo.btTransform()

const decalMaterial = new THREE.MeshPhongMaterial({
  specular: 0x444444,
  map: decalDiffuse,
  shininess: 900,
  transparent: true,
  depthTest: true,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: - 4,
  wireframe: false,
  opacity: .4
})

init()

/* FUNCTION */

function fixAngleRad(a) {
  if (a > Math.PI) a -= Math.PI * 2; else if (a < -Math.PI) a += Math.PI * 2; return a
}

function updateCamera() {
  tv.setValue(0.0, -1.0, 0.0)
  bodRot = m_carChassis[cci].getWorldTransform().getBasis().getColumn(1).dot(tv)
  if (chaseCammer) {
    bodies[1].getMotionState().getWorldTransform(tranCam)

    chaseCamO = tranCam.getOrigin()
    m_carChassis[cci].getMotionState().getWorldTransform(tranChass)

    // camera should never go underground
    let toPointer = new Ammo.btVector3(chaseCamO.getX(), chaseCamO.getY() - 200, chaseCamO.getZ())
    let rayer = new Ammo.ClosestRayResultCallback(chaseCamO, toPointer)
    dynamicsWorld.rayTest(chaseCamO, toPointer, rayer)
    if (rayer.hasHit())
      groundY = rayer.get_m_hitPointWorld().getY() + 3

    Ammo.destroy(toPointer); toPointer = null
    Ammo.destroy(rayer); rayer = null

    setChaseCam()

    xvelc = tCamPoint.x() - chaseCamO.x()
    yvelc = tCamPoint.y() - chaseCamO.y()
    zvelc = tCamPoint.z() - chaseCamO.z()

    // if(tCamPoint.distance(chaseCamO)>camDist){
    ctFac = 1
    tv.setValue(xvelc * ctFac, yvelc * ctFac, zvelc * ctFac)
    bodies[1].setLinearVelocity(tv)
    bodies[1].getMotionState().getWorldTransform(tranCam)
    // }
    chaseCamO = tranCam.getOrigin()

    camera.position.x = chaseCamO.x()
    camera.position.y = chaseCamO.y()
    camera.position.z = chaseCamO.z()

    if (camera.position.y < groundY) {
      chaseCamO.setY(groundY)
      tranCam.setOrigin(chaseCamO)
    }

    bodies[1].setWorldTransform(tranCam)

    camera.lookAt(new THREE.Vector3(carPos[cci].x(), carPos[cci].y(), carPos[cci].z()))

    if (chaseStarter) {
      setChaseCam()
      tranCam.setIdentity()
      tranCam.setOrigin(tCamPoint)
      if (!worldSwitching[cci]) chaseStarter = false
    }// end if chaseStarter

    bodies[1].setWorldTransform(tranCam)
  }// end if chase cammer

  if (pageUpper)
    if (camHeight < maxCamHeight)
      camHeight *= 1.05
    else camHeight = maxCamHeight

  else if (pageDowner)
    if (camHeight > minCamHeight)
      camHeight *= .95
    else camHeight = minCamHeight
}

function setChaseCam() {
  camDist = camDistS; camHeight = camHeightS

  carRot = m_carChassis[cci].getWorldTransform().getBasis()
  const c2 = new Ammo.btVector3(0, camHeightS, -camDistS)
  const camPointer = new Ammo.btVector3(
    carRot.getRow(0).x() * c2.x() + carRot.getRow(0).y() * c2.y() + carRot.getRow(0).z() * c2.z(),
    carRot.getRow(1).x() * c2.x() + carRot.getRow(1).y() * c2.y() + carRot.getRow(1).z() * c2.z(),
    carRot.getRow(2).x() * c2.x() + carRot.getRow(2).y() * c2.y() + carRot.getRow(2).z() * c2.z()
  )

  const carOrigin = m_carChassis[cci].getWorldTransform().getOrigin()
  tCamPoint.setValue(
    camPointer.x() + carOrigin.x(),
    camPointer.y() + carOrigin.y(),
    camPointer.z() + carOrigin.z()
  )

  tv.setValue(0, 0, 0)
  bodies[1].setLinearVelocity(tv)
  bodies[1].setAngularVelocity(tv)

  camera.position.x = tCamPoint.x()
  camera.position.y = tCamPoint.y()
  camera.position.z = tCamPoint.z()
  camera.lookAt(new THREE.Vector3(carOrigin.x(), carOrigin.y(), carOrigin.z()))
}

function triMeshBuilder(model, scale, positioner) {
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

  }// end all vertex coordinates loop

  const concaveShape = new Ammo.btBvhTriangleMeshShape(trimesh, true)
  triMeshBodyTrans.setIdentity()
  triMeshBodyTrans.setOrigin(positioner)
  const motionStated = new Ammo.btDefaultMotionState(triMeshBodyTrans)
  tv.setValue(0, 0, 0)
  tbody = new Ammo.btRigidBody(0, motionStated, concaveShape, tv)
  tbody.setCollisionFlags(tbody.getCollisionFlags() | 1)
  tbody.setActivationState(DISABLE_DEACTIVATION)
  tbody.setFriction(.1)
  dynamicsWorld.addRigidBody(tbody)
  triMeshBody.push(tbody)
}

function initVehicle(c) {
  const startTransform = new Ammo.btTransform()
  startTransform.setIdentity()
  tv.setValue(1.2, .5, 2.4)
  const chassisShape = new Ammo.btBoxShape(tv)
  const compound = new Ammo.btCompoundShape()
  const localTrans = new Ammo.btTransform()
  localTrans.setIdentity()
  tv.setValue(0, 1, 0)
  localTrans.setOrigin(tv)
  compound.addChildShape(localTrans, chassisShape)
  const mass = 680

  let localInertia = new Ammo.btVector3(1, 1, 1)
  compound.calculateLocalInertia(mass, localInertia)
  const myMotionState = new Ammo.btDefaultMotionState(startTransform)
  const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, compound, localInertia)
  m_carChassis[c] = new Ammo.btRigidBody(rbInfo)
  m_carChassis[c].setFriction(1)
  dynamicsWorld.addRigidBody(m_carChassis[c])
  const ptr = m_carChassis[c].a || m_carChassis[c].ptr
  carObjects[c][ptr] = m_carChassis[c]
  makeVehicle(c)
  Ammo.destroy(localInertia); localInertia = null
}

function makeVehicle(c) {
  m_tuning = new Ammo.btVehicleTuning()
  m_tuning.set_m_suspensionStiffness(suspensionStiffness[c])
  m_tuning.set_m_suspensionCompression(suspensionCompression[c])
  m_tuning.set_m_suspensionDamping(suspensionDamping[c])
  m_tuning.set_m_maxSuspensionTravelCm(maxSuspensionTravelCm[c])
  m_tuning.set_m_frictionSlip(frictionSlip[c])
  m_tuning.set_m_maxSuspensionForce(maxSuspensionForce[c])

  const m_vehicleRayCaster = new Ammo.btDefaultVehicleRaycaster(dynamicsWorld)
  m_vehicle[c] = new Ammo.btRaycastVehicle(m_tuning, m_carChassis[c], m_vehicleRayCaster)
  m_carChassis[c].setActivationState(DISABLE_DEACTIVATION)
  dynamicsWorld.addVehicle(m_vehicle[c])

  // choose coordinate system
  m_vehicle[c].setCoordinateSystem(rightIndex, upIndex, forwardIndex)

  // front wheels
  let isFrontWheel = true
  let connectionPointCS0 = new Ammo.btVector3(0, 0, 0)

  connectionPointCS0.setValue(CUBE_HALF_EXTENTS[c] - (0.3 * wheelWidth[c]), connectionHeight[c], 2 * CUBE_HALF_EXTENTS[c] - wheelRadius[c])

  m_vehicle[c].addWheel(connectionPointCS0, wheelDirectionCS0, wheelAxleCS, suspensionRestLength[c], wheelRadius[c], m_tuning, isFrontWheel)

  connectionPointCS0.setValue(-CUBE_HALF_EXTENTS[c] + (0.3 * wheelWidth[c]), connectionHeight[c], 2 * CUBE_HALF_EXTENTS[c] - wheelRadius[c])

  m_vehicle[c].addWheel(connectionPointCS0, wheelDirectionCS0, wheelAxleCS, suspensionRestLength[c], wheelRadius[c], m_tuning, isFrontWheel)

  isFrontWheel = true // for all wheel drive?

  m_tuning.set_m_frictionSlip(rearWheelFriction[c])

  connectionPointCS0.setValue(-CUBE_HALF_EXTENTS[c] + (0.3 * wheelWidth[c]), connectionHeight[c], -2 * CUBE_HALF_EXTENTS[c] + wheelRadius[c])

  m_vehicle[c].addWheel(connectionPointCS0, wheelDirectionCS0, wheelAxleCS, suspensionRestLength[c], wheelRadius[c], m_tuning, isFrontWheel)

  connectionPointCS0.setValue(CUBE_HALF_EXTENTS[c] - (0.3 * wheelWidth[c]), connectionHeight[c], -2 * CUBE_HALF_EXTENTS[c] + wheelRadius[c])

  m_vehicle[c].addWheel(connectionPointCS0, wheelDirectionCS0, wheelAxleCS, suspensionRestLength[c], wheelRadius[c], m_tuning, isFrontWheel)
  // these last two of the six total wheels are for rendering

  m_tuning.set_m_frictionSlip(rearWheelFriction[c])
  isFrontWheel = true
  connectionPointCS0.setValue(-CUBE_HALF_EXTENTS[c] + (0.3 * wheelWidth[c]), connectionHeight[c], -2 * CUBE_HALF_EXTENTS[c] + wheelRadius[c])

  m_vehicle[c].addWheel(connectionPointCS0, wheelDirectionCS0, wheelAxleCS, suspensionRestLength[c], wheelRadius[c], m_tuning, isFrontWheel)

  connectionPointCS0.setValue(CUBE_HALF_EXTENTS[c] - (0.3 * wheelWidth[c]), connectionHeight[c], -2 * CUBE_HALF_EXTENTS[c] + wheelRadius[c])

  m_vehicle[c].addWheel(connectionPointCS0, wheelDirectionCS0, wheelAxleCS, suspensionRestLength[c], wheelRadius[c], m_tuning, isFrontWheel)

  resetVehicle(c)
  tuneVehicle(c)
  Ammo.destroy(connectionPointCS0); connectionPointCS0 = null
  Ammo.destroy(m_tuning); m_tuning = null
}

function resetVehicle(c) {
  tv.setValue(0, 0, 0)
  if (!tuneup[c]) {// initially reposition
    gVehicleSteering[c] = 0.0
    let carTrans = new Ammo.btTransform()
    m_carChassis[c].setCenterOfMassTransform(carTrans.getIdentity())
    m_carChassis[c].setLinearVelocity(tv)
    m_carChassis[c].setAngularVelocity(tv)
    m_carChassis[c].getMotionState().getWorldTransform(carTrans)
    tv.setValue(0, 0, (c * 10))
    carTrans.setOrigin(tv)
    let quat = new Ammo.btQuaternion()
    quat.setEuler(-Math.PI / 2, 0, 0)
    carTrans.setRotation(quat)

    m_carChassis[c].setWorldTransform(carTrans)

    Ammo.destroy(carTrans); carTrans = null
    Ammo.destroy(quat); quat = null
  }
  dynamicsWorld.getBroadphase().getOverlappingPairCache().cleanProxyFromPairs(m_carChassis[c].getBroadphaseHandle(), dynamicsWorld.getDispatcher())
  if (m_vehicle[c]) {
    m_vehicle[c].resetSuspension()
    for (let i = 0; i < m_vehicle[c].getNumWheels(); i++)
      // synchronize the wheels with the (interpolated) chassis worldtransform
      m_vehicle[c].updateWheelTransform(i, true)
  }
  tuneup[c] = false
}

function tuneVehicle(c) {
  for (let i = 0; i < m_vehicle[c].getNumWheels(); i++) {
    const wheel = m_vehicle[c].getWheelInfo(i)
    wheel.set_m_suspensionStiffness = suspensionStiffness[c]
    wheel.set_m_wheelsDampingRelaxation = suspensionDamping[c]
    wheel.set_m_wheelsDampingCompression = suspensionCompression[c]
    if (i > 1) wheel.m_frictionSlip = rearWheelFriction[c]; else
      wheel.set_m_frictionSlip = frictionSlip[c]

    wheel.set_m_rollInfluence(rollInfluence[c])
    // synchronize the wheels with the (interpolated) chassis worldtransform
    m_vehicle[c].updateWheelTransform(i, true)
  }
  m_vehicle[c].updateSuspension()
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
    let localInertia = new Ammo.btVector3(0, 0, 0)
    if (isDynamic) colShape.calculateLocalInertia(mass, localInertia)
    tv.setValue(0, 0, 0)
    startTransform.setOrigin(tv)
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
    dynamicsWorld.addRigidBody(body)
    bodies.push(body)
    Ammo.destroy(localInertia); localInertia = null
  }
}

function randRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function resetBulletObjects() {
  let clearTrans = new Ammo.btTransform()
  let rx = 0, ry = 0, rz = 0
  for (i = 2; i < bodies.length; i++) {
    clearTrans.setIdentity()
    rx = randRange(-5, 5) * i
    rz = randRange(-5, 5) * i
    ry = -35
    tv.setValue(rx, ry, rz)
    clearTrans.setOrigin(tv)
    bodies[i].setWorldTransform(clearTrans)
    bodies[i].clearForces()
    bodies[i].activate()
  }
  Ammo.destroy(clearTrans); clearTrans = null
}

function decalMaintenance() {
  decalCounter += 2
  if (decalCounter > 120) decalCounter = 0

  if (decals.length > 1000) {
    for (let i = 0; i < decals.length; i++) scene.remove(decals[i])
    decals = []
    decalCounter = 0
  }
}

function tireSmoker(i, smokerModel, xval) {
  if (typeof carModel[cci][0] !== 'undefined') {
    smokerModel.quaternion.set(
      camera.quaternion.x,
      camera.quaternion.y,
      camera.quaternion.z,
      camera.quaternion.w
    )

    if ((moveCarForward[cci] || moveCarBackward[cci]) && Math.abs(kmh[cci]) < maxSpeed[cci] / 4) {
      const s_caro = m_carChassis[cci].getWorldTransform().getBasis()
      smo.setValue(xval, .1, -1.8)
      smo2.setValue(
        s_caro.getRow(0).x() * smo.x() + s_caro.getRow(0).y() * smo.y() + s_caro.getRow(0).z() * smo.z(),
        s_caro.getRow(1).x() * smo.x() + s_caro.getRow(1).y() * smo.y() + s_caro.getRow(1).z() * smo.z(),
        s_caro.getRow(2).x() * smo.x() + s_caro.getRow(2).y() * smo.y() + s_caro.getRow(2).z() * smo.z()
      )
      smo3.setValue(
        smo2.x() + carModel[cci][0].position.x,
        smo2.y() + carModel[cci][0].position.y,
        smo2.z() + carModel[cci][0].position.z
      )
      smo4.set(smo3.x(), smo3.y(), smo3.z())
      smokerModel.position.set(smo4.x, smo4.y, smo4.z)
      smokerModel.material.map = frame[smokerCount3[i]]
      smokerModel.material.visible = true
      smokerModel.material.opacity = 1
      smokerModel.scale.set(.9, .9, .9)
      smoUp[i] = !smoUp[i]
      if (smoUp[i]) smokerCount3[i]++
      if (smokerCount3[i] >= frame.length) smokerCount3[i] = 0
    }
  }
}

function findGround(c) {
  if (typeof worldModel !== 'undefined' && typeof carModel[c] !== 'undefined') {
    m_carChassis[c].getMotionState().getWorldTransform(chassisWorldTrans[c])
    carPos[c] = chassisWorldTrans[c].getOrigin()
    downRayDir.setX(carPos[c].x())
    downRayDir.setY(carPos[c].y() - 2000)
    downRayDir.setZ(carPos[c].z())
    let downRay = new Ammo.ClosestRayResultCallback(carPos[c], downRayDir)
    dynamicsWorld.rayTest(carPos[c], downRayDir, downRay)

    if (downRay.hasHit()) {
      carHeightAboveGround[c] = carPos[c].distance(downRay.get_m_hitPointWorld())

      m_carChassis[c].setDamping(0, 0)

      if (worldSwitching[c]) {
        let pointBelow = downRay.get_m_hitPointWorld()
        m_carChassis[c].getMotionState().getWorldTransform(chassisWorldTrans[c])
        pointBelow.setY(pointBelow.y() + 1)
        chassisWorldTrans[c].setOrigin(pointBelow)
        m_carChassis[c].setWorldTransform(chassisWorldTrans[c])
        Ammo.destroy(pointBelow); pointBelow = null
      }
      worldSwitching[c] = false
    } else {
      let cp = new Ammo.btVector3(carPos[c].x(), carPos[c].y() + 1, carPos[c].z())
      downRayDir.setY(carPos[c].y() + 400)
      downRay = new Ammo.ClosestRayResultCallback(cp, downRayDir)
      dynamicsWorld.rayTest(cp, downRayDir, downRay)
      Ammo.destroy(cp); cp = null
      if (downRay.hasHit()) {
        // do not want ray from car a hitting car b above it, and getting moved above b, so set boolean for car to car hits when raycasting upward
        dp = dynamicsWorld.getDispatcher()
        numMan = dp.getNumManifolds()
        carHit = false

        for (let i = 0; i < numMan; i++) {
          const manifold = dp.getManifoldByIndexInternal(i)
          num_contacts = manifold.getNumContacts()
          if (!(num_contacts === 0)) {
            bodyA = carObjects[c][manifold.getBody0()]
            bodyB = carObjects[c][manifold.getBody1()]
            if (bodyA != bodies[1] && bodyB != bodies[1])
              carHit = true// so do not move car a above car b when b is above a
          }
        }

        if (!carHit) {
          worldSwitching[c] = false
          let pointAbove = downRay.get_m_hitPointWorld()
          m_carChassis[c].setDamping(.99, .99)
          m_carChassis[c].getMotionState().getWorldTransform(chassisWorldTrans[c])
          pointAbove.setY(pointAbove.y() + 1.5)
          chassisWorldTrans[c].setOrigin(pointAbove)
          m_carChassis[c].setWorldTransform(chassisWorldTrans[c])
          Ammo.destroy(pointAbove); pointAbove = null
        }
      }
    }
    Ammo.destroy(downRay); downRay = null
  }
}

function skyInit() {
  scene.background = fogColor
  scene.fog = new THREE.Fog(fogColor, 0, fogFar)
}

function init() {
  container = document.createElement('div')
  container.style.height = window.innerHeight + 'px'
  container.style.width = window.innerWidth + 'px'
  container.focus()
  document.body.appendChild(container)

  camera = new THREE.PerspectiveCamera(70, SCREEN_WIDTH / SCREEN_HEIGHT, .01, 9000)
  scene = new THREE.Scene()

  skyInit()

  bodies.push({})

  initObjects(numObjects)
  for (let i = 1; i < bodies.length; i++)
    scene.add(threeObject[i])

  for (let c = 0; c < numCars; c++)
    initVehicle(c)

  hemiLight = new THREE.HemisphereLight(
    new THREE.Color(0xd7bb60),
    new THREE.Color(0xf0d7bb),
    1.0)
  hemiLight.position.set(0, 1, 0)
  scene.add(hemiLight)

  dirLight = new THREE.DirectionalLight(0xffffff, 2.6)
  dirLight.castShadow = true
  scene.add(dirLight)

  pointLight = new THREE.PointLight(0x0011ff, 5, 200)
  scene.add(pointLight)

  objWorldModelLoader(0, worldFiles[worldID] + '.obj', worldFiles[worldID] + '.mtl', worldScale)

  for (let c = 0; c < numCars; c++)
    for (let i = 0; i < numCars; i++)
      objCarModelLoader(c, i, objFile[c][i], mtlFile[c][i], objScales[c][i])

  // camera.eulerOrder = 'ZYX'
  container.setAttribute('tabindex', -1)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT)
  renderer.toneMapping = THREE.Uncharted2ToneMapping
  renderer.toneMappingExposure = 1.0
  renderer.shadowMap.enabled = true
  renderer.shadowMap.renderReverseSided = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.appendChild(renderer.domElement)

  container.style.paddingLeft = '30px'
  container.style.paddingTop = '10px'
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT)

  let s_geometry = new THREE.BufferGeometry()
  let numFrames = 6
  for (let si = 0; si < numFrames; si++)
    sparks[si] = new THREE.TextureLoader().load('animations/sparks_' + si + '.gif')

  numFrames = 14
  for (let si = 0; si < numFrames; si++)
    frame[si] = new THREE.TextureLoader().load('animations/dirty2_' + si + '.gif')

  s_geometry = new THREE.PlaneGeometry(2, 2, 1, 1)

  s_material = new THREE.MeshPhongMaterial({
    map: frame[0],
    transparent: true,
    color: 0xffffff,
    shininess: 0,
    depthTest: true,
    depthWrite: false,
    opacity: opac
    // side:THREE.DoubleSide
  })

  s_material2 = new THREE.MeshPhongMaterial({
    map: frame[0],
    transparent: true,
    color: 0xffffff,
    shininess: 0,
    depthTest: true,
    depthWrite: false,
    opacity: .3,
    side: THREE.DoubleSide
  })

  s_material3 = new THREE.MeshPhongMaterial({
    map: frame[0],
    transparent: true,
    color: 0xffffff,
    shininess: 0,
    depthTest: true,
    depthWrite: false,
    opacity: .3,
    side: THREE.DoubleSide
  })

  const s_material4 = new THREE.MeshBasicMaterial({
    map: sparks[0],
    transparent: true,
    visible: false,
    color: 0xffffff,
    opacity: .7,
    side: THREE.DoubleSide
  })

  smoker = new THREE.Mesh(s_geometry, s_material)
  smoker.scale.set(.4, .4, .4)
  smoker2 = new THREE.Mesh(s_geometry, s_material2)
  smoker2.scale.set(.6, .6, .6)
  smoker3 = new THREE.Mesh(s_geometry, s_material3)
  smoker4 = new THREE.Mesh(s_geometry, s_material3)

  sparksMesh = new THREE.Mesh(s_geometry, s_material4)
  sparksMesh.receiveShadow = false

  scene.add(smoker)
  scene.add(smoker2)
  scene.add(smoker3)
  scene.add(smoker4)
  scene.add(sparksMesh)
}

function shoot(c) {
  if (carModel[c][0] && carModel[c][1] && worldModel.children[0]) {
    const wheelRot = m_carChassis[c].getWorldTransform().getBasis()
    dec.setValue(-.2, 0, .2)
    dec2.setValue(
      wheelRot.getRow(0).x() * dec.x() + wheelRot.getRow(0).y() * dec.y() + wheelRot.getRow(0).z() * dec.z(),
      wheelRot.getRow(1).x() * dec.x() + wheelRot.getRow(1).y() * dec.y() + wheelRot.getRow(1).z() * dec.z(),
      wheelRot.getRow(2).x() * dec.x() + wheelRot.getRow(2).y() * dec.y() + wheelRot.getRow(2).z() * dec.z()
    )
    dec3.setValue(
      dec2.x() + carModel[c][1].position.x,
      dec2.y() + carModel[c][1].position.y,
      dec2.z() + carModel[c][1].position.z
    )

    p_d.set(dec3.x(), dec3.y(), dec3.z())

    carVel.x = p_d.x - oldCarPos.x
    carVel.y = p_d.y - oldCarPos.y
    carVel.z = p_d.z - oldCarPos.z

    oldCarPos.x = p_d.x
    oldCarPos.y = p_d.y
    oldCarPos.z = p_d.z
    // angle from velocity
    decRot = -fixAngleRad(Math.atan2(carVel.z, carVel.x) + Math.PI / 2)

    r_d.set(0, decRot, 0)
    if (carVel.length() > 2) {
      carVel.x = 0
      carVel.y = 0
      carVel.z = 0
    }
    s_d.set(1, 1, carVel.length())
    material_d = decalMaterial.clone()
    md = new THREE.Mesh(new THREE.DecalGeometry(worldModel.children[0], p_d, r_d, s_d), material_d)
    decals.push(md)
    scene.add(md)

    dec.setValue(.2, 0, .2)
    dec2.setValue(
      wheelRot.getRow(0).x() * dec.x() + wheelRot.getRow(0).y() * dec.y() + wheelRot.getRow(0).z() * dec.z(),
      wheelRot.getRow(1).x() * dec.x() + wheelRot.getRow(1).y() * dec.y() + wheelRot.getRow(1).z() * dec.z(),
      wheelRot.getRow(2).x() * dec.x() + wheelRot.getRow(2).y() * dec.y() + wheelRot.getRow(2).z() * dec.z()
    )
    dec3.setValue(
      dec2.x() + tireClones[c][2].position.x,
      dec2.y() + tireClones[c][2].position.y,
      dec2.z() + tireClones[c][2].position.z
    )
    p_d.set(dec3.x(), dec3.y(), dec3.z())

    carVel.x = p_d.x - oldCarPos2.x
    carVel.y = p_d.y - oldCarPos2.y
    carVel.z = p_d.z - oldCarPos2.z

    oldCarPos2.x = p_d.x
    oldCarPos2.y = p_d.y
    oldCarPos2.z = p_d.z

    decRot = -fixAngleRad(Math.atan2(carVel.z, carVel.x) + Math.PI / 2)
    r_d.set(0, decRot, 0)

    if (carVel.length() > 2) {
      carVel.x = 0; carVel.y = 0; carVel.z = 0
    }
    s_d.set(1, 1, carVel.length())

    md = new THREE.Mesh(new THREE.DecalGeometry(worldModel.children[0], p_d, r_d, s_d), material_d)
    decals.push(md)
    scene.add(md)
  }
}

function objCarModelLoader(c, i, objFile, mtlFile, scale) {
  mtlLoader = new THREE.MTLLoader()
  mtlLoader.load(mtlFile, materials => {
    carMat[c][i] = materials
    materials.preload()
    objLoader = new THREE.OBJLoader()
    objLoader.setMaterials(materials)
    objLoader.load(objFile, object => {
      object.position.set(0, 0, 0)
      carModel[c][i] = object
      carModel[c][i].scale.set(scale, scale, scale)
      carModel[c][i].traverse(
        child => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true
            child.receiveShadow = false
          }
        })
      scene.add(carModel[c][i])
      if (c == cci && i == 0) dirLight.target = carModel[cci][0]

      // make three copies each of tire
      if (i == 1)
        for (let j = 0; j < 3; j++) {
          tireClones[c][j] = carModel[c][i].clone()
          scene.add(tireClones[c][j])
        }
    })
  })
}

function objWorldModelLoader(i, objFile, mtlFile, scale) {
  mtlLoader = new THREE.MTLLoader()
  mtlLoader.load(mtlFile, materials => {
    materials.preload()
    objLoader = new THREE.OBJLoader()
    objLoader.setMaterials(materials)
    objLoader.load(objFile, object => {
      object.position.set(positioner[i].x(), positioner[i].y(), positioner[i].z())
      worldModel = object
      worldModel.scale.set(scale, scale, scale)
      worldModel.traverse(child => {
        child.castShadow = child.receiveShadow = child.isMesh
      })
      triMeshBuilder(worldModel, worldScale, positioner[i])
      scene.add(worldModel)
    })
  })
}

function switchCars() {
  cci++; if (cci >= numCars) cci = 0
  dirLight.target = carModel[cci][0]

  moveCarForward[cci] = false
  moveCarBackward[cci] = false
  gVehicleSteering[cci] = 0
  steerCarLeft[cci] = false
  steerCarRight[cci] = false

  if (chaseCammer) chaseStarter = true
}

/* LOOP */

function updatePhysics() {
  dynamicsWorld.stepSimulation(1 / 60)

  for (let c = 0; c < numCars; c++)
    findGround(c)

  carHitForce = []
  manifolder = []
  highestHitForce = 0
  carHit = false
  dp = dynamicsWorld.getDispatcher()
  numMan = dp.getNumManifolds()

  for (let i = 0; i < numMan; i++) {
    const manifold = dp.getManifoldByIndexInternal(i)
    num_contacts = manifold.getNumContacts()
    if (!(num_contacts === 0)) {
      bodyA = carObjects[cci][manifold.getBody0()]
      bodyB = carObjects[cci][manifold.getBody1()]
      if ((bodyA == m_carChassis[cci] || bodyB == m_carChassis[cci]) && !(bodyA == bodies[1] || bodyB == bodies[1])) {
        carHit = true
        carHitForce.push(manifold.getContactPoint().get_m_appliedImpulse())
        manifolder.push(manifold)
      }
    }
  }

  if (carHitForce.length > 0) {
    highestHitForce = Math.max(...carHitForce)
    for (let i = 0; i < carHitForce.length; i++)
      if (highestHitForce == carHitForce[i]) {
        manifolder[i].getContactPoint().set_m_appliedImpulse(0)
        hitPoint.setX(manifolder[i].getContactPoint().getPositionWorldOnA().x())
        hitPoint.setY(manifolder[i].getContactPoint().getPositionWorldOnA().y())
        hitPoint.setZ(manifolder[i].getContactPoint().getPositionWorldOnA().z())
      }
  }

  if (sparkler) {
    sparksMesh.quaternion.set(
      camera.quaternion.x,
      camera.quaternion.y,
      camera.quaternion.z,
      camera.quaternion.w
    )

    sparksMesh.position.set(hitPoint.x(), hitPoint.y(), hitPoint.z())

    sparksMesh.material.map = sparks[sparksCount]
    sparksMesh.material.visible = true
    sparksMesh.material.opacity = 1
    sparksMesh.scale.set(5, 5, 5)
    sparksCount++
    if (sparksCount >= sparks.length) {
      sparksCount = 0
      sparkler = false
      sparksMesh.material.visible = false
    }
  }

  if (resetBulletObjectsBool) {
    resetBulletObjectsBool = false
    resetBulletObjects()
  }

  for (let c = 0; c < numCars; c++) {
    if (c == cci)
      if (m_vehicle[c].getWheelInfo(2).get_m_skidInfo() < .8 || ((moveCarForward[c] || moveCarBackward[c]) && Math.abs(kmh[c]) < maxSpeed[c] / 4)) {
        shoot(c)
        decalMaintenance()
        tireSmoker(0, smoker3, .9)
        tireSmoker(1, smoker4, -1.1)
      } else {
        smoker3.material.visible = false
        smoker4.material.visible = false
      }

    lastKmh[c] = kmh[c]
    kmh[c] = m_vehicle[c].getCurrentSpeedKmHour()
    steering[c] = (steerCarLeft[c] || steerCarRight[c])

    if (!steering[c])
      gVehicleSteering[c] *= steeringReturnRate[c]
    else if (steering[c])

      if (steerCarLeft[c]) {
        if (gVehicleSteering[c] < .05) gVehicleSteering[c] += .01; else
          gVehicleSteering[c] *= 1 + steeringIncrement[c]

        if (gVehicleSteering[c] > steeringClamp[c]) gVehicleSteering[c] = steeringClamp[c]
      } else
      if (steerCarRight[c]) {
        if (gVehicleSteering[c] > -.05) gVehicleSteering[c] -= .01; else
          gVehicleSteering[c] *= 1 + steeringIncrement[c]

        if (gVehicleSteering[c] < -steeringClamp[c]) gVehicleSteering[c] = -steeringClamp[c]
      }

    // if cars go upside down, flip them
    if (carHeightAboveGround[c] < 3) {
      tv.setValue(0.0, -1.0, 0.0)
      bodRot = m_carChassis[c].getWorldTransform().getBasis().getColumn(1).dot(tv)
      if (bodRot > .8) {
        bodRotTick[c]++; if (bodRotTick[c] > 60) {
          let bodyRot2 = m_carChassis[c].getWorldTransform().getBasis()
          let tempVec2 = new Ammo.btVector3(m_carChassis[c].getLinearVelocity().x(), 10, m_carChassis[c].getLinearVelocity().z())
          m_carChassis[c].setLinearVelocity(tempVec2)
          let tempVec = new Ammo.btVector3(0, 0, -5)
          tempVec2.setValue(
            bodyRot2.getRow(0).x() * tempVec.x() + bodyRot2.getRow(0).y() * tempVec.y() + bodyRot2.getRow(0).z() * tempVec.z(),
            bodyRot2.getRow(1).x() * tempVec.x() + bodyRot2.getRow(1).y() * tempVec.y() + bodyRot2.getRow(1).z() * tempVec.z(),
            bodyRot2.getRow(2).x() * tempVec.x() + bodyRot2.getRow(2).y() * tempVec.y() + bodyRot2.getRow(2).z() * tempVec.z()
          )
          m_carChassis[c].setAngularVelocity(tempVec2)
          Ammo.destroy(tempVec2); tempVec2 = null
          Ammo.destroy(tempVec); tempVec = null
          Ammo.destroy(bodyRot2); bodyRot2 = null
          bodRotTick[c] = 0
        }
      } else bodRotTick[c] = 0
    }

    if (c != cci) moveCarForward[c] = false

    accelerating[c] = (moveCarForward[c] || moveCarBackward[c])

    if (!accelerating[c]) {
      gEngineForce[c] = 0
      if (Math.abs(kmh[c]) > 20) gBreakingForce[c] += 5
    } else if (accelerating[c])
      if (moveCarForward[c] && kmh[c] < maxSpeed[c]) {
        if (kmh[c] < maxSpeed[c] / 5) gEngineForce[c] = maxEngineForce[c] * turboForce; else gEngineForce[c] = maxEngineForce[c]
        gBreakingForce[c] = 0.0
      } else if (moveCarForward[c] && kmh[c] >= maxSpeed[c]) {
        gEngineForce[c] = 0.0
        gBreakingForce[c] = 0.0
      } else if (moveCarBackward[c] && kmh[c] > -maxSpeed[c]) {
        gEngineForce[c] = -maxEngineForce[c]
        gBreakingForce[c] = 0.0
      } else if (moveCarBackward[c] && kmh[c] <= maxSpeed[c]) {
        gEngineForce[c] = 0.0
        gBreakingForce[c] = 0.0
      }

    // 0,1 front; 2,3 back
    m_vehicle[c].applyEngineForce(gEngineForce[c], 0)
    m_vehicle[c].setBrake(gBreakingForce[c], 0)
    m_vehicle[c].setSteeringValue(gVehicleSteering[c], 0)
    m_vehicle[c].setSteeringValue(-gVehicleSteering[c] * 1.2, 4)// for drifting, 5th wheel (rear)

    m_vehicle[c].applyEngineForce(gEngineForce[c], 4)
    m_vehicle[c].applyEngineForce(gEngineForce[c], 1)
    m_vehicle[c].setBrake(gBreakingForce[c], 1)
    m_vehicle[c].setSteeringValue(gVehicleSteering[c], 1)
    m_vehicle[c].setSteeringValue(-gVehicleSteering[c] * 1.2, 5) // for drifting, 6th wheel (rear)
    m_vehicle[c].applyEngineForce(gEngineForce[c], 5)

    // chassis
    m_carChassis[c].getMotionState().getWorldTransform(chassisWorldTrans[c])
    carPos[c] = chassisWorldTrans[c].getOrigin()

    for (let i = 0; i < numCars; i++)
      if (typeof carModel[c][i] !== 'undefined') {
        carModel[c][i].position.set(carPos[c].x(), carPos[c].y(), carPos[c].z())
        carModel[c][i].quaternion.set(
          chassisWorldTrans[c].getRotation().x(),
          chassisWorldTrans[c].getRotation().y(),
          chassisWorldTrans[c].getRotation().z(),
          chassisWorldTrans[c].getRotation().w()
        )

        if (c == cci && i == 0) {
          if (chaseCammer)
            dirLight.position.set(carPos[c].x(), carPos[c].y() + 250, carPos[c].z())
          else
            dirLight.position.set(
              camera.position.x,
              camera.position.y + 250,
              camera.position.z
            )

          smoker.quaternion.set(
            camera.quaternion.x,
            camera.quaternion.y,
            camera.quaternion.z,
            camera.quaternion.w
          )
          smoker2.quaternion.set(
            camera.quaternion.x,
            camera.quaternion.y,
            camera.quaternion.z,
            camera.quaternion.w
          )

          const s_caro = m_carChassis[c].getWorldTransform().getBasis()

          // first smoker
          smo.setValue(-.5, .3, -2.7)
          smo2.setValue(
            s_caro.getRow(0).x() * smo.x() + s_caro.getRow(0).y() * smo.y() + s_caro.getRow(0).z() * smo.z(),
            s_caro.getRow(1).x() * smo.x() + s_caro.getRow(1).y() * smo.y() + s_caro.getRow(1).z() * smo.z(),
            s_caro.getRow(2).x() * smo.x() + s_caro.getRow(2).y() * smo.y() + s_caro.getRow(2).z() * smo.z()
          )
          smo3.setValue(
            smo2.x() + carModel[c][0].position.x,
            smo2.y() + carModel[c][0].position.y,
            smo2.z() + carModel[c][0].position.z
          )
          smo4.set(smo3.x(), smo3.y(), smo3.z())
          smoker.position.set(smo4.x, smo4.y, smo4.z)

          smoker.material.map = frame[smokerCount]
          if (opacDown) opac -= .02; else opac += .02
          if (opac < .4) opacDown = false; else if (opac > 1.5) opacDown = true
          smoker.material.opacity = opac
          smokerCount++; if (smokerCount > frame.length - 1) smokerCount = 0

          // second smoker
          smo.setValue(-.5, .3, -2.95)
          smo2.setValue(
            s_caro.getRow(0).x() * smo.x() + s_caro.getRow(0).y() * smo.y() + s_caro.getRow(0).z() * smo.z(),
            s_caro.getRow(1).x() * smo.x() + s_caro.getRow(1).y() * smo.y() + s_caro.getRow(1).z() * smo.z(),
            s_caro.getRow(2).x() * smo.x() + s_caro.getRow(2).y() * smo.y() + s_caro.getRow(2).z() * smo.z()
          )
          smo3.setValue(
            smo2.x() + carModel[c][0].position.x,
            smo2.y() + carModel[c][0].position.y,
            smo2.z() + carModel[c][0].position.z
          )
          smo4.set(smo3.x(), smo3.y(), smo3.z())
          smoker2.position.set(smo4.x, smo4.y, smo4.z)
          smoker2.material.map = frame[smokerCount2]
          smoker2.material.opacity = .5
          smoker2Scale = .5
          smoker2.scale.set(smoker2Scale, smoker2Scale, smoker2Scale)
          smokerCount2++; if (smokerCount2 > frame.length - 1) smokerCount2 = 0
        }
      }

    // wheels, index 0 is chassis shape
    for (let i = 0; i < 4; i++) {
      // synchronize the wheels with the (interpolated) chassis worldtransform
      m_vehicle[c].updateWheelTransform(i, true)
      wheelTrans = m_vehicle[c].getWheelInfo(i).get_m_worldTransform()
      const p = wheelTrans.getOrigin()
      const q = wheelTrans.getRotation()
      // clones of tire and hub
      if (i < 3) {
        if (typeof tireClones[c][i] !== 'undefined') {
          tireClones[c][i].position.set(p.x(), p.y(), p.z())
          tireClones[c][i].quaternion.set(q.x(), q.y(), q.z(), q.w())
          if (i == 0) tireClones[c][i].rotateY(- Math.PI)
        }
        if (typeof hubClones[c][i] !== 'undefined') {
          hubClones[c][i].position.set(p.x(), p.y(), p.z())
          hubClones[c][i].quaternion.set(q.x(), q.y(), q.z(), q.w())
          if (i == 0) hubClones[c][i].rotateY(- Math.PI)
        }
      } else if (i == 3)
        // original copy of tire and hub for wheels
        if (typeof carModel[c][1] !== 'undefined') {
          carModel[c][1].position.set(p.x(), p.y(), p.z())
          carModel[c][1].quaternion.set(q.x(), q.y(), q.z(), q.w())
          carModel[c][1].rotateY(- Math.PI)
        }
    }
  }

  // index 0 is ground, index 1 is camera
  for (let i = 2; i < bodies.length; i++) {
    bodies[i].getMotionState().getWorldTransform(obTrans)
    const p = obTrans.getOrigin()
    const q = obTrans.getRotation()
    threeObject[i].position.set(p.x(), p.y(), p.z())
    threeObject[i].quaternion.set(q.x(), q.y(), q.z(), q.w())
  }
}

function updateDecals() {
  decals.forEach(decal => {
    decal.material.opacity -= .001
    if (decal.material.opacity <= 0) scene.remove(decal)
  })
  decals = decals.filter(decal => decal.material.opacity <= 0)
}

void function animate() {
  requestAnimationFrame(animate)
  dt = clock.getDelta()
  updatePhysics()
  updateDecals()
  updateCamera(dt)
  renderer.render(scene, camera)
}()

/* EVENTS */

const onKeyDowner = function(event) {
  switch (event.key) {
    case 'ArrowUp':
    case 'w':
      moveCarForward[cci] = true
      break
    case 'ArrowLeft':
    case 'a':
      steerCarLeft[cci] = true
      break
    case 'ArrowDown':
    case 's':
      moveCarBackward[cci] = true
      break
    case 'ArrowRight':
    case 'd':
      steerCarRight[cci] = true
      break
    case ' ': // spacebar
      gBreakingForce[cci] = maxBreakingForce[cci] * 2
      gEngineForce[cci] = 0.0
      break
    case '4':
      switchCars()
      break
    case '8':
      moveCarForward[cci] = false
      steerCarLeft[cci] = false
      steerCarRight[cci] = false
      gVehicleSteering[cci] = 0
      break
    case 't':
      break
    case 'PageUp':
      pageUpper = true
      break
    case 'PageDown':
      pageDowner = true
      break
  }

  event.repeat = false
}

const onKeyUpper = function(event) {
  switch (event.key) {
    case 'ArrowUp':
    case 'w':
      moveCarForward[cci] = false
      break

    case 'ArrowLeft':
    case 'a':
      steerCarLeft[cci] = false
      break

    case 'ArrowDown':
    case 's':
      moveCarBackward[cci] = false
      break

    case 'ArrowRight':
    case 'd':
      steerCarRight[cci] = false
      break

    case 'PageUp':
      pageUpper = false
      break
    case 'PageDown':
      pageDowner = false
      break
  }
}

container.addEventListener('keydown', onKeyDowner, false)
container.addEventListener('keyup', onKeyUpper, false)
