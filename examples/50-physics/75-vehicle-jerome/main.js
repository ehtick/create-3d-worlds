/* global THREE, Ammo */

/* UTILS */

class AmmoTerrain {
  constructor(terrainWidth, terrainDepth, terrainMinHeight, terrainMaxHeight, terrain3dWidth, terrain3dDepth) {
    const heightData = generateHeightRocket(terrainWidth, terrainDepth, terrainMinHeight, terrainMaxHeight)
    const geometry = new THREE.PlaneBufferGeometry(terrain3dWidth, terrain3dDepth, terrainWidth - 1, terrainDepth - 1)
    geometry.rotateX(-Math.PI / 2)
    const vertices = geometry.attributes.position.array
    for (let i = 0; i < vertices.length; i++)
      vertices[i * 3 + 1] = heightData[i] // + 1 because we modify y component
    geometry.computeVertexNormals()
    const material = new THREE.MeshLambertMaterial({ color: 0xfffacd })

    const meshGround = new THREE.Mesh(geometry, material)
    meshGround.receiveShadow = true

    const groundShape = createTerrainShape(heightData)
    const groundTransform = new Ammo.btTransform()
    groundTransform.setIdentity()
    // Shifts the terrain, since bullet re-centers it on its bounding box.
    groundTransform.setOrigin(new Ammo.btVector3(0, (terrainMaxHeight + terrainMinHeight) / 2, 0))
    const groundMass = 0
    const groundLocalInertia = new Ammo.btVector3(0, 0, 0)
    const groundMotionState = new Ammo.btDefaultMotionState(groundTransform)
    const groundBody = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(groundMass, groundMotionState, groundShape, groundLocalInertia))

    this.object3d = meshGround
    this.body = groundBody

    function createTerrainShape(heightData) {
    // This parameter is not really used, since we are using PHY_FLOAT height data type and hence it is ignored
      const heightScale = 1
      // Up axis = 0 for X, 1 for Y, 2 for Z. Normally 1 = Y is used.
      const upAxis = 1
      // hdt, height data type. "PHY_FLOAT" is used. Possible values are "PHY_FLOAT", "PHY_UCHAR", "PHY_SHORT"
      const hdt = 'PHY_FLOAT'
      // Set this to your needs (inverts the triangles)
      const flipQuadEdges = false
      // Creates height data buffer in Ammo heap
      const ammoHeightData = Ammo._malloc(4 * terrainWidth * terrainDepth)
      // Copy the javascript height data array to the Ammo one.
      let p = 0
      let p2 = 0
      for (let j = 0; j < terrainDepth; j++)
        for (let i = 0; i < terrainWidth; i++) {
        // write 32-bit float data to memory
          Ammo.HEAPF32[ammoHeightData + p2 >> 2] = heightData[p]
          p++
          // 4 bytes/float
          p2 += 4
        }

      const heightFieldShape = new Ammo.btHeightfieldTerrainShape(
        terrainWidth,
        terrainDepth,
        ammoHeightData,
        heightScale,
        terrainMinHeight,
        terrainMaxHeight,
        upAxis,
        hdt,
        flipQuadEdges
      )
      // Set horizontal scale
      const scaleX = terrain3dWidth / (terrainWidth - 1)
      const scaleZ = terrain3dDepth / (terrainDepth - 1)
      heightFieldShape.setLocalScaling(new Ammo.btVector3(scaleX, 1, scaleZ))
      heightFieldShape.setMargin(0.05)
      return heightFieldShape
    }

    function generateHeightRocket(width, depth, minHeight) {
      const data = new Float32Array(width * depth)
      const radiusX = 24 * 2
      const radiusZ = 24 * 2
      const radiusY = radiusX / 4

      for (let index = 0, z = 0; z < depth; z++)
        for (let x = 0; x < width; x++) {
          let height = minHeight

          if (x > width - radiusX) {
            const delta = x - (width - radiusX)
            const angle = Math.acos(delta / radiusX)
            height = Math.max(height, minHeight - Math.sin(angle) * radiusY + radiusY)
          }
          if (x < radiusX) {
            const delta = radiusX - x
            const angle = Math.acos(delta / radiusX)
            height = Math.max(height, minHeight - Math.sin(angle) * radiusY + radiusY)
          }
          if (z > depth - radiusZ) {
            const delta = z - (depth - radiusZ)
            const angle = Math.acos(delta / radiusZ)
            height = Math.max(height, minHeight - Math.sin(angle) * radiusY + radiusY)
          }
          if (z < radiusZ) {
            const delta = radiusZ - z
            const angle = Math.acos(delta / radiusZ)
            height = Math.max(height, minHeight - Math.sin(angle) * radiusY + radiusY)
          }
          data[index++] = height
        }

      return data
    }
  }
}

class CameraControls {
  constructor(object3d) {
    this.object3d = object3d
    this.offsetCamera = new THREE.Vector3(0, 2, -6).setLength(10)
    this.lookatCamera = new THREE.Vector3(0, 0, +4)
    this.tweenOffset = 0.1
    this.tweenLookAt = 0.1
    this._currentOffset = null
    this._currentLookat = null
  }

  update(ammoVehicle) {
    const object3dVehicle = ammoVehicle.object3d.getObjectByName('chassis')

    const offsetCamera = this.offsetCamera.clone()
    object3dVehicle.localToWorld(offsetCamera)

    if (this._currentOffset === null)
      this._currentOffset = offsetCamera.clone()
	 else
      this._currentOffset.multiplyScalar(1 - this.tweenOffset)
        .add(offsetCamera.clone().multiplyScalar(this.tweenOffset))

    this.object3d.position.copy(this._currentOffset)

    const lookatCamera = this.lookatCamera.clone()
    object3dVehicle.localToWorld(lookatCamera)
    if (this._currentLookat === null)
      this._currentLookat = lookatCamera.clone()
	 else
      this._currentLookat.multiplyScalar(1 - this.tweenLookAt)
        .add(lookatCamera.clone().multiplyScalar(this.tweenLookAt))

    this.object3d.lookAt(this._currentLookat)
  }
}

/* INIT */

const renderer = new THREE.WebGLRenderer()
renderer.setClearColor(new THREE.Color('black'), 1)
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000)
camera.position.z = 10

const speedometer = document.getElementById('speedometer')
const cameraControls = new CameraControls(camera)
const ammoWorld = new THREEx.AmmoWorld()

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

// tremplin
const geometry = new THREE.BoxGeometry(8, 4, 15)
const material = new THREE.MeshPhongMaterial({ color: 0xfffacd })
const mesh = new THREE.Mesh(geometry, material)
mesh.position.x = -10
mesh.position.y = -mesh.geometry.parameters.height / 2 + 1.5
mesh.position.z = 20
mesh.receiveShadow = true
scene.add(mesh)

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

// Pile of crate
const boxGeometry = new THREE.BoxGeometry(0.75, 0.75, 0.75)
const boxMaterial = new THREE.MeshPhongMaterial()
const model = new THREE.Mesh(boxGeometry, boxMaterial)
model.castShadow = model.receiveShadow = true

const size = new THREE.Vector3().set(8, 6, 1)
buildCratesPile(size)

/* FUNCTIONS */

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

const ammoTerrain = new AmmoTerrain(terrainWidth, terrainDepth, terrainMinHeight, terrainMaxHeight, terrain3dWidth, terrain3dDepth)

ammoTerrain.body.setRestitution(0.9)
ammoWorld.physicsWorld.addRigidBody(ammoTerrain.body)
scene.add(ammoTerrain.object3d)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  ammoVehicle.updateKeyboard(vehicleKeyboardActions)
  cameraControls.update(ammoVehicle)
  ammoWorld.update()
  const speed = ammoVehicle.vehicle.getCurrentSpeedKmHour()
  speedometer.innerHTML = (speed < 0 ? '(R) ' : '') + Math.abs(speed).toFixed(1) + ' km/h'
  renderer.render(scene, camera)
}()