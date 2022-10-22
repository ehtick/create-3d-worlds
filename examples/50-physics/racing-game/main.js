const worldFiles = ['courser14a']
let worldModel
let worldMat

let mouseX = 0
let mouseY = 0
let mouseDragOn = false
let rightButtonDown = false
const viewHalfX = 0
const viewHalfY = 0

const camAndKeyFunction = function () {
  camera.eulerOrder = 'ZYX'
  container.setAttribute('tabindex', -1)

  onKeyDowner = function (event) {
    if (!typing) {
      // event.preventDefault();
      if (event.key == 'z') altKey = true
      switch (event.key) {

        case 'v':
          if (camPresets < 6) camPresets++; else camPresets = 0
          if (camPresets != 6) camSwitcher(0)
          switch (camPresets) {
            case 0:
              camDist = camDistS; camHeight = camHeightS; camTilt = camTiltS; camRotateCar = 0
              break
            case 1:
              camDist = 5.65; camHeight = 2.45; camTilt = -.54; camRotateCar = 0
              break
            case 2:
              camDist = 3.94; camHeight = 2.45; camTilt = -.54; camRotateCar = Math.PI
              break
            case 3:
              camDist = 3.94; camHeight = 2.45; camTilt = -.49; camRotateCar = Math.PI / 2
              break
            case 4:
              camDist = 17.03; camHeight = 12.52; camTilt = -.67; camRotateCar = 0
              break
            case 5:
              camDist = 31.45; camHeight = 21.49; camTilt = -.58; camRotateCar = -Math.PI
              break
            case 6:
              camDist = camDistS; camHeight = camHeightS; camTilt = camTiltS; camRotateCar = 0
              camSwitcher(1)
              chaseStarter = true
              break
          }

          break
        case 'b':
          if (chaseCammer) {
            if (camZoomer > .3) camZoomer -= .1; else camZoomer = .3
            camera.zoom = camZoomer
            camera.updateProjectionMatrix()
          }
          break
        case 'n':
          if (chaseCammer) {
            if (camZoomer < 7) camZoomer += .1; else camZoomer = 7
            camera.zoom = camZoomer
            camera.updateProjectionMatrix()
          }
          break
        case 'y':
          break
        case 'ArrowUp':
        case 'w':
          moveCarForward[cci] = true
          iamaRobot = false
          if (!engineSound.isPlaying) engineSound.play()
          break
        case 'ArrowLeft':
        case 'a':
          iamaRobot = false
          steerCarLeft[cci] = true
          break
        case 'ArrowDown':
        case 's':
          iamaRobot = false
          moveCarBackward[cci] = true
          if (!engineSound.isPlaying) engineSound.play()
          break
        case 'ArrowRight':
        case 'd':
          iamaRobot = false
          steerCarRight[cci] = true
          break
        case ' ': // spacebar
          gBreakingForce[cci] = maxBreakingForce[cci] * 2
          gEngineForce[cci] = 0.0
          iamaRobot = false
          break
        case 'Escape': // esc
          break
        case 'g':
          decalRayCast()
          break
        case 'i':
          if (el('opener').style.visibility == 'visible')
            el('opener').style.visibility = 'hidden'
          else
            el('opener').style.visibility = 'visible'
          break
        case 'm':
          muted = !muted
          if (muted) soundListener.setMasterVolume(0); else soundListener.setMasterVolume(1)
          break
        case 'o':
          menuSwitch()
          break
        case 'p':
          menuSwitch()
          break
        case '0':
          lifter = true
          break
        case '1':
          camSwitcher(0)
          break
        case '2':
          camSwitcher(1)
          break
        case '3':
          if (camid !== 2) camSwitcher(2); else camSwitcher(1)
          break
        case '4':
          switchCars()
          break
        case '7':
          roboCars = !roboCars
          if (!roboCars) moveCarForward[cci] = false
          break
        case '8':
          iamaRobot = !iamaRobot
          if (iamaRobot) roboCars = true; else {
            moveCarForward[cci] = false; steerCarLeft[cci] = false; steerCarRight[cci] = false; gVehicleSteering[cci] = 0
          }
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

    }
    event.repeat = false
  }// end on key down

  onKeyUpper = function (event) {
    if (event.key = 'z') altKey = false
    switch (event.key) {
      case '0':
        lifter = false
        break
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
        iamaRobot = false
        moveCarBackward[cci] = false
        break

      case 'ArrowRight':
      case 'd':
        iamaRobot = false
        steerCarRight[cci] = false
        break

      case 'PageUp':
        pageUpper = false
        break
      case 'PageDown':
        pageDowner = false
        break
    }

  }// end on key up

  function contextmenu(event) {
    event.preventDefault()
  }

  container.addEventListener('contextmenu', contextmenu, false)
  container.addEventListener('keydown', onKeyDowner, false)
  container.addEventListener('keyup', onKeyUpper, false)

  this.update = function (delta) {
    tv.setValue(0.0, -1.0, 0.0)
    bodRot = m_carChassis[cci].getWorldTransform().getBasis().getColumn(1).dot(tv)
    // if car rolls past threshold increase camLag
    if (bodRot > -.4) camLags = .001; else camLags = camLag

    if (camFollowCar && !chaseCammer) {

      // for camera to follow car position and heading
      let qc = new THREE.Quaternion(0, 0, 0, 1)
      if (carModel[cci][0] != undefined)
        qc = carModel[cci][0].quaternion

      // radians
      carHeading = fixAngleRad((Math.PI + (Math.atan2(2 * qc.y * qc.w - 2 * qc.x * qc.z, 1 - 2 * (qc.y * qc.y) - 2 * (qc.z * qc.z)))) + camRotateCar)

      // delay factor results in side view of car when turns
      // radians
      camHeading = fixAngleRad(camHeading + camLags * fixAngleRad(carHeading - camHeading))

      // radians
      camera.rotation.x = camTilt
      camera.rotation.y = camHeading
      camera.rotation.z = 0

      camHeightAccelCalc()
      camDistAccelCalc()

      // camera position behind car
      followCamPos.setValue(
        carPos[cci].x() + Math.sin(fixAngleRad(Math.PI + camHeading)) * -camDist,
        carPos[cci].y() + camHeight,
        carPos[cci].z() + Math.cos(fixAngleRad(Math.PI + camHeading)) * -camDist
      )

      camera.position.x = followCamPos.x()
      camera.position.y = followCamPos.y()
      camera.position.z = followCamPos.z()

    } else if (!camFollowCar && chaseCammer) {

      // for camera to chase car as physics body
      if (chaseCammer) {

        bodies[1].getMotionState().getWorldTransform(tranCam)

        chaseCamO = tranCam.getOrigin()
        m_carChassis[cci].getMotionState().getWorldTransform(tranChass)
        carO = tranChass.getOrigin()

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

    } else if (!camFollowCar && !chaseCammer)  // camera stays still
      camera.lookAt(new THREE.Vector3(carPos[cci].x(), carPos[cci].y(), carPos[cci].z()))
    // end not following car, camera could be still or chasing

    if (pageUpper)
      if (camHeight < maxCamHeight)
        camHeight *= 1.05
      else camHeight = maxCamHeight

    else if (pageDowner)
      if (camHeight > minCamHeight)
        camHeight *= .95
      else camHeight = minCamHeight

  }// end update

} // end camera controls contstructor function

function camHeightAccelCalc() {
  if (camHeightUp && camHeight - camHeightOld < camHeight * .1) {
    camHeightAccel += .001; camHeightDown = false
  } else if (camHeightDown && camHeight - camHeightOld > camHeight * -.1) {
    camHeightAccel -= .001; camHeightUp = false
  } else {
    camHeightUp = false; camHeightDown = false
    if (camHeightAccel > 1) camHeightAccel -= .001; else if (camHeightAccel < 1) camHeightAccel += .001
    if (Math.abs(camHeightAccel - 1) < .001) camHeightAccel = 1
  }
  camHeight *= camHeightAccel
}// end camHeightAccelCalc()

function camDistAccelCalc() {
  if (camDistUp && camDist - camDistOld < camDist * .1) {
    camDistAccel += .002; camDistDown = false
  } else if (camDistDown && camDist - camDistOld > camDist * -.1) {
    camDistAccel -= .002; camDistUp = false
  } else {
    camDistUp = false; camDistDown = false
    if (camDistAccel > 1) camDistAccel -= .001; else if (camDistAccel < 1) camDistAccel += .001
    if (Math.abs(camDistAccel - 1) < .001) camDistAccel = 1
  }
  camDist *= camDistAccel
}// end camDistAccelCalc()

// for setting initial position of chase cam behind followed vehicle
function setChaseCam() {
  camDist = camDistS; camHeight = camHeightS; camTilt = camTiltS; camRotateCar = 0

  carRot = m_carChassis[cci].getWorldTransform().getBasis()
  c2 = new Ammo.btVector3(0, camHeightS, -camDistS)
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

}// end set chase cam

let container
let timely2
let resettingCars = false

var mandalaSet = false
var camZoomer = 1

let decalsMandala = []
const decalPosition = new THREE.Vector3()
const decalSizer = new THREE.Vector3(20, 20, 20)
const decalOrientation = new THREE.Euler(-Math.PI / 2, 0, 0)
const mandalaLoader = new THREE.TextureLoader()
const decalTextureMandala = mandalaLoader.load('mandala.png')

const decalMaterialMandala = new THREE.MeshPhongMaterial({
  color: 0x555555,
  specular: 0x111111,
  map: decalTextureMandala,
  bumpMap: decalTextureMandala,
  bumpScale: .3,
  opacity: 1,
  shininess: 200,
  transparent: true,
  depthTest: true,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: -4,
  wireframe: false
})

const textureLoader_d = new THREE.TextureLoader()
const decalDiffuse = textureLoader_d.load('track5.png')
const decalNormal = textureLoader_d.load('track5.png')

const decalMaterial = new THREE.MeshPhongMaterial({
  specular: 0x444444,
  map: decalDiffuse,
  // normalMap: decalNormal,
  // normalScale: new THREE.Vector2( 1, 1 ),
  shininess: 900,
  transparent: true,
  depthTest: true,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: - 4,
  wireframe: false,
  opacity: .4
})

let loadingDone = false
var muted = false
var camid = 0
let showMui = true
var tv = new Ammo.btVector3(0, 0, 0)
var tCamPoint = new Ammo.btVector3(0, 0, 0)
let carHit = false
let dp
let numMan
let num_contacts = 0
let bodyA
let bodyB
let carHitForce = []
let manifolder = []
let highestHitForce = 0

let decalWorldID = 0
const downRayDir = new Ammo.btVector3(0, 0, 0)
let frontRay
const frontRayDir = new Ammo.btVector3(0, 0, 0)

var soundListener = new THREE.AudioListener()
soundListener.setMasterVolume(0)
var engineSound = new THREE.PositionalAudio(soundListener)
const skidSound = new THREE.PositionalAudio(soundListener)
const hitSound = new THREE.PositionalAudio(soundListener)
const hitSound2 = new THREE.PositionalAudio(soundListener)
const hitSound3 = new THREE.PositionalAudio(soundListener)
const hitSound4 = new THREE.PositionalAudio(soundListener)
const hitSound5 = new THREE.PositionalAudio(soundListener)
const popSound = new THREE.PositionalAudio(soundListener)

let firstSkid = true
let engineSoundAdded = false
const audioLoader = new THREE.AudioLoader()

let hitSwitch = true
const minPitch = .4
let engPitch = minPitch
let skidVol = 0
const accelVol = .8
let hitVol = 1

audioLoader.load('sounds/139770_Car_Toyota_Starlet_Driving_Loop_01.ogg', buffer => {
  engineSound.setBuffer(buffer)
  engineSound.setRefDistance(3)
  engineSound.setLoop(true)
  engineSound.setVolume(engPitch)
  engineSound.setPlaybackRate(engPitch)
})

audioLoader.load('sounds/104916_Wheel_Skids_2.ogg', buffer => {
  skidSound.setBuffer(buffer)
  skidSound.setRefDistance(3)
  skidSound.setLoop(false)
  skidSound.setVolume(skidVol)
  skidSound.setPlaybackRate(.5)
})

audioLoader.load('sounds/151696_Wreck_Metal_Alternator_Crash_34.ogg', buffer => {
  hitSound.setBuffer(buffer)
  hitSound.setRefDistance(3)
  hitSound.setLoop(false)
  hitSound.setVolume(hitVol)
})
// boing
audioLoader.load('sounds/boing.ogg', buffer => {
  hitSound2.setBuffer(buffer)
  hitSound2.setRefDistance(3)
  hitSound2.setLoop(false)
  hitSound2.setVolume(hitVol)
  hitSound2.setPlaybackRate(.7)
})

audioLoader.load('sounds/thump.ogg', buffer => {
  hitSound5.setBuffer(buffer)
  hitSound5.setRefDistance(3)
  hitSound5.setLoop(false)
  hitSound5.setVolume(hitVol)
  hitSound5.setPlaybackRate(.7)
})

audioLoader.load('sounds/pop.ogg', buffer => {
  popSound.setBuffer(buffer)
  popSound.setRefDistance(3)
  popSound.setLoop(false)
  popSound.setVolume(hitVol)
  popSound.setPlaybackRate(.7)
})

audioLoader.load('sounds/rattle.ogg', buffer => {
  hitSound3.setBuffer(buffer)
  hitSound3.setRefDistance(3)
  hitSound3.setLoop(false)
  hitSound3.setVolume(hitVol)
  hitSound3.setPlaybackRate(1)
})

audioLoader.load('sounds/151756_Wreck_Metal_Part_Impact_Metal_06.ogg', buffer => {
  hitSound4.setBuffer(buffer)
  hitSound4.setRefDistance(3)
  hitSound4.setLoop(false)
  hitSound4.setVolume(hitVol)
  hitSound4.setPlaybackRate(.7)
})

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

const worldSet = false
var cci = 3
const dec = new Ammo.btVector3(0, 0, 0)
const dec2 = new Ammo.btVector3(0, 0, 0)
const dec3 = new Ammo.btVector3(0, 0, 0)
const smo = new Ammo.btVector3(0, 0, 0)
const smo2 = new Ammo.btVector3(0, 0, 0)
const smo3 = new Ammo.btVector3(0, 0, 0)
const smo4 = new THREE.Vector3(0, 0, 0)
let s_material, s_material2, s_material3, smoker, smoker2, smoker3, smoker4, sparksMesh
let smokerCount = 0, smokerCount2 = 6, frame = [], explo = [], opacDown = false, opac = .1, startSmoker = false
let sparks = [], sparkler = false, hitPoint = new Ammo.btVector3(0, 0, 0)
let sparksCount = 0
const smokerCount3 = [0, 5]
const smoUp = [true, true]
let smoker2Scale = .1, smoker2Grow = 0
const smoker3Scale = .1, smoker3Grow = 0
let carVel = new THREE.Vector3(0, 0, 0), oldCarPos = new THREE.Vector3(0, 0, 0), oldCarPos2 = new THREE.Vector3(0, 0, 0), decRot = 0
let decal
let decalCounter = 0
let decals = []
let material_d
const p_d = new THREE.Vector3(0, 0, 0)
var r_d = new THREE.Vector3(0, 0, 0)
var r_d = new THREE.Euler(0, 0, 0, 'XYZ')
const s_d = new THREE.Vector3(90, 90, 90)
const up_d = new THREE.Vector3(0, 1, 0)
const check_d = new THREE.Vector3(1, 1, 1)

const framesPerSecond = 100
var objLoader, mtlLoader
var worldScale = 22
const worldWidth = 500
const fogColor = new THREE.Color(0xae9a7b)// ae9a7b
var ray, groundY = 0
var xvelc = 0, yvelc = 0, zvelc = 0, ctFac = 1.35
var tranCam = new Ammo.btTransform()
var tranChass = new Ammo.btTransform()
var chaseCamO = new Ammo.btVector3()
const toPoint = new Ammo.btVector3()
var carO = new Ammo.btVector3()
var carRot = new Ammo.btMatrix3x3()
const camPointer = new Ammo.btMatrix3x3()
var tCamPoint = new Ammo.btVector3()
var bodRot = -1
const camStop = false
const carColorSetter = false
const rimColorSetter = false
const fogFar = 500
var lifter = false
var typing = false
let camera, scene, renderer, hemiLight, dirLight, lightSet = 0, pointLight
var geometry, mat2, mat3, mat4, mat5, mesh, matBlank
const clock = new THREE.Clock()
var altKey = false
const bullStop = false
var followCamPos = new Ammo.btVector3(0, 0, 0)
const carModRot = new Ammo.btQuaternion(0, 0, 0, 1)
var carHeading = 0.0
var camHeading = 0.0
var pageUpper = false, pageDowner = false
var camHeight = 4.0, camHeightUp = false, camHeightDown = false, camHeightOld = camHeight, camHeightAccel = 1.0
var camPresets = 0
var camDist = 8.0, camDistUp = false, camDistDown = false, camDistOld = camDist, camDistAccel = 1.0
var maxCamDist = 25, minCamDist = 4, minCamHeight = .1, maxCamHeight = 20
var camHeightS = camHeight, camDistS = camDist
var camTilt = -23 * Math.PI / 180; camTiltS = camTilt
let dt = 0.0
var camFollowCar = false
var chaseCammer = true, chaseStarter = chaseCammer
const chaseTick = 0
var camRotateCar = 0.0
var oldMouseX = 0.0
var oldMouseY = 0.0
const camInd = 0
var objLoader
var mtlLoader
const carColorInd = 0
const numCarColors = 12
const worldMatModified = false
var camLag = .035, camLags = camLag
let md

const triMeshModel = []
const triMeshModelMat = []

const carNames = ['yellow', 'van', 'pickup', 'hummer', 'lada']
const numCars = carNames.length;
if (cci >= numCars) cci = numCars - 1

var carPlaces = [
  { name: 'yellow', place: 0 },
  { name: 'van', place: 0 },
  { name: 'pickup', place: 0 },
  { name: 'hummer', place: 0 },
  { name: 'lada', place: 0 },
]

function sortPlaces(a, b) {
  if (a.place < b.place) return 1
  if (a.place > b.place) return -1
  return 0
}

const numCarModels = 2
var carModel = []
const tireClones = []
const hubClones = []
const objFile = []
const mtlFile = []
const objScales = []
var worldSwitching = []
const carHeightAboveGround = []

for (let c = 0; c < numCars; c++) {
  carHeightAboveGround[c] = 0
  worldSwitching[c] = true
  objScales[c] = [.57, .57]

  if (c == 0) {
    objFile[c] = ['russian.obj', 'russianTire.obj']
    mtlFile[c] = ['russian.mtl', 'russianTire.mtl']
  } else if (c == 1) {
    objFile[c] = ['van.obj', 'vanTire.obj']
    mtlFile[c] = ['van.mtl', 'vanTire.mtl']
  } else if (c == 2) {
    objFile[c] = ['pickup2.obj', 'pickup2Tire.obj']
    mtlFile[c] = ['pickup2.mtl', 'pickup2Tire.mtl']
  } else if (c == 3) {
    objFile[c] = ['hummer.obj', 'hummerTire.obj']
    mtlFile[c] = ['hummer.mtl', 'hummerTire.mtl']
  } else if (c == 4) {
    objFile[c] = ['ladavaz.obj', 'ladavazTire.obj']
    mtlFile[c] = ['ladavaz.mtl', 'ladavazTire.mtl']
  }
}// end num cars

// bullet init
const camPos = new Ammo.btVector3(0, 0, 0)
const ACTIVE_TAG = 1
const ISLAND_SLEEPING = 2
const WANTS_DEACTIVATION = 3
const DISABLE_DEACTIVATION = 4
const DISABLE_SIMULATION = 5

const numObjects = 2// ground is 0, camera is 1
var resetBulletObjectsBool = true

const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration()
const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration)
// var overlappingPairCache= new Ammo.btDbvtBroadphase();
const worldMin = new Ammo.btVector3(-1000, -1000, -1000)
const worldMax = new Ammo.btVector3(1000, 1000, 1000)
const overlappingPairCache = new Ammo.btAxisSweep3(worldMin, worldMax)
const solver = new Ammo.btSequentialImpulseConstraintSolver()

var dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(
  dispatcher,
  overlappingPairCache,
  solver,
  collisionConfiguration
)

// real simple
function triMeshBuilder(model, scale, positioner) {
  const trimesh = new Ammo.btTriangleMesh()
  const v = model.children[0].geometry.attributes.position.array
  const vcount = v.length
  for (c = 0; c < vcount; c += 9) {
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

  useQuantization = true
  const concaveShape = new Ammo.btBvhTriangleMeshShape(trimesh, useQuantization)
  triMeshBodyTrans.setIdentity()
  triMeshBodyTrans.setOrigin(positioner)
  motionStated = new Ammo.btDefaultMotionState(triMeshBodyTrans)
  tv.setValue(0, 0, 0)
  tbody = new Ammo.btRigidBody(0, motionStated, concaveShape, tv)
  tbody.setCollisionFlags(tbody.getCollisionFlags() | 1)
  tbody.setActivationState(DISABLE_DEACTIVATION)
  tbody.setFriction(.1)
  dynamicsWorld.addRigidBody(tbody)
  triMeshBody.push(tbody)

}// end tri mesh builder

/* //for reference
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
var gEngineForce = []
var gBreakingForce = []
const turboForce = 1.7
const maxEngineForce = []
var maxBreakingForce = []
var gVehicleSteering = []

const steeringIncrement = []
const steeringClamp = []
const steeringReturnRate = []
const wheelRadius = [.36, .42, .36, .41, .36, .36, .36]
const wheelRadiusS = [.36, .42, .36, .41, .36, .36, .36]
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
var roboCars = true, iamaRobot = true
const steering = []
const accelerating = []
var moveCarForward = []
var moveCarBackward = []
var steerCarLeft = []
var steerCarRight = []
let m_tuning

let carHeading2 = 0.0
var coordi = []
var coordRange = 300
var numCoords = 100
var coordx = []
var coordz = []
const tv3 = new THREE.Vector3(0, 0, 0)
const bodRotTick = []

var m_carChassis = []
const m_vehicle = []
var carPos = []
const carMat = []
const carColor = []
const rimColor = []
const chassisWorldTrans = []
const tuneup = []
const carObjects = []
var allCoordSame = true

for (var c = 0; c < numCars; c++) {

  bodRotTick[c] = 0
  coordi[c] = 0
  coordx[c] = []
  coordz[c] = []

  for (var i = 0; i < numCoords; i++)
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
}// num cars loop

const paramTweaker = function () {
  this.ShortCut = 'H Key Toggles This Tuner Panel'
  this.maxSpeed = maxSpeed[cci]
  this.maxEngineForce = maxEngineForce[cci]
  this.maxBreakingForce = maxBreakingForce[cci]
  this.steeringIncrement = steeringIncrement[cci]
  this.steeringClamp = steeringClamp[cci]
  this.steeringReturnRate = steeringReturnRate[cci]
  this.wheelRadius = wheelRadius[cci]
  this.wheelWidth = wheelWidth[cci]
  this.frictionSlip = frictionSlip[cci]
  this.rearWheelFriction = rearWheelFriction[cci]
  this.suspensionStiffness = suspensionStiffness[cci]
  this.suspensionDamping = suspensionDamping[cci]
  this.suspensionCompression = suspensionCompression[cci]
  this.rollInfluence = rollInfluence[cci]
  this.suspensionRestLength = suspensionRestLength[cci]
  this.maxSuspensionTravelCm = maxSuspensionTravelCm[cci]
  this.maxSuspensionForce = maxSuspensionForce[cci]
  this.CUBE_HALF_EXTENTS = CUBE_HALF_EXTENTS[cci]
  this.connectionHeight = connectionHeight[cci]
}// end param tweaker

function applyTuneUp() {
  for (let c = 0; c < numCars; c++) {
    dynamicsWorld.removeVehicle(m_vehicle[c])
    tuneup[c] = true
    makeVehicle(c)
  }
}// end tweak

// init vehicle
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
  mass = 680

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
}// end init vehicle

// create vehicle
function makeVehicle(c) {
  m_tuning = new Ammo.btVehicleTuning()
  m_tuning.set_m_suspensionStiffness(suspensionStiffness[c])
  m_tuning.set_m_suspensionCompression(suspensionCompression[c])
  m_tuning.set_m_suspensionDamping(suspensionDamping[c])
  m_tuning.set_m_maxSuspensionTravelCm(maxSuspensionTravelCm[c])
  m_tuning.set_m_frictionSlip(frictionSlip[c])
  m_tuning.set_m_maxSuspensionForce(maxSuspensionForce[c])

  m_vehicleRayCaster = new Ammo.btDefaultVehicleRaycaster(dynamicsWorld)
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

  // rear wheels
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
}// end make vehicle

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
  }// end if ! tune up
  dynamicsWorld.getBroadphase().getOverlappingPairCache().cleanProxyFromPairs(m_carChassis[c].getBroadphaseHandle(), dynamicsWorld.getDispatcher())
  if (m_vehicle[c]) {
    m_vehicle[c].resetSuspension()
    for (i = 0; i < m_vehicle[c].getNumWheels(); i++)
      // synchronize the wheels with the (interpolated) chassis worldtransform
      m_vehicle[c].updateWheelTransform(i, true)

  }
  tuneup[c] = false

}// end reset vehicle

function tuneVehicle(c) {
  for (i = 0; i < m_vehicle[c].getNumWheels(); i++) {
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
}// end tuneVehicle

function bulletDestroy() {
  // Delete objects we created through |new|. We just do a few of them here, but you should do them all if you are not shutting down ammo.js
  // we'll free the objects in reversed order as they were created via 'new' to avoid the 'dead' object links
  Ammo.destroy(dynamicsWorld)
  Ammo.destroy(solver)
  Ammo.destroy(overlappingPairCache)
  Ammo.destroy(dispatcher)
  Ammo.destroy(collisionConfiguration)
  Ammo.destroy(tv)
}// end bullDestroy

tv.setValue(0, -40, 0)
dynamicsWorld.setGravity(tv)

var triMeshBody = []
let tbody

var worldID = 0
var bodies = []

const threeObject = [] // index 0 is for the ground, 1 for the camera

var matBlank = new THREE.MeshBasicMaterial()
matBlank.visible = false
matBlank.side = THREE.FrontSide

function initObjects(numObjects) {
  for (i = 1; i < numObjects; i++) {// 0 is ground, 1 is camera
    var colShape
    var mass
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
}// end init objects

const obTrans = new Ammo.btTransform()
var triMeshBodyTrans = new Ammo.btTransform()
const stringer = ''

function randRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function worldMoveOpacity(i) {
  if (typeof worldMat !== 'undefined') {
    const m = worldMat.materials
    for (n in m) {
      m[n].opacity += .001
      m[n].needsUpdate = true
    }
  }
}// end world move opacity

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
    // bodies[i].setLinearVelocity(new Ammo.btVector3(-rx,-ry,-rz));
  }
  Ammo.destroy(clearTrans); clearTrans = null
}// end reset bullet objects

function decalMaintenance() {
  decalCounter += 2
  if (decalCounter > 120) decalCounter = 0

  if (decals.length > 1000) {
    for (let i = 0; i < decals.length; i++) scene.remove(decals[i])
    decals = []
    decalCounter = 0
  }
}// end decalMaintenance

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
      if (smoUp[i]) {
        smokerCount3[i]++
      };
      if (smokerCount3[i] >= frame.length) smokerCount3[i] = 0
    }
  }
}// end tire smoker

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

      if (c == cci)
        decalWorldID = downRay.get_m_collisionObject().getUserPointer()

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
          manifold = dp.getManifoldByIndexInternal(i)

          num_contacts = manifold.getNumContacts()
          if (!(num_contacts === 0)) {

            bodyA = carObjects[c][manifold.getBody0()]
            bodyB = carObjects[c][manifold.getBody1()]

            if (bodyA != bodies[1] && bodyB != bodies[1])
              carHit = true// so do not move car a above car b when b is above a

          }
        }// end num man loop

        if (!carHit) {
          worldSwitching[c] = false
          let pointAbove = downRay.get_m_hitPointWorld()
          m_carChassis[c].setDamping(.99, .99)
          m_carChassis[c].getMotionState().getWorldTransform(chassisWorldTrans[c])
          pointAbove.setY(pointAbove.y() + 1.5)
          chassisWorldTrans[c].setOrigin(pointAbove)
          m_carChassis[c].setWorldTransform(chassisWorldTrans[c])

          Ammo.destroy(pointAbove); pointAbove = null
        }// end if !carHit

      }// end hit above
    }// end no hit below

    Ammo.destroy(downRay); downRay = null
  }// if !== undefined
}// end find ground

function bulletStep() {
  if (!bullStop) dynamicsWorld.stepSimulation(1 / 60)

  for (var c = 0; c < numCars; c++)
    findGround(c)

  if (lifter) {
    tv.setValue(-5, 0, 0)
    m_carChassis[cci].setAngularVelocity(tv)
  }

  carHitForce = []
  manifolder = []
  highestHitForce = 0
  carHit = false
  dp = dynamicsWorld.getDispatcher()
  numMan = dp.getNumManifolds()

  for (var i = 0; i < numMan; i++) {
    manifold = dp.getManifoldByIndexInternal(i)

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
  }// end num man loop

  if (carHitForce.length > 0) {
    highestHitForce = Math.max(...carHitForce)
    for (var i = 0; i < carHitForce.length; i++)
      if (highestHitForce == carHitForce[i]) {
        manifolder[i].getContactPoint().set_m_appliedImpulse(0)
        hitPoint.setX(manifolder[i].getContactPoint().getPositionWorldOnA().x())
        hitPoint.setY(manifolder[i].getContactPoint().getPositionWorldOnA().y())
        hitPoint.setZ(manifolder[i].getContactPoint().getPositionWorldOnA().z())
      }
    // end car hit force loop

    if (highestHitForce > 16000) {
      if (typeof hitSound !== 'undefined' && !hitSound.isPlaying) {
        hitVol = highestHitForce * .0001
        if (hitVol > 1) hitVol = 1
        if (hitVol < .05) hitVol = .05
        hitSound.setVolume(hitVol * 1)
        hitSound.play() // alternator
      }

      if (typeof hitSound3 !== 'undefined' && !hitSound3.isPlaying) {
        hitSound3.setVolume(hitVol * 3)
        hitSound3.play() // glass
        sparkler = true
      }

      if (typeof hitSound4 !== 'undefined' && !hitSound4.isPlaying) {
        hitSound4.setVolume(hitVol * .2)
        hitSound4.play() // metal
      }

    } else if (highestHitForce > 6000) {
      if (typeof hitSound !== 'undefined' && !hitSound.isPlaying) {
        hitVol = highestHitForce * .0001
        if (hitVol > 1) hitVol = 1
        if (hitVol < .05) hitVol = .05
        hitSound.setVolume(hitVol * 1)
        hitSound.play() // alternator
      }

    } else if (highestHitForce > 2)
      if (typeof hitSound2 !== 'undefined' && !hitSound2.isPlaying && typeof hitSound5 !== 'undefined' && !hitSound5.isPlaying) {
        // &&typeof hitSound5!=="undefined"&&!hitSound5.isPlaying
        hitVol = highestHitForce * .005
        if (hitVol > .6) hitVol = .6
        if (hitVol < .05) hitVol = .05
        hitSwitch = !hitSwitch
        if (hitSwitch) {
          hitSound2.setVolume(hitVol * 2)
          hitSound2.play() // boing
        } else {
          hitSound5.setVolume(hitVol * 1)
          hitSound5.play() // carHit
        }
      }// end ! undefined and ! playing
  }// end car hit force length>0

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

  }// end if sparkler

  if (resetBulletObjectsBool) {
    resetBulletObjectsBool = false
    resetBulletObjects()
  }

  for (var c = 0; c < numCars; c++) {
    if (c == cci)
      if (m_vehicle[c].getWheelInfo(2).get_m_skidInfo() < .8 || ((moveCarForward[c] || moveCarBackward[c]) && Math.abs(kmh[c]) < maxSpeed[c] / 4)) {

        shoot(c); decalMaintenance()
        tireSmoker(0, smoker3, .9)
        tireSmoker(1, smoker4, -1.1)

        if (typeof skidSound !== 'undefined' && engineSoundAdded) {
          if (skidVol < Math.abs(kmh[c] + .0001) / (maxSpeed[c]))
            skidVol += .01

          if (firstSkid) {
            skidVol = 0; firstSkid = false
          }
          skidSound.setVolume(skidVol)
          if (!skidSound.isPlaying) skidSound.play()
        }

      } else {
        smoker3.material.visible = false
        smoker4.material.visible = false
        if (skidSound.isPlaying) {
          skidSound.stop(); skidVol = 0
        }
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
    // end if steering

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
    }// end car height above ground < 3

    if (typeof carModel[c][0] !== 'undefined') {

      let qc = new THREE.Quaternion(0, 0, 0, 1)
      qc = carModel[c][0].quaternion

      // radians
      carHeading2 = fixAngleRad((Math.PI + (Math.atan2(2 * qc.y * qc.w - 2 * qc.x * qc.z, 1 - 2 * (qc.y * qc.y) - 2 * (qc.z * qc.z)))))

      var curx = parseFloat(coordx[c][coordi[c]] - carPos[c].x())
      var curz = parseFloat(coordz[c][coordi[c]] - carPos[c].z())
      tv3.set(coordx[c][coordi[c]], carModel[c][0].position.y, coordz[c][coordi[c]])
      const dister = carModel[c][0].position.distanceTo(tv3)

      if (typeof markerSphere !== 'undefined' && typeof decalsMandala[0] !== 'undefined')
        markerSphere.rotateY(.005)

      if (c == cci && !mandalaSet) decalRayCast()

      if (dister < 10) {
        coordi[c]++
        if (c == cci) {
          mandalaSet = false; decalRayCast(); if (!popSound.isPlaying) popSound.play()
        }
        const ai = carPlaces.map(e => e.name).indexOf(carNames[c])
        carPlaces[ai].place++

        if (coordi[c] >= coordx[c].length) {

          for (var i = 0; i < numCoords; i++)
            if (i > 0 && allCoordSame) {
              coordx[c][i] = coordx[0][i]
              coordz[c][i] = coordz[0][i]
            } else {
              coordx[c][i] = randRange(-coordRange, coordRange)
              coordz[c][i] = randRange(-coordRange, coordRange)
            }

          coordi[c] = 0
          carPlaces[c].place = 0
        }
      }
    }// end !undefined

    // robo cars
    if (roboCars && (c != cci || iamaRobot) && typeof carModel[c][0] !== 'undefined') {

      if (kmh[c] < maxSpeed[c]) moveCarForward[c] = true; else moveCarForward[c] = false

      const bearing = Math.atan2(curz, curx)

      const bearDif = fixAngleRad((-Math.PI / 2 - bearing) - carHeading2)
      if (Math.abs(bearDif) > .035)
        gVehicleSteering[c] += bearDif / 10

    }// end if robo cars && c != cci
    else if (!roboCars && c != cci) moveCarForward[c] = false

    accelerating[c] = (moveCarForward[c] || moveCarBackward[c])

    if (!accelerating[c]) {
      gEngineForce[c] = 0
      if (Math.abs(kmh[c]) > 20) gBreakingForce[c] += 5

      if (c == cci) {
        engPitch = Math.abs(kmh[c]) / (maxSpeed[c] * .5)
        if (engPitch < minPitch) engPitch = minPitch
        engineSound.setPlaybackRate(engPitch)
        engineSound.setVolume(engPitch)
      }

    } else if (accelerating[c]) {

      if (c == cci) {

        engPitch = Math.abs(kmh[c]) / (maxSpeed[c] * .5)
        if (engPitch < minPitch) engPitch = minPitch
        engineSound.setPlaybackRate(engPitch)
        engineSound.setVolume(engPitch)
      }// end if c==cci

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

    }// end if accelerating

    // 0,1 front; 2,3 back
    m_vehicle[c].applyEngineForce(gEngineForce[c], 0)
    m_vehicle[c].setBrake(gBreakingForce[c], 0)
    m_vehicle[c].setSteeringValue(gVehicleSteering[c], 0)
    m_vehicle[c].setSteeringValue(-gVehicleSteering[c] * 1.2, 4)// for drifting, 5th wheel (rear)

    m_vehicle[c].applyEngineForce(gEngineForce[c], 4)
    // m_vehicle[c].setBrake(gBreakingForce[c],4);

    m_vehicle[c].applyEngineForce(gEngineForce[c], 1)
    m_vehicle[c].setBrake(gBreakingForce[c], 1)
    m_vehicle[c].setSteeringValue(gVehicleSteering[c], 1)
    m_vehicle[c].setSteeringValue(-gVehicleSteering[c] * 1.2, 5) // for drifting, 6th wheel (rear)

    m_vehicle[c].applyEngineForce(gEngineForce[c], 5)
    // m_vehicle[c].setBrake(gBreakingForce[c],5);

    // chassis
    m_carChassis[c].getMotionState().getWorldTransform(chassisWorldTrans[c])
    carPos[c] = chassisWorldTrans[c].getOrigin()

    for (i = 0; i < numCarModels; i++)
      if (typeof carModel[c][i] !== 'undefined') {

        if (c == cci && i == 0 && !engineSoundAdded) {
          carModel[cci][0].children[i].add(engineSound)
          carModel[cci][0].children[i].add(skidSound)
          carModel[cci][0].children[i].add(hitSound)
          carModel[cci][0].children[i].add(hitSound2)
          carModel[cci][0].children[i].add(hitSound3)
          carModel[cci][0].children[i].add(hitSound4)
          carModel[cci][0].children[i].add(hitSound5)
          carModel[cci][0].children[i].add(popSound)
          engineSoundAdded = true
        }

        if (!engineSound.isPlaying && typeof engineSound !== 'undefined') engineSound.play()

        carModel[c][i].position.set(carPos[c].x(), carPos[c].y(), carPos[c].z())
        carModel[c][i].quaternion.set(
          chassisWorldTrans[c].getRotation().x(),
          chassisWorldTrans[c].getRotation().y(),
          chassisWorldTrans[c].getRotation().z(),
          chassisWorldTrans[c].getRotation().w()
        )

        if (c == cci && i == 0) {
          if (camFollowCar || chaseCammer)
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

        }// c==cci&&i==0

      }
    // num car models

    // wheels, index 0 is the chassis shape
    for (i = 0; i < 4; i++) {
      // synchronize the wheels with the (interpolated) chassis worldtransform
      m_vehicle[c].updateWheelTransform(i, true)
      wheelTrans = m_vehicle[c].getWheelInfo(i).get_m_worldTransform()
      var p = wheelTrans.getOrigin()
      var q = wheelTrans.getRotation()

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

    }// end wheels

  }// end num cars

  // index 0 is ground, index 1 is camera
  for (i = 2; i < bodies.length; i++) {
    bodies[i].getMotionState().getWorldTransform(obTrans)
    var p = obTrans.getOrigin()
    var q = obTrans.getRotation()
    threeObject[i].position.set(p.x(), p.y(), p.z())
    threeObject[i].quaternion.set(q.x(), q.y(), q.z(), q.w())
  }

  resettingCars = false
}// end bulletStep

init()
animate()

function skyInit() {
  scene.background = fogColor
  scene.fog = new THREE.Fog(fogColor, 0, fogFar)
}

function init() {

  container = document.createElement('div')
  container.style.height = window.innerHeight + 'px'
  container.style.width = window.innerWidth + 'px'
  document.body.appendChild(container)

  camera = new THREE.PerspectiveCamera(70, SCREEN_WIDTH / SCREEN_HEIGHT, .01, 9000)
  camera.add(soundListener)
  scene = new THREE.Scene()

  const sphereTextureMandala = new THREE.TextureLoader().load('mandala.png')
  const sphereMaterialMandala = new THREE.MeshPhongMaterial({
    color: 0x666666,
    specular: 0x111111,
    map: sphereTextureMandala,
    bumpMap: sphereTextureMandala,
    bumpScale: .1,
    opacity: 1,
    shininess: 900,
  })
  const sphering = new THREE.SphereBufferGeometry(10, 32, 32)
  markerSphere = new THREE.Mesh(sphering, sphereMaterialMandala)
  markerSphere.castShadow = true
  // markerSphere.receiveShadow=false;
  scene.add(markerSphere)

  skyInit()

  bodies.push({})

  initObjects(numObjects)
  for (i = 1; i < bodies.length; i++)
    scene.add(threeObject[i])

  for (var c = 0; c < numCars; c++)
    initVehicle(c)

  // skyColor,world, intensity
  hemiLight = new THREE.HemisphereLight(
    new THREE.Color(0xd7bb60),
    new THREE.Color(0xf0d7bb),
    1.0)
  hemiLight.position.set(0, 1, 0)
  scene.add(hemiLight)

  // dirLight=new THREE.DirectionalLight( 0xD6D6D6, 1 );
  dirLight = new THREE.DirectionalLight(0xffffff, 2.6)
  dirLight.castShadow = true
  dirLight.shadowCameraVisible = true
  dirLight.shadow.mapSize.width = 2500
  dirLight.shadow.mapSize.height = 2500
  const d = 120
  dirLight.shadow.camera.left = -d
  dirLight.shadow.camera.right = d
  dirLight.shadow.camera.top = d
  dirLight.shadow.camera.bottom = -d
  dirLight.shadow.camera.far = 400
  dirLight.shadow.bias = 0.0001

  scene.add(dirLight)

  pointLight = new THREE.PointLight(0x0011ff, 5, 200)
  scene.add(pointLight)

  objWorldModelLoader(0, worldFiles[worldID] + '.obj', worldFiles[worldID] + '.mtl', worldScale)

  for (var c = 0; c < numCars; c++)
    for (i = 0; i < numCarModels; i++)
      objCarModelLoader(c, i, objFile[c][i], mtlFile[c][i], objScales[c][i])

  // end num cars loop

  camAndKeys = new camAndKeyFunction()

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
  renderer.setSize(SCREEN_WIDTH * .1, SCREEN_HEIGHT * .1)

  let s_geometry = new THREE.BufferGeometry()
  let numFrames = 6
  for (var si = 0; si < numFrames; si++)
    sparks[si] = new THREE.TextureLoader().load('animations/sparks_' + si + '.gif')

  numFrames = 14
  for (var si = 0; si < numFrames; si++)
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

  s_material4 = new THREE.MeshBasicMaterial({
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

}// end init

function shoot(c) {

  if (typeof carModel[c][0] !== 'undefined' && typeof carModel[c][1] !== 'undefined' && typeof worldModel.children[0] !== 'undefined') {

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
      carVel.x = 0; carVel.y = 0; carVel.z = 0
    }
    s_d.set(1, 1, carVel.length())
    material_d = decalMaterial.clone()
    // THREE.DecalGeometry=function( mesh, position, rotation, dimensions){
    md = new THREE.Mesh(new THREE.DecalGeometry(worldModel.children[0], p_d, r_d, s_d), material_d)
    decals[i] = md
    scene.add(decals[i])

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

    // THREE.DecalGeometry=function( mesh, position, rotation, dimensions, check ) {
    md = new THREE.Mesh(new THREE.DecalGeometry(worldModel.children[0], p_d, r_d, s_d), material_d)
    decals[i + 1] = md
    scene.add(decals[i + 1])

  }
}// end shoot

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
        for (j = 0; j < 3; j++) {
          tireClones[c][j] = carModel[c][i].clone()
          scene.add(tireClones[c][j])
        }

    }) // end obj load call
  }) // end mtl load call

}// end obj car model loader

function objWorldModelLoader(i, objFile, mtlFile, scale) {
  mtlLoader = new THREE.MTLLoader()
  mtlLoader.load(mtlFile, materials => {
    materials.preload()
    objLoader = new THREE.OBJLoader()
    objLoader.setMaterials(materials)
    worldMat = materials// for setting values dynamically
    objLoader.load(objFile, object => {
      object.position.set(positioner[i].x(), positioner[i].y(), positioner[i].z())
      worldModel = object
      worldModel.scale.set(scale, scale, scale)
      worldModel.traverse(
        child => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })
      triMeshBuilder(worldModel, worldScale, positioner[i])
      scene.add(worldModel)
    })
  })
}// end obj world model loader

function modifyCarMaterials(c) {
  for (i = 0; i < carMat[c].length; i++)
    if (typeof carMat[c][i] !== 'undefined') {
      const m = carMat[c][i].materials
      for (n in m) {
        // tires and undercarriage do not reflect
        if (n != 'Material_#8t' && n != 'mat_3-van1t.jpg' && n != 'mat_1-moskvitch.jpgt' && n != 'Material_#33t' && n != 'mat_2-humvee_desert_tire_diffuse.jpgt' && n !== 'mat_0-taxi_cab.jpgt') {
          m[n].shininess = 900
        } else m[n].shininess = 0

        if (n == 'Material_#294' || n == 'Material_#56' || n == 'mat_0-taxi_cab.jpg') {
          m[n].bumpMap = m[n].map
          m[n].bumpScale = .005
        }

        if (n == 'Material_#8') {
          m[n].bumpMap = m[n].map
          m[n].bumpScale = .003
          m[n].side = THREE.DoubleSide
        }

        if (n == 'mat_3-van1.jpg.001' || n == 'mat_0-humvee_desert_body_diffuse.jpg') {
          m[n].bumpMap = m[n].map
          m[n].bumpScale = .005
          m[n].side = THREE.DoubleSide
        }

        if (n == 'mat_0-moskvitch.jpg' || n == 'mat_1-moskvitch.jpg' || n == 'mat_0-taxi_cab.jpg')
          m[n].side = THREE.DoubleSide

        m[n].specular.setHex(0x131313)
        m[n].needsUpdate = true

      }
    }
}// end modify car materials

function modifyWorldMaterials() {
  for (i = 0; i < worldMat.length; i++)
    if (typeof worldMat !== 'undefined') {
      const m = worldMat.materials
      for (n in m) {
        m[n].bumpMap = m[n].map
        m[n].bumpScale = .6
        m[n].shininess = 200
        m[n].specular.setHex(0x020202)
        // m[n].side=THREE.DoubleSide; //for seeing size of shadowmap on world
        m[n].needsUpdate = true
      }
    }
}// end modify world materials

function switchCars() {
  carModel[cci][0].children[0].remove(engineSound)
  carModel[cci][0].children[0].remove(skidSound)
  carModel[cci][0].children[0].remove(hitSound)
  carModel[cci][0].children[0].remove(hitSound2)
  carModel[cci][0].children[0].remove(hitSound3)
  carModel[cci][0].children[0].remove(hitSound4)
  carModel[cci][0].children[0].remove(hitSound5)
  carModel[cci][0].children[0].remove(popSound)

  cci++; if (cci >= numCars) cci = 0
  dirLight.target = carModel[cci][0]

  carModel[cci][0].children[0].add(engineSound)
  carModel[cci][0].children[0].add(skidSound)
  carModel[cci][0].children[0].add(hitSound)
  carModel[cci][0].children[0].add(hitSound2)
  carModel[cci][0].children[0].add(hitSound3)
  carModel[cci][0].children[0].add(hitSound4)
  carModel[cci][0].children[0].add(hitSound5)
  carModel[cci][0].children[0].add(popSound)

  moveCarForward[cci] = false
  moveCarBackward[cci] = false
  gVehicleSteering[cci] = 0
  steerCarLeft[cci] = false
  steerCarRight[cci] = false

  if (camid == 2) camSwitcher(1)
  if (chaseCammer) chaseStarter = true
  mandalaSet = false; decalRayCast()
}// end switch cars

/* LOOP */

function animate() {
  requestAnimationFrame(animate)
  // fade and delete decals after some ticks
  for (i = 0; i < decals.length; i++)
    if (decals[i] != null) {
      decals[i].material.opacity -= .001
      if (decals[i].material.opacity < 0) {
        scene.remove(decals[i])
        decals[i] = null
      }
    }

  bulletStep()

  if (typeof carModel[numCars - 1][0] !== 'undefined') {
    if (!loadingDone) {
      soundListener.setMasterVolume(1);
      container.style.paddingLeft = '0px';
      container.style.paddingTop = '0px';
      renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
      el('opener').style.visibility = 'visible';
      container.focus();
      document.body.style.backgroundImage = 'none';
      decalRayCast();
      loadingDone = true
    }

    dt = clock.getDelta()
    if (!camStop) camAndKeys.update(dt)
    renderer.render(scene, camera)
  }// end ! undefined
}