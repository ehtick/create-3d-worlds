/* global THREE */
import CannonHelper from './CannonHelper.js'

const { randInt } = THREE.MathUtils

// flag wave animation
let modifier, cloth

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
const debug = true
const debugPhysics = true
const fixedTimeStep = 1.0 / 60.0

const helper = new CannonHelper(scene)
const physics = {}

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

// We must add the contact materials to the world
world.addContactMaterial(wheelGroundContactMaterial)

// ===================================================== add front & back lighting
var light = new THREE.DirectionalLight(new THREE.Color('gray'), 1)
light.position.set(1, 1, 1).normalize()
scene.add(light)

// ===================================================== resize
window.addEventListener('resize', () => {
  const width = window.innerWidth
  const height = window.innerHeight
  renderer.setSize(width, height)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
})

// ========================================================== effects
const SCALE = 2

const hTilt = new THREE.ShaderPass(THREE.HorizontalTiltShiftShader)
hTilt.enabled = false
hTilt.uniforms.h.value = 4 / (SCALE * window.innerHeight)

const renderPass = new THREE.RenderPass(scene, camera)
const effectCopy = new THREE.ShaderPass(THREE.CopyShader)
effectCopy.renderToScreen = true

const composer = new THREE.EffectComposer(renderer)
composer.addPass(renderPass)
composer.addPass(hTilt)
composer.addPass(effectCopy)

var controls = new function() {
  this.hTilt = false
  this.hTiltR = 0.5
  this.onChange = function() {
    hTilt.enabled = controls.hTilt
    hTilt.uniforms.r.value = controls.hTiltR
  }
}

const gui = new dat.GUI()
gui.add(controls, 'hTilt').onChange(controls.onChange)
gui.add(controls, 'hTiltR', 0, 1).onChange(controls.onChange)

// activate tilt effect
document.querySelector('.dg .c input[type="checkbox"]').click()
dat.GUI.toggleHide()

// =========================================================================================== add tweening
// https://greensock.com/forums/topic/16993-threejs-properties/
Object.defineProperties(THREE.Object3D.prototype, {
  x: {
    get() {
      return this.position.x
    },
    set(v) {
      this.position.x = v
    }
  },
  y: {
    get() {
      return this.position.y
    },
    set(v) {
      this.position.y = v
    }
  },
  z: {
    get() {
      return this.position.z
    },
    set(v) {
      this.position.z = v
    }
  },
  rotationZ: {
    get() {
      return this.rotation.x
    },
    set(v) {
      this.rotation.x = v
    }
  },
  rotationY: {
    get() {
      return this.rotation.y
    },
    set(v) {
      this.rotation.y = v
    }
  },
  rotationX: {
    get() {
      return this.rotation.z
    },
    set(v) {
      this.rotation.z = v
    }
  }
})

// ===================================================== model
var geometry = new THREE.BoxBufferGeometry(.5, 1, .5)
/* We change the pivot point to be at the bottom of the cube, instead of its center. So we translate the whole geometry. */
geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0.5, 0))
var material = new THREE.MeshNormalMaterial({ transparent: true, opacity: 0 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

var light = new THREE.DirectionalLight(new THREE.Color('white'), .5)
light.position.set(0, 1, 0)
light.castShadow = true
light.target = mesh// shadow will follow mesh
mesh.add(light)

// ===================================================== add Model
const mixers = []
let clip1
let clip2
let clip3

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

  /*  var lightPlayer = new THREE.PointLight(new THREE.Color('wheat'), 10, .5);
    mesh.add(lightPlayer);*/

  const mixer = new THREE.AnimationMixer(player)
  clip1 = mixer.clipAction(object.animations[0])
  clip2 = mixer.clipAction(object.animations[1])
  mixers.push(mixer)

})

// ===================================================== add Terrain
const sizeX = 128, sizeY = 128, minHeight = 0, maxHeight = 60
const startPosition = new CANNON.Vec3(0, maxHeight - 3, sizeY * 0.5 - 10)
const img2matrix = function() {

  'use strict'

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

    // document.body.appendChild( canvas );

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

  // console.log(matrix);

  // Array(128) [ (128) […], (128) […], (128) […], (128) […], (128) […], (128) […], (128) […], (128) […], (128) […], (128) […], … ]

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

  // console.log( terrainBody.threemesh.children[0] );

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
var geometry = new THREE.BoxBufferGeometry(0.15, 2, 0.15)
/* We change the pivot point to be at the bottom of the cube, instead of its center. So we translate the whole geometry. */
geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 1, 0))
var material = new THREE.MeshNormalMaterial({ transparent: true, opacity: 0 })
const flagLocation = new THREE.Mesh(geometry, material)
scene.add(flagLocation)
flagLocation.position.x = 10
flagLocation.position.z = 50
flagLocation.rotateY(Math.PI)

// flag pole
var geometry = new THREE.CylinderGeometry(.03, .03, 4, 32)
var material = new THREE.MeshPhongMaterial({ color: new THREE.Color('gray') })
const cylinder = new THREE.Mesh(geometry, material)
cylinder.geometry.center()
cylinder.castShadow = true
flagLocation.add(cylinder)

// flag light
const pointflagLight = new THREE.PointLight(new THREE.Color('red'), 1.5, 5)
pointflagLight.position.set(0, 0, 0)
flagLocation.add(pointflagLight)

var flagLight = new THREE.DirectionalLight(new THREE.Color('white'), 0)
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
addModifier(plane)

function addModifier(mesh) {
  modifier = new ModifierStack(mesh)
  cloth = new Cloth(3, 0)
  cloth.setForce(0.2, -0.2, -0.2)
}
modifier.addModifier(cloth)
cloth.lockXMin(0)
computeNormals: false

// ===================================================== add tree
// 3D Model from http://www.sweethome3d.com/searchModels.jsp?model=tree&x=0&y=0
/* var loader = new THREE.LegacyJSONLoader();

loader.load("https://raw.githubusercontent.com/baronwatts/models/master/moon-vehicle.js", function(geometry, materials) {

     var mat = new THREE.MeshLambertMaterial({
          side: THREE.BackSide,
          vertexColors: THREE.FaceColors,
          wireframe: false
        });

    var obj = new THREE.Mesh(geometry, mat);
    obj.scale.set(.15, .15, .15);
    obj.position.y = -.75;
    obj.position.x = -3;
    obj.position.z = 3;
    obj.castShadow = true;
    flagLocation.add(obj);

});
*/

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

// ===================================================== Joystick
class JoyStick {
  constructor(options) {
    const circle = document.createElement('div')
    circle.style.cssText = 'position:absolute; bottom:35px; width:80px; height:80px; background:rgba(126, 126, 126, 0.5); border:#444 solid medium; border-radius:50%; left:50%; transform:translateX(-50%);'
    const thumb = document.createElement('div')
    thumb.style.cssText = 'position: absolute; left: 20px; top: 20px; width: 40px; height: 40px; border-radius: 50%; background: #fff;'
    circle.appendChild(thumb)
    document.body.appendChild(circle)
    this.domElement = thumb
    this.maxRadius = options.maxRadius || 40
    this.maxRadiusSquared = this.maxRadius * this.maxRadius
    this.onMove = options.onMove
    this.game = options.game
    this.origin = { left: this.domElement.offsetLeft, top: this.domElement.offsetTop }
    this.rotationDamping = options.rotationDamping || 0.06
    this.moveDamping = options.moveDamping || 0.01
    if (this.domElement != undefined) {
      const joystick = this
      if ('ontouchstart' in window)
        this.domElement.addEventListener('touchstart', evt => {
          joystick.tap(evt)
        })
      else
        this.domElement.addEventListener('mousedown', evt => {
          joystick.tap(evt)
        })

    }
  }

  getMousePosition(evt) {
    const clientX = evt.targetTouches ? evt.targetTouches[0].pageX : evt.clientX
    const clientY = evt.targetTouches ? evt.targetTouches[0].pageY : evt.clientY
    return { x: clientX, y: clientY }
  }

  tap(evt) {
    evt = evt || window.event
    // get the mouse cursor position at startup:
    this.offset = this.getMousePosition(evt)
    const joystick = this
    if ('ontouchstart' in window) {
      document.ontouchmove = function(evt) {
        joystick.move(evt)
      }
      document.ontouchend = function(evt) {
        joystick.up(evt)
      }
    } else {
      document.onmousemove = function(evt) {
        joystick.move(evt)
      }
      document.onmouseup = function(evt) {
        joystick.up(evt)
      }
    }
  }

  move(evt) {
    evt = evt || window.event
    const mouse = this.getMousePosition(evt)
    // calculate the new cursor position:
    let left = mouse.x - this.offset.x
    let top = mouse.y - this.offset.y
    // this.offset = mouse;

    const sqMag = left * left + top * top
    if (sqMag > this.maxRadiusSquared) {
      // Only use sqrt if essential
      const magnitude = Math.sqrt(sqMag)
      left /= magnitude
      top /= magnitude
      left *= this.maxRadius
      top *= this.maxRadius
    }
    // set the element's new position:
    this.domElement.style.top = `${top + this.domElement.clientHeight / 2}px`
    this.domElement.style.left = `${left + this.domElement.clientWidth / 2}px`

    // @TODO use nipple,js
    const forward = -(top - this.origin.top + this.domElement.clientHeight / 2) / this.maxRadius
    const turn = (left - this.origin.left + this.domElement.clientWidth / 2) / this.maxRadius

    if (this.onMove != undefined) this.onMove.call(this.game, forward, turn)
  }

  up(evt) {
    if ('ontouchstart' in window) {
      document.ontouchmove = null
      document.touchend = null
    } else {
      document.onmousemove = null
      document.onmouseup = null
    }
    this.domElement.style.top = `${this.origin.top}px`
    this.domElement.style.left = `${this.origin.left}px`

    this.onMove.call(this.game, 0, 0)
  }
}// end joystick class

const js = { forward: 0, turn: 0 }

const joystick = new JoyStick({
  onMove: joystickCallback
})

function joystickCallback(forward, turn) {
  js.forward = forward
  js.turn = -turn
}

function updateDrive(forward = js.forward, turn = js.turn) {
  const maxSteerVal = 0.05
  const maxForce = .15
  const brakeForce = 10

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

// ===================================================== animate
const clock = new THREE.Clock()
let lastTime;
(function animate() {
  requestAnimationFrame(animate)
  updateCamera()
  updateDrive()
  renderer.render(scene, camera)
  // composer.render();

  const delta = clock.getDelta()
  mixers.map(x => x.update(delta))

  /* cannon*/
  const now = Date.now()
  if (lastTime === undefined) lastTime = now
  const dt = (Date.now() - lastTime) / 1000.0
  const FPSFactor = dt
  lastTime = now

  world.step(fixedTimeStep, dt)
  helper.updateBodies(world)

  if (check) check()

  // display coordinates
  info.innerHTML = `<span>X: </span>${mesh.position.x.toFixed(2)}, &nbsp;&nbsp;&nbsp; <span>Y: </span>${mesh.position.y.toFixed(2)}, &nbsp;&nbsp;&nbsp; <span>Z: </span>${mesh.position.z.toFixed(2)}`

  // flag
  modifier && modifier.apply()

})()