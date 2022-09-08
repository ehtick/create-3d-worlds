/* global THREE, CANNON */
import CannonHelper from './CannonHelper.js'
import JoyStick from './JoyStick.js'

const { randInt } = THREE.MathUtils
const clock = new THREE.Clock()

// ===================================================== scene
const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, .01, 100000)
camera.position.set(1, 1, -1)
camera.lookAt(scene.position)

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMapSoft = true // Shadow
renderer.shadowMap.type = THREE.PCFShadowMap // Shadow
document.body.appendChild(renderer.domElement)

// ===================================================== cannon
const fixedTimeStep = 1.0 / 60.0

const helper = new CannonHelper(scene)

const world = new CANNON.World()

world.broadphase = new CANNON.SAPBroadphase(world)
world.gravity.set(0, -10, 0)
world.defaultContactMaterial.friction = 0

const groundMaterial = new CANNON.Material('groundMaterial')
const wheelMaterial = new CANNON.Material('wheelMaterial')
const wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
  friction: 0,
  restitution: 0,
  contactEquationStiffness: 1000
})

world.addContactMaterial(wheelGroundContactMaterial)

// ===================================================== add front & back lighting
let light = new THREE.DirectionalLight(new THREE.Color('gray'), 1)
light.position.set(1, 1, 1).normalize()
scene.add(light)

// ===================================================== model
let geometry = new THREE.BoxBufferGeometry(.5, 1, .5)
/* change pivot point to be at the bottom of the cube, instead of center */
geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0.5, 0))
let material = new THREE.MeshNormalMaterial({ transparent: true, opacity: 0 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

light = new THREE.DirectionalLight(new THREE.Color('white'), .5)
light.position.set(0, 1, 0)
light.castShadow = true
light.target = mesh// shadow will follow mesh
mesh.add(light)

// ===================================================== add Model
const mixers = []
let clip1
let clip2

const loader = new THREE.GLTFLoader()
loader.load('https://raw.githubusercontent.com/baronwatts/models/master/astronaut.glb', object => {
  object.scene.traverse(node => {
    if (node instanceof THREE.Mesh) {
      node.castShadow = true
      node.material.side = THREE.DoubleSide
    }
  })

  const player = object.scene
  player.position.set(0, -.1, 0)
  player.scale.set(.25, .25, .25)
  mesh.add(player)

  const mixer = new THREE.AnimationMixer(player)
  clip1 = mixer.clipAction(object.animations[0])
  clip2 = mixer.clipAction(object.animations[1])
  mixers.push(mixer)
})

// ===================================================== add Terrain
const sizeX = 128, sizeY = 128, minHeight = 0, maxHeight = 60
const img2matrix = function() {
  return {
    fromImage,
    fromUrl
  }

  function fromImage(image, width, depth, minHeight, maxHeight) {
    width |= 0
    depth |= 0

    let i, j
    const matrix = []
    const canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d')
    let imgData, pixel, channels = 4
    const heightRange = maxHeight - minHeight
    let heightData

    canvas.width = width
    canvas.height = depth

    ctx.drawImage(image, 0, 0, width, depth)
    imgData = ctx.getImageData(0, 0, width, depth).data

    for (i = 0 | 0; i < depth; i = (i + 1) | 0) { // row
      matrix.push([])

      for (j = 0 | 0; j < width; j = (j + 1) | 0) { // col
        pixel = i * depth + j
        heightData = imgData[pixel * channels] / 255 * heightRange + minHeight
        matrix[i].push(heightData)
      }
    }
    return matrix
  }

  function fromUrl(url, width, depth, minHeight, maxHeight) {
    return function() {
      return new Promise((onFulfilled, onRejected) => {
        const image = new Image()
        image.crossOrigin = 'anonymous'
        image.onload = function() {
          const matrix = fromImage(image, width, depth, minHeight, maxHeight)
          onFulfilled(matrix)
        }
        image.src = url
      })
    }
  }
}()

// can add an array if things
let check
Promise.all([
  img2matrix.fromUrl('https://upload.wikimedia.org/wikipedia/commons/5/57/Heightmap.png', sizeX, sizeY, minHeight, maxHeight)(),
]).then(data => {
  const matrix = data[0]

  const terrainShape = new CANNON.Heightfield(matrix, { elementSize: 10 })
  const terrainBody = new CANNON.Body({ mass: 0 })

  terrainBody.addShape(terrainShape)
  terrainBody.position.set(-sizeX * terrainShape.elementSize / 2, -10, sizeY * terrainShape.elementSize / 2)
  terrainBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
  world.add(terrainBody)
  helper.addVisual(terrainBody, 'landscape')

  const raycastHelperGeometry = new THREE.CylinderGeometry(0, 1, 5, 1.5)
  raycastHelperGeometry.translate(0, 0, 0)
  raycastHelperGeometry.rotateX(Math.PI / 2)
  const raycastHelperMesh = new THREE.Mesh(raycastHelperGeometry, new THREE.MeshNormalMaterial())
  scene.add(raycastHelperMesh)

  check = function() {
    const raycaster = new THREE.Raycaster(mesh.position, new THREE.Vector3(0, -1, 0))
    const intersects = raycaster.intersectObject(terrainBody.threemesh.children[0])
    if (intersects.length > 0) {
      raycastHelperMesh.position.set(0, 0, 0)
      raycastHelperMesh.lookAt(intersects[0].face.normal)
      raycastHelperMesh.position.copy(intersects[0].point)
    }
    // position objects ontop of the terrain
    mesh.position.y = intersects && intersects[0] ? intersects[0].point.y + 0.1 : 30

    // raycast flag
    const raycaster2 = new THREE.Raycaster(flagLocation.position, new THREE.Vector3(0, -1, 0))
    const intersects2 = raycaster2.intersectObject(terrainBody.threemesh.children[0])

    // position objects ontop of the terrain
    flagLocation.position.y = intersects2 && intersects2[0] ? intersects2[0].point.y + .5 : 30
    flagLight.position.y = flagLocation.position.y + 50
    flagLight.position.x = flagLocation.position.x + 5
    flagLight.position.z = flagLocation.position.z

  }// end check

})// end Promise

// =========================================================================================== flag
geometry = new THREE.BoxBufferGeometry(0.15, 2, 0.15)
/* We change the pivot point to be at the bottom of the cube, instead of its center. So we translate the whole geometry. */
geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 1, 0))
material = new THREE.MeshNormalMaterial({ transparent: true, opacity: 0 })
const flagLocation = new THREE.Mesh(geometry, material)
scene.add(flagLocation)
flagLocation.position.x = 10
flagLocation.position.z = 50
flagLocation.rotateY(Math.PI)

// flag pole
geometry = new THREE.CylinderGeometry(.03, .03, 4, 32)
material = new THREE.MeshPhongMaterial({ color: new THREE.Color('gray') })
const cylinder = new THREE.Mesh(geometry, material)
cylinder.geometry.center()
cylinder.castShadow = true
flagLocation.add(cylinder)

// flag light
const pointflagLight = new THREE.PointLight(new THREE.Color('red'), 1.5, 5)
pointflagLight.position.set(0, 0, 0)
flagLocation.add(pointflagLight)

const flagLight = new THREE.DirectionalLight(new THREE.Color('white'), 0)
flagLight.position.set(0, 0, 0)
flagLight.castShadow = true
flagLight.target = flagLocation
scene.add(flagLight)

// flag
const texture = new THREE.TextureLoader().load('assets/flag.webp')
const plane = new THREE.Mesh(new THREE.PlaneGeometry(600, 430, 20, 20, true), new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }))
plane.scale.set(.0025, .0025, .0025)
plane.position.set(0, 1.5, 0)
plane.position.x = .75
plane.castShadow = true

flagLocation.add(plane)

// flag wave animation
const modifier = new ModifierStack(plane)
const cloth = new Cloth(3, 0)
cloth.setForce(0.2, -0.2, -0.2)

modifier.addModifier(cloth)
cloth.lockXMin(0)

// ===================================================== add sky particles
const textureLoader = new THREE.TextureLoader()
textureLoader.crossOrigin = '' // allow cross origin loading

const imageSrc = textureLoader.load('https://raw.githubusercontent.com/baronwatts/models/master/snowflake.png')
const shaderPoint = THREE.ShaderLib.points

const uniforms = THREE.UniformsUtils.clone(shaderPoint.uniforms)
uniforms.map.value = imageSrc

const matts = new THREE.PointsMaterial({
  size: 2,
  color: new THREE.Color('white'),
  map: uniforms.map.value,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  transparent: true,
  opacity: 0.75
})

const geo = new THREE.Geometry()
for (let i = 0; i < 1000; i++) {
  const star = new THREE.Vector3()
  geo.vertices.push(star)
}

const sparks = new THREE.Points(geo, matts)
sparks.scale.set(1, 1, 1)
scene.add(sparks)

sparks.geometry.vertices.map((d, i) => {
  d.y = randInt(30, 40)
  d.x = randInt(-500, 500)
  d.z = randInt(-500, 500)
})

const js = { forward: 0, turn: 0 }

new JoyStick({ onMove: joystickCallback })

function joystickCallback(forward, turn) {
  js.forward = forward
  js.turn = -turn
}

function updateDrive(forward = js.forward, turn = js.turn) {
  const maxSteerVal = 0.05
  const maxForce = .15

  const force = maxForce * forward
  const steer = maxSteerVal * turn

  if (forward != 0) {
    mesh.translateZ(force)// move cube
    if (clip2) clip2.play()
    if (clip1) clip1.stop()
  } else {
    if (clip2) clip2.stop()
    if (clip1) clip1.play()
  }
  mesh.rotateY(steer)
}

// ===================================================== 3rd person view
const followCam = new THREE.Object3D()
followCam.position.copy(camera.position)
scene.add(followCam)
followCam.parent = mesh
function updateCamera() {
  if (followCam) {
    camera.position.lerp(followCam.getWorldPosition(new THREE.Vector3()), 0.05)
    camera.lookAt(mesh.position.x, mesh.position.y + .5, mesh.position.z)
  }
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  updateCamera()
  updateDrive()
  renderer.render(scene, camera)

  const delta = clock.getDelta()
  mixers.map(x => x.update(delta))

  /* cannon*/
  world.step(fixedTimeStep, delta)
  helper.updateBodies(world)

  if (check) check()

  modifier?.apply()
}()