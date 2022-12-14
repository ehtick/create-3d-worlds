/* global THREE */

const renderer = new THREE.WebGLRenderer()
renderer.setClearColor(new THREE.Color('black'), 1)
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// array of functions for the rendering loop
const onRenderFcts = []

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000)
camera.position.z = 10

// render the scene
onRenderFcts.push(() => {
  renderer.render(scene, camera)
})

// run the rendering loop
let lastTimeMsec = null
requestAnimationFrame(function animate(nowMsec) {
  requestAnimationFrame(animate)
  // measure time
  lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60
  const deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
  lastTimeMsec = nowMsec
  // call each update function
  onRenderFcts.forEach(callback => {
    callback(deltaMsec / 1000, nowMsec / 1000)
  })
})

const cameraControls = new THREEx.AmmoVehicleControls(camera)
onRenderFcts.push(() => {
  cameraControls.update(ammoVehicle)
})

const ammoWorld = new THREEx.AmmoWorld()
onRenderFcts.push(() => {
  ammoWorld.update()
})

let light = new THREE.AmbientLight(0x202020)
scene.add(light)
light = new THREE.DirectionalLight('white', 0.5)
light.position.set(0.2, 0.5, -2)
scene.add(light)

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
dirLight.position.set(-15, 10, 15).setLength(60)
dirLight.castShadow = true
dirLight.shadow.bias = -0.003
dirLight.shadow.bias = 0.001
dirLight.shadow.camera.near = 1
dirLight.shadow.camera.far = 200
dirLight.shadow.camera.right = 25 * 3
dirLight.shadow.camera.left = - 25 * 3
dirLight.shadow.camera.top = 25
dirLight.shadow.camera.bottom = - 25
dirLight.shadow.mapSize.x = 512
dirLight.shadow.mapSize.y = 512
scene.add(dirLight)

// vehicule
const position = new THREE.Vector3(0, 5, 0)
const quaternion = new THREE.Quaternion(0, 0, 0, 1).setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)
const ammoVehicle = new THREEx.AmmoVehicle(ammoWorld.physicsWorld, position, quaternion)
onRenderFcts.push(() => {
  ammoVehicle.updateKeyboard(vehicleKeyboardActions)
})
scene.add(ammoVehicle.object3d)

buildVehicleSkinVeyron(ammoVehicle.parameters, meshes => {
  applyMeshesToVehicle(ammoVehicle, meshes)
})

function applyMeshesToVehicle(ammoVehicle, meshes) {
  const container = ammoVehicle.object3d.getObjectByName('chassis')
  container.add(meshes.chassis)
  for (let i = 0; i < 4; i++) {
    const container = ammoVehicle.object3d.getObjectByName('wheel_' + i)
    container.add(meshes.wheels[i])
  }
}

// ////////////////////////////////////////////////////////////////////////////
//                handle keyboard
// ////////////////////////////////////////////////////////////////////////////
const vehicleKeyboardActions = {
  'acceleration': false,
  'braking': false,
  'left': false,
  'right': false,
  'jump': false,
}

const keysActions = {
  'w': 'acceleration', 'ArrowUp': 'acceleration', 'i': 'acceleration',
  's': 'braking', 'ArrowDown': 'braking', 'k': 'braking',
  'a': 'left', 'ArrowLeft': 'left', 'j': 'left',
  'd': 'right', 'ArrowRight': 'right', 'l': 'right',
  ' ': 'jump'
}

window.addEventListener('keydown', event => {
  if (!keysActions[event.key]) return
  vehicleKeyboardActions[keysActions[event.key]] = true
  event.preventDefault()
  event.stopPropagation()
})
window.addEventListener('keyup', event => {
  if (!keysActions[event.key]) return
  vehicleKeyboardActions[keysActions[event.key]] = false
  event.preventDefault()
  event.stopPropagation()
})

// ////////////////////////////////////////////////////////////////////////////
//                update speedometer
// ////////////////////////////////////////////////////////////////////////////

const speedometer = document.getElementById('speedometer')
onRenderFcts.push(() => {
  const speed = ammoVehicle.vehicle.getCurrentSpeedKmHour()

  speedometer.innerHTML = (speed < 0 ? '(R) ' : '') + Math.abs(speed).toFixed(1) + ' km/h'
})

// //////////////////////////////////////////////////////////////////////////////
//          tremplin
// //////////////////////////////////////////////////////////////////////////////

const geometry = new THREE.BoxGeometry(8, 4, 15)
const material = new THREE.MeshPhongMaterial({
  map: new THREE.TextureLoader().load('textures/grid.png', texture => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(geometry.parameters.width, geometry.parameters.depth)
    texture.anisotropy = renderer.getMaxAnisotropy()
  })
})
const mesh = new THREE.Mesh(geometry, material)
mesh.position.x = -10
mesh.position.y = -mesh.geometry.parameters.height / 2 + 1.5
mesh.position.z = 20
mesh.receiveShadow = true
scene.add(mesh)
mesh.name = 'tremplin'

const tremplinQuaternion = new THREE.Quaternion(0, 0, 0, 1)
tremplinQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 15)
mesh.quaternion.copy(tremplinQuaternion)

const ammoControls = new THREEx.AmmoControls(mesh, { mass: 0 })
ammoWorld.add(ammoControls)

const createFootball = function() {
  const texture = THREE.ImageUtils.loadTexture('images/Footballballfree.jpg59a2a1dc-64c8-4bc3-83ef-1257c9147fd1Large.jpg')
  const geometry = new THREE.SphereGeometry(0.5, 32, 16)
  const material = new THREE.MeshPhongMaterial({
    map: texture,
    bumpMap: texture,
    bumpScale: 0.1,
  })
  const mesh = new THREE.Mesh(geometry, material)
  return mesh
}

const ballMesh = createFootball()
ballMesh.scale.multiplyScalar(2)
ballMesh.position.y = 5
ballMesh.position.z = -20

ballMesh.castShadow = true
ballMesh.receiveShadow = true

ballMesh.quaternion.set(Math.random(), Math.random(), Math.random(), 1).normalize()

scene.add(ballMesh)

const ammoControlsBall = new THREEx.AmmoControls(ballMesh, { mass: 30 })
ammoControlsBall.setFriction(0.9)
ammoControlsBall.setRestitution(0.95)
ammoWorld.add(ammoControlsBall)

// //////////////////////////////////////////////////////////////////////////////
//          Pile of crate
// //////////////////////////////////////////////////////////////////////////////
const boxGeometry = new THREE.BoxGeometry(0.75, 0.75, 0.75)
const boxMaterial = new THREE.MeshPhongMaterial()
const model = new THREE.Mesh(boxGeometry, boxMaterial)
model.castShadow = model.receiveShadow = true

const size = new THREE.Vector3().set(8, 6, 1)
buildCratesPile(size)

function buildCratesPile(nCubes) {
  for (let x = 0; x < nCubes.x; x++)
    for (let y = 0; y < nCubes.y; y++)
      for (let z = 0; z < nCubes.z; z++) {
        const mesh = model.clone()

        mesh.position.x = (x - nCubes.x / 2 + 0.5) * mesh.scale.x * boxGeometry.parameters.width
        mesh.position.y = (y - nCubes.y / 2 + 0.5) * mesh.scale.y * boxGeometry.parameters.height
        mesh.position.z = (z - nCubes.z / 2 + 0.5) * mesh.scale.z * boxGeometry.parameters.depth

        mesh.position.y += nCubes.y / 2 * mesh.scale.y * boxGeometry.parameters.height
        mesh.position.z += 6
        scene.add(mesh)

        const ammoControls = new THREEx.AmmoControls(mesh)
        ammoWorld.add(ammoControls)
      }
}

// ////////////////////////////////////////////////////////////////////////////
//                Code Separator
// ////////////////////////////////////////////////////////////////////////////

function buildVehicleSkinVeyron(opt, onReady) {
  const meshes = {
    chassis: null,
    wheels: []
  }
  const s = 0.02

  // Vehicle
  const wheelLoader = new THREE.BinaryLoader()
  wheelLoader.load('./obj/veyron_wheel_bin.js', wheelGeometry => {

    const bodyLoader = new THREE.BinaryLoader()
    bodyLoader.load('./obj/veyron_body_bin.js', bodyGeometry => {

      bodyGeometry.applyMatrix(new THREE.Matrix4().makeScale(s, s, s))
      bodyGeometry.computeBoundingBox()
      let bb = bodyGeometry.boundingBox
      bodyGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(
        -(bb.max.x + bb.min.x) * 0.5,
        -(bb.max.y + bb.min.y) * 0.5,
        -(bb.max.z + bb.min.z) * 0.5
      ))

      const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff })
      const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial)
      bodyMesh.position.y = 0.25
      bodyMesh.castShadow = true

      meshes.chassis = bodyMesh

      const wheelMaterial = new THREE.MultiMaterial()
      wheelMaterial.materials[0] = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        reflectivity: 0.75,
        combine: THREE.MixOperation,
      })
      wheelMaterial.materials[1] = new THREE.MeshLambertMaterial({
        color: 0x333333,
      })

      wheelGeometry.applyMatrix(new THREE.Matrix4().makeScale(s, s, s))
      wheelGeometry.computeBoundingBox()
      bb = wheelGeometry.boundingBox
      wheelGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(
        -(bb.max.x + bb.min.x) * 0.5,
        -(bb.max.y + bb.min.y) * 0.5,
        -(bb.max.z + bb.min.z) * 0.5
      ))

      for (let i = 0; i < 4; i++) {
        const wheelmesh = new THREE.Mesh(wheelGeometry, wheelMaterial)
        wheelmesh.castShadow = true
        wheelmesh.receiveShadow = true
        if (i == 0 || i == 3)
          wheelmesh.quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI)
        meshes.wheels.push(wheelmesh)
      }

      onReady(meshes)
    })
  })
};

// Heightfield parameters
const terrain3dWidth = 60
const terrain3dDepth = 120
const terrainWidth = 128 * 2
const terrainDepth = 256 * 2
const terrainMaxHeight = 24 * 2
const terrainMinHeight = 0

const ammoTerrain = new THREEx.AmmoTerrain(terrainWidth, terrainDepth, terrainMinHeight, terrainMaxHeight, terrain3dWidth, terrain3dDepth)

ammoTerrain.body.setRestitution(0.9)
ammoWorld.physicsWorld.addRigidBody(ammoTerrain.body)
scene.add(ammoTerrain.object3d)
