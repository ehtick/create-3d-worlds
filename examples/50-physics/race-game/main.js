/* global THREE, Ammo */
const SCREEN_HEIGHT = window.innerHeight
const SCREEN_WIDTH = window.innerWidth

let camera, scene, renderer, hemiLight, dirLight, pointLight, worldModel
const textureLoader = new THREE.TextureLoader()
const decalDiffuse = textureLoader.load('track5.png')
const tv = new Ammo.btVector3(0, 0, 0)
const tCamPoint = new Ammo.btVector3(0, 0, 0)
const downRayDir = new Ammo.btVector3(0, 0, 0)
const center = new Ammo.btVector3(0, -38, 0)

const velocity = new THREE.Vector3(0, 0, 0)
const oldCarPos = new THREE.Vector3(0, 0, 0)
const oldCarPos2 = new THREE.Vector3(0, 0, 0)
let decRot = 0
let decals = []

const worldScale = 25

const carNames = ['hummer', 'lada']
const numCars = carNames.length
const currentCarIndex = 0

const carModel = []
const tireClones = []
const hubClones = []
const objScales = []
const carHeightAboveGround = []
const objFile = [
  ['hummer.obj', 'hummerTire.obj'],
  ['ladavaz.obj', 'ladavazTire.obj'],
]
const mtlFile = [
  ['hummer.mtl', 'hummerTire.mtl'],
  ['ladavaz.mtl', 'ladavazTire.mtl'],
]
for (let i = 0; i < numCars; i++) {
  carHeightAboveGround[i] = 0
  objScales[i] = [.57, .57]
}

const DISABLE_DEACTIVATION = 4
const numObjects = 2 // ground is 0, camera is 1

const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration()
const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration)
const worldMin = new Ammo.btVector3(-1000, -1000, -1000)
const worldMax = new Ammo.btVector3(1000, 1000, 1000)
const overlappingPairCache = new Ammo.btAxisSweep3(worldMin, worldMax)
const solver = new Ammo.btSequentialImpulseConstraintSolver()

const physicsWorld = new Ammo.btDiscreteDynamicsWorld(
  dispatcher, overlappingPairCache, solver, collisionConfiguration
)

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
const maxSuspensionTravelCm = []
const maxSuspensionForce = []
const CUBE_HALF_EXTENTS = [.96, 1.12, .97, 1., .94, .99, .99]
const suspensionRestLength = [1.1, 1.05, 1.1, 1.25, 1.1, 1.2, 1.2]
const connectionHeight = []

const kmh = []
const lastKmh = []
const steering = []
const accelerating = []
const moveForward = []
const moveBackward = []
const steerLeft = []
const steerRight = []
let m_tuning

const coordi = []
const numCoords = 100
const coordx = []
const coordz = []
const bodRotTick = []

const body = []
const vehicle = []
const carPos = []
const carMat = []
const chassisWorldTrans = []
const tuneup = []
const carObjects = []

for (let c = 0; c < numCars; c++) {
  bodRotTick[c] = 0
  coordi[c] = 0
  coordx[c] = []
  coordz[c] = []

  for (let i = 0; i < numCoords; i++) {
    coordx[c][i] = coordx[0][i]
    coordz[c][i] = coordz[0][i]
  }

  maxSpeed[c] = 150.0
  goingTooFast[c] = false
  spinningTooFast[c] = false
  kmh[c] = .00001
  lastKmh[c] = kmh[c]
  steering[c] = false
  accelerating[c] = false
  moveForward[c] = false
  moveBackward[c] = false
  steerLeft[c] = false
  steerRight[c] = false

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
  body[c] = []
  vehicle[c] = []
  carModel[c] = []
  tireClones[c] = []
  hubClones[c] = []
  carPos[c] = new Ammo.btVector3(0, 0, 0)
  carMat[c] = []
  chassisWorldTrans[c] = new Ammo.btTransform()
  tuneup[c] = false
}

tv.setValue(0, -40, 0)
physicsWorld.setGravity(tv)

const triMeshBody = []
let tbody

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

function setChaseCam(camHeight = 4, camDist = 8) {
  const carRot = body[currentCarIndex].getWorldTransform().getBasis()
  const c2 = new Ammo.btVector3(0, camHeight, -camDist)
  const camPointer = new Ammo.btVector3(
    carRot.getRow(0).x() * c2.x() + carRot.getRow(0).y() * c2.y() + carRot.getRow(0).z() * c2.z(),
    carRot.getRow(1).x() * c2.x() + carRot.getRow(1).y() * c2.y() + carRot.getRow(1).z() * c2.z(),
    carRot.getRow(2).x() * c2.x() + carRot.getRow(2).y() * c2.y() + carRot.getRow(2).z() * c2.z()
  )

  const carOrigin = body[currentCarIndex].getWorldTransform().getOrigin()
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
  tv.setValue(0, 0, 0)
  tbody = new Ammo.btRigidBody(0, motionStated, concaveShape, tv)
  tbody.setCollisionFlags(tbody.getCollisionFlags() | 1)
  tbody.setActivationState(DISABLE_DEACTIVATION)
  tbody.setFriction(.1)
  physicsWorld.addRigidBody(tbody)
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

  const localInertia = new Ammo.btVector3(1, 1, 1)
  compound.calculateLocalInertia(mass, localInertia)
  const myMotionState = new Ammo.btDefaultMotionState(startTransform)
  const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, compound, localInertia)
  body[c] = new Ammo.btRigidBody(rbInfo)
  body[c].setFriction(1)
  physicsWorld.addRigidBody(body[c])
  const ptr = body[c].a || body[c].ptr
  carObjects[c][ptr] = body[c]
  makeVehicle(c)
}

function makeVehicle(c) {
  m_tuning = new Ammo.btVehicleTuning()
  m_tuning.set_m_suspensionStiffness(suspensionStiffness[c])
  m_tuning.set_m_suspensionCompression(suspensionCompression[c])
  m_tuning.set_m_suspensionDamping(suspensionDamping[c])
  m_tuning.set_m_maxSuspensionTravelCm(maxSuspensionTravelCm[c])
  m_tuning.set_m_frictionSlip(frictionSlip[c])
  m_tuning.set_m_maxSuspensionForce(maxSuspensionForce[c])

  const m_vehicleRayCaster = new Ammo.btDefaultVehicleRaycaster(physicsWorld)
  vehicle[c] = new Ammo.btRaycastVehicle(m_tuning, body[c], m_vehicleRayCaster)
  body[c].setActivationState(DISABLE_DEACTIVATION)
  physicsWorld.addAction(vehicle[c])

  // choose coordinate system
  vehicle[c].setCoordinateSystem(rightIndex, upIndex, forwardIndex)

  // front wheels
  let isFrontWheel = true
  const connectionPointCS0 = new Ammo.btVector3(0, 0, 0)

  connectionPointCS0.setValue(CUBE_HALF_EXTENTS[c] - (0.3 * wheelWidth[c]), connectionHeight[c], 2 * CUBE_HALF_EXTENTS[c] - wheelRadius[c])

  vehicle[c].addWheel(connectionPointCS0, wheelDirectionCS0, wheelAxleCS, suspensionRestLength[c], wheelRadius[c], m_tuning, isFrontWheel)

  connectionPointCS0.setValue(-CUBE_HALF_EXTENTS[c] + (0.3 * wheelWidth[c]), connectionHeight[c], 2 * CUBE_HALF_EXTENTS[c] - wheelRadius[c])

  vehicle[c].addWheel(connectionPointCS0, wheelDirectionCS0, wheelAxleCS, suspensionRestLength[c], wheelRadius[c], m_tuning, isFrontWheel)

  isFrontWheel = true // for all wheel drive?

  m_tuning.set_m_frictionSlip(rearWheelFriction[c])

  connectionPointCS0.setValue(-CUBE_HALF_EXTENTS[c] + (0.3 * wheelWidth[c]), connectionHeight[c], -2 * CUBE_HALF_EXTENTS[c] + wheelRadius[c])

  vehicle[c].addWheel(connectionPointCS0, wheelDirectionCS0, wheelAxleCS, suspensionRestLength[c], wheelRadius[c], m_tuning, isFrontWheel)

  connectionPointCS0.setValue(CUBE_HALF_EXTENTS[c] - (0.3 * wheelWidth[c]), connectionHeight[c], -2 * CUBE_HALF_EXTENTS[c] + wheelRadius[c])

  vehicle[c].addWheel(connectionPointCS0, wheelDirectionCS0, wheelAxleCS, suspensionRestLength[c], wheelRadius[c], m_tuning, isFrontWheel)
  // these last two of the six total wheels are for rendering

  m_tuning.set_m_frictionSlip(rearWheelFriction[c])
  isFrontWheel = true
  connectionPointCS0.setValue(-CUBE_HALF_EXTENTS[c] + (0.3 * wheelWidth[c]), connectionHeight[c], -2 * CUBE_HALF_EXTENTS[c] + wheelRadius[c])

  vehicle[c].addWheel(connectionPointCS0, wheelDirectionCS0, wheelAxleCS, suspensionRestLength[c], wheelRadius[c], m_tuning, isFrontWheel)

  connectionPointCS0.setValue(CUBE_HALF_EXTENTS[c] - (0.3 * wheelWidth[c]), connectionHeight[c], -2 * CUBE_HALF_EXTENTS[c] + wheelRadius[c])

  vehicle[c].addWheel(connectionPointCS0, wheelDirectionCS0, wheelAxleCS, suspensionRestLength[c], wheelRadius[c], m_tuning, isFrontWheel)
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
    physicsWorld.addRigidBody(body)
    bodies.push(body)
  }
}

function findGround(c) {
  if (worldModel && carModel[c]) {
    body[c].getMotionState().getWorldTransform(chassisWorldTrans[c])
    carPos[c] = chassisWorldTrans[c].getOrigin()
    downRayDir.setX(carPos[c].x())
    downRayDir.setY(carPos[c].y() - 2000)
    downRayDir.setZ(carPos[c].z())
    let downRay = new Ammo.ClosestRayResultCallback(carPos[c], downRayDir)
    physicsWorld.rayTest(carPos[c], downRayDir, downRay)

    if (downRay.hasHit()) {
      const hPoint = downRay.get_m_hitPointWorld()
      const distanceToGround = new THREE.Vector3(carPos[c].x(), carPos[c].y(), carPos[c].z())
        .distanceTo(new THREE.Vector3(hPoint.x(), hPoint.y(), hPoint.z()))
      carHeightAboveGround[c] = distanceToGround
      body[c].setDamping(0, 0)
    } else {
      const cp = new Ammo.btVector3(carPos[c].x(), carPos[c].y() + 1, carPos[c].z())
      downRayDir.setY(carPos[c].y() + 400)
      downRay = new Ammo.ClosestRayResultCallback(cp, downRayDir)
      physicsWorld.rayTest(cp, downRayDir, downRay)
      if (downRay.hasHit()) {
        const pointAbove = downRay.get_m_hitPointWorld()
        body[c].setDamping(.99, .99)
        body[c].getMotionState().getWorldTransform(chassisWorldTrans[c])
        pointAbove.setY(pointAbove.y() + 1.5)
        chassisWorldTrans[c].setOrigin(pointAbove)
        body[c].setWorldTransform(chassisWorldTrans[c])
      }
    }
  }
}

function skyInit() {
  const fogColor = new THREE.Color(0xae9a7b)
  scene.background = fogColor
  scene.fog = new THREE.Fog(fogColor, 0, 500)
}

function init() {
  const container = document.createElement('div')
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

  objWorldModelLoader('courser14a.obj', 'courser14a.mtl', worldScale)

  for (let c = 0; c < numCars; c++)
    for (let i = 0; i < numCars; i++)
      objCarModelLoader(c, i, objFile[c][i], mtlFile[c][i], objScales[c][i])

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

  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT)
}

function shoot(i) {
  const dec = new Ammo.btVector3(0, 0, 0)
  const dec2 = new Ammo.btVector3(0, 0, 0)
  const dec3 = new Ammo.btVector3(0, 0, 0)

  const p_d = new THREE.Vector3(0, 0, 0)
  const r_d = new THREE.Euler(0, 0, 0, 'XYZ')
  const s_d = new THREE.Vector3(90, 90, 90)

  if (carModel[i][0] && carModel[i][1] && worldModel.children[0]) {
    const wheelRot = body[i].getWorldTransform().getBasis()
    dec.setValue(-.2, 0, .2)
    dec2.setValue(
      wheelRot.getRow(0).x() * dec.x() + wheelRot.getRow(0).y() * dec.y() + wheelRot.getRow(0).z() * dec.z(),
      wheelRot.getRow(1).x() * dec.x() + wheelRot.getRow(1).y() * dec.y() + wheelRot.getRow(1).z() * dec.z(),
      wheelRot.getRow(2).x() * dec.x() + wheelRot.getRow(2).y() * dec.y() + wheelRot.getRow(2).z() * dec.z()
    )
    dec3.setValue(
      dec2.x() + carModel[i][1].position.x,
      dec2.y() + carModel[i][1].position.y,
      dec2.z() + carModel[i][1].position.z
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
    let md = new THREE.Mesh(new THREE.DecalGeometry(worldModel.children[0], p_d, r_d, s_d), material_d)
    decals.push(md)
    scene.add(md)

    dec.setValue(.2, 0, .2)
    dec2.setValue(
      wheelRot.getRow(0).x() * dec.x() + wheelRot.getRow(0).y() * dec.y() + wheelRot.getRow(0).z() * dec.z(),
      wheelRot.getRow(1).x() * dec.x() + wheelRot.getRow(1).y() * dec.y() + wheelRot.getRow(1).z() * dec.z(),
      wheelRot.getRow(2).x() * dec.x() + wheelRot.getRow(2).y() * dec.y() + wheelRot.getRow(2).z() * dec.z()
    )
    dec3.setValue(
      dec2.x() + tireClones[i][2].position.x,
      dec2.y() + tireClones[i][2].position.y,
      dec2.z() + tireClones[i][2].position.z
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

    md = new THREE.Mesh(new THREE.DecalGeometry(worldModel.children[0], p_d, r_d, s_d), material_d)
    decals.push(md)
    scene.add(md)
  }
}

function objCarModelLoader(c, i, objFile, mtlFile, scale) {
  const mtlLoader = new THREE.MTLLoader()
  mtlLoader.load(mtlFile, materials => {
    carMat[c][i] = materials
    materials.preload()
    const objLoader = new THREE.OBJLoader()
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

      // make three copies each of tire
      if (i == 1)
        for (let j = 0; j < 3; j++) {
          tireClones[c][j] = carModel[c][i].clone()
          scene.add(tireClones[c][j])
        }
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
      worldModel = object
      worldModel.scale.set(scale, scale, scale)
      worldModel.traverse(child => {
        child.castShadow = child.receiveShadow = child.isMesh
      })
      triMeshBuilder(worldModel, worldScale)
      scene.add(worldModel)
    })
  })
}

/* LOOP */

function updatePhysics() {
  physicsWorld.stepSimulation(1 / 60)

  for (let c = 0; c < numCars; c++) {
    findGround(c)
    // if (c == currentCarIndex)
    //   if (vehicle[c].getWheelInfo(2).get_m_skidInfo() < .8 || ((moveForward[c] || moveBackward[c]) && Math.abs(kmh[c]) < maxSpeed[c] / 4))
    //     shoot(c)

    lastKmh[c] = kmh[c]
    kmh[c] = vehicle[c].getCurrentSpeedKmHour()
    steering[c] = (steerLeft[c] || steerRight[c])

    if (!steering[c])
      gVehicleSteering[c] *= steeringReturnRate[c]
    else if (steering[c])

      if (steerLeft[c]) {
        if (gVehicleSteering[c] < .05) gVehicleSteering[c] += .01; else
          gVehicleSteering[c] *= 1 + steeringIncrement[c]

        if (gVehicleSteering[c] > steeringClamp[c]) gVehicleSteering[c] = steeringClamp[c]
      } else
      if (steerRight[c]) {
        if (gVehicleSteering[c] > -.05) gVehicleSteering[c] -= .01; else
          gVehicleSteering[c] *= 1 + steeringIncrement[c]

        if (gVehicleSteering[c] < -steeringClamp[c]) gVehicleSteering[c] = -steeringClamp[c]
      }

    accelerating[c] = (moveForward[c] || moveBackward[c])

    if (!accelerating[c]) {
      gEngineForce[c] = 0
      if (Math.abs(kmh[c]) > 20) gBreakingForce[c] += 5
    } else if (accelerating[c])
      if (moveForward[c] && kmh[c] < maxSpeed[c]) {
        if (kmh[c] < maxSpeed[c] / 5) gEngineForce[c] = maxEngineForce[c] * turboForce; else gEngineForce[c] = maxEngineForce[c]
        gBreakingForce[c] = 0.0
      } else if (moveForward[c] && kmh[c] >= maxSpeed[c]) {
        gEngineForce[c] = 0.0
        gBreakingForce[c] = 0.0
      } else if (moveBackward[c] && kmh[c] > -maxSpeed[c]) {
        gEngineForce[c] = -maxEngineForce[c]
        gBreakingForce[c] = 0.0
      } else if (moveBackward[c] && kmh[c] <= maxSpeed[c]) {
        gEngineForce[c] = 0.0
        gBreakingForce[c] = 0.0
      }

    // 0,1 front; 2,3 back
    vehicle[c].applyEngineForce(gEngineForce[c], 0)
    vehicle[c].setBrake(gBreakingForce[c], 0)
    vehicle[c].setSteeringValue(gVehicleSteering[c], 0)
    vehicle[c].setSteeringValue(-gVehicleSteering[c] * 1.2, 4)// for drifting, 5th wheel (rear)

    vehicle[c].applyEngineForce(gEngineForce[c], 4)
    vehicle[c].applyEngineForce(gEngineForce[c], 1)
    vehicle[c].setBrake(gBreakingForce[c], 1)
    vehicle[c].setSteeringValue(gVehicleSteering[c], 1)
    vehicle[c].setSteeringValue(-gVehicleSteering[c] * 1.2, 5) // for drifting, 6th wheel (rear)
    vehicle[c].applyEngineForce(gEngineForce[c], 5)

    // chassis
    body[c].getMotionState().getWorldTransform(chassisWorldTrans[c])
    carPos[c] = chassisWorldTrans[c].getOrigin()

    for (let i = 0; i < numCars; i++)
      if (carModel[c][i]) {
        carModel[c][i].position.set(carPos[c].x(), carPos[c].y(), carPos[c].z())
        carModel[c][i].quaternion.set(
          chassisWorldTrans[c].getRotation().x(),
          chassisWorldTrans[c].getRotation().y(),
          chassisWorldTrans[c].getRotation().z(),
          chassisWorldTrans[c].getRotation().w()
        )
      }

    // wheels, index 0 is chassis shape
    for (let i = 0; i < 4; i++) {
      // synchronize the wheels with the (interpolated) chassis worldtransform
      vehicle[c].updateWheelTransform(i, true)
      wheelTrans = vehicle[c].getWheelInfo(i).get_m_worldTransform()
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
        if (carModel[c][1]) {
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

function fadeDecals() {
  decals.forEach(decal => {
    decal.material.opacity -= .001
    if (decal.material.opacity <= 0) scene.remove(decal)
  })
  decals = decals.filter(decal => decal.material.opacity > 0)
}

void function animate() {
  requestAnimationFrame(animate)
  updatePhysics()
  fadeDecals()
  setChaseCam()
  renderer.render(scene, camera)
}()

/* EVENTS */

const onKeyDowner = function(event) {
  switch (event.key) {
    case 'ArrowUp':
    case 'w':
      moveForward[currentCarIndex] = true
      break
    case 'ArrowLeft':
    case 'a':
      steerLeft[currentCarIndex] = true
      break
    case 'ArrowDown':
    case 's':
      moveBackward[currentCarIndex] = true
      break
    case 'ArrowRight':
    case 'd':
      steerRight[currentCarIndex] = true
      break
    case ' ': // spacebar
      gBreakingForce[currentCarIndex] = maxBreakingForce[currentCarIndex] * 2
      gEngineForce[currentCarIndex] = 0.0
      break
    case '8':
      moveForward[currentCarIndex] = false
      steerLeft[currentCarIndex] = false
      steerRight[currentCarIndex] = false
      gVehicleSteering[currentCarIndex] = 0
      break
  }
}

const onKeyUpper = function(event) {
  switch (event.key) {
    case 'ArrowUp':
    case 'w':
      moveForward[currentCarIndex] = false
      break
    case 'ArrowLeft':
    case 'a':
      steerLeft[currentCarIndex] = false
      break
    case 'ArrowDown':
    case 's':
      moveBackward[currentCarIndex] = false
      break
    case 'ArrowRight':
    case 'd':
      steerRight[currentCarIndex] = false
      break
  }
}

document.addEventListener('keydown', onKeyDowner, false)
document.addEventListener('keyup', onKeyUpper, false)
