/* global THREE */

const randnum = (min, max) => Math.round(Math.random() * (max - min) + min)

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

// ===================================================== add canvas
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100000)
renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMapSoft = true // Shadow
renderer.shadowMapType = THREE.PCFShadowMap // Shadow
document.body.appendChild(renderer.domElement)

// ===================================================== add lighting
// scene.fog = new THREE.FogExp2( new THREE.Color("black"), 0.015 );

var light = new THREE.DirectionalLight(new THREE.Color('white'), 1)
light.position.set(1, 0, 1).normalize()
scene.add(light)
var light = new THREE.DirectionalLight(new THREE.Color('white'), 1)
light.position.set(-1, 0, -1).normalize()
scene.add(light)

// ===================================================== resize
window.addEventListener('resize', () => {
  const width = window.innerWidth
  const height = window.innerHeight
  renderer.setSize(width, height)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
})

// ========================================================== tilt shift effects
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

// =========================================================================================== trees
const collisionMesh = []
var geometry = new THREE.BoxBufferGeometry(0.15, 2, 0.15)
// We change the pivot point to be at the bottom of the cube, instead of its center. So we translate the whole geometry.
geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 1, 0))
var material = new THREE.MeshNormalMaterial({ transparent: true, opacity: 0 })
treeLocation = new THREE.Mesh(geometry, material)
scene.add(treeLocation)
treeLocation.position.x = 10
treeLocation.position.z = 10
treeLocation.rotateY(Math.PI)

var loader = new THREE.LegacyJSONLoader()
loader.load('https://raw.githubusercontent.com/baronwatts/models/master/green-tree.js', (geometry, materials) => {

  new Array(100).fill(null).map((d, i) => {
    x = randnum(-15, 15)
    z = randnum(-15, 15)
    y = 0

    const clones = treeLocation.clone()
    clones.position.set(x, y, z)
    collisionMesh.push(clones)
    scene.add(clones)

    const mat = new THREE.MeshLambertMaterial({
      side: THREE.BackSide,
      vertexColors: THREE.FaceColors,
      wireframe: false
    })

    const obj = new THREE.Mesh(geometry, mat)
    obj.scale.set(.5, .5, .5)
    obj.castShadow = true
    // obj.lookAt(new THREE.Vector3(0, 0, 0));
    obj.position.y = -.1
    // obj.material.shading = THREE.SmoothShading;
    // obj.geometry.computeVertexNormals(true);
    // obj.geometry.center();
    clones.rotateY(Math.PI / randnum(0, 4))
    clones.add(obj)

  }) // end array

})

var loader = new THREE.LegacyJSONLoader()
loader.load('https://raw.githubusercontent.com/baronwatts/models/master/green-bush.js', (geometry, materials) => {

  new Array(100).fill(null).map((d, i) => {
    x = randnum(-15, 15)
    z = randnum(-15, 15)
    y = 0

    const clones = treeLocation.clone()
    clones.position.set(x, y, z)
    collisionMesh.push(clones)
    scene.add(clones)

    const mat = new THREE.MeshLambertMaterial({
      side: THREE.BackSide,
      vertexColors: THREE.FaceColors,
      wireframe: false
    })

    const obj = new THREE.Mesh(geometry, mat)
    obj.scale.set(.5, .5, .5)
    obj.castShadow = true
    // obj.lookAt(new THREE.Vector3(0, 0, 0));
    obj.position.y = -.1
    // obj.geometry.center();
    // obj.material.shading = THREE.SmoothShading;
    // obj.geometry.computeVertexNormals(true);
    clones.rotateY(Math.PI / randnum(0, 4))
    clones.add(obj)

  }) // end array

})

// ===================================================== add Terrain
/* THREE.ImageUtils.crossOrigin = '';
  var floorMap = THREE.ImageUtils.loadTexture("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQphSTrsdP1xq6C6dwOYrp7zHxK4uH4xAg1krBtW1eqqzFEPqeV");
  floorMap.wrapS = floorMap.wrapT = THREE.RepeatWrapping;
  floorMap.repeat.set( 30, 30 );
  var groundMaterial = new THREE.MeshPhongMaterial( { shininess: 0, bumpMap: floorMap   } );*/
let terrainMesh
var loader = new THREE.LegacyJSONLoader()
loader.load('https://raw.githubusercontent.com/baronwatts/models/master/terrain.js', (geometry, materials) => {

  // https://stackoverflow.com/questions/52614371/apply-color-gradient-to-material-on-mesh-three-js
  const rev = true
  const cols = [{
    stop: 0,
    color: new THREE.Color('red')
  }, {
    stop: .25,
    color: new THREE.Color('#006400')
  }, {
    stop: .5,
    color: new THREE.Color('#556B2F')
  }, {
    stop: .75,
    color: new THREE.Color('#2E8B57')
  }, {
    stop: 1,
    color: new THREE.Color('#9ACD32')
  }]

  setGradient(geometry, cols, 'z', rev)

  function setGradient(geometry, colors, axis, reverse) {

    geometry.computeBoundingBox()

    const bbox = geometry.boundingBox
    const size = new THREE.Vector3().subVectors(bbox.max, bbox.min)

    const vertexIndices = ['a', 'b', 'c']
    let face, vertex, normalized = new THREE.Vector3(),
      normalizedAxis = 0

    for (let c = 0; c < colors.length - 1; c++) {

      const colorDiff = colors[c + 1].stop - colors[c].stop

      for (let i = 0; i < geometry.faces.length; i++) {
        face = geometry.faces[i]
        for (let v = 0; v < 3; v++) {
          vertex = geometry.vertices[face[vertexIndices[v]]]
          normalizedAxis = normalized.subVectors(vertex, bbox.min).divide(size)[axis]
          if (reverse)
            normalizedAxis = 1 - normalizedAxis

          if (normalizedAxis >= colors[c].stop && normalizedAxis <= colors[c + 1].stop) {
            const localNormalizedAxis = (normalizedAxis - colors[c].stop) / colorDiff
            face.vertexColors[v] = colors[c].color.clone().lerp(colors[c + 1].color, localNormalizedAxis)
          }
        }
      }
    }
  }

  const mat = new THREE.MeshLambertMaterial({
    vertexColors: THREE.VertexColors,
    wireframe: false
  })

  // Set a different color on each face
  /*        for (var i = 0, j = geometry.faces.length; i < j; i++) {
          geometry.faces[i].color = new THREE.Color(
            "hsl(" + Math.floor(Math.random() * 160) + ",50%,50%)"
          );
        }

        var mat = new THREE.MeshLambertMaterial({
          side: THREE.BackSide,
          vertexColors: THREE.FaceColors,
          side: THREE.DoubleSide,
          wireframe: false
        });
*/

  /* var matt = new THREE.MeshLambertMaterial({
      vertexColors: THREE.FaceColors,
      color: "#bf8040"
    });
*/

  terrainMesh = new THREE.Mesh(geometry, mat)
  terrainMesh.scale.set(5, 2.5, 5)
  terrainMesh.receiveShadow = true
  terrainMesh.geometry.center()
  // terrainMesh.material.shading = THREE.SmoothShading;
  // terrainMesh.geometry.computeVertexNormals(true);
  scene.add(terrainMesh)

  // position trees ontop of terrain
  setTimeout(() => {
    collisionMesh.map((d, i) => {
      const raycaster2 = new THREE.Raycaster(d.position, new THREE.Vector3(0, -1, 0))
      intersects2 = raycaster2.intersectObject(terrainMesh)
      d.position.y = intersects2 && intersects2[0] ? intersects2[0].point.y : 0
    })
  }, 4000)

})

const raycastHelperGeometry = new THREE.CylinderGeometry(0, 1, 5, 1.5)
raycastHelperGeometry.translate(0, 0, 0)
raycastHelperGeometry.rotateX(Math.PI / 2)
raycastHelperMesh = new THREE.Mesh(raycastHelperGeometry, new THREE.MeshNormalMaterial())
scene.add(raycastHelperMesh)

// ===================================================== model container
var geometry = new THREE.BoxBufferGeometry(0.2, 0.2, 0.2)
var material = new THREE.MeshNormalMaterial({ transparent: true, opacity: 0 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

var light = new THREE.DirectionalLight(new THREE.Color('white'), 0)
light.position.set(0, 1, 0)
light.castShadow = true
light.target = mesh// shadow will follow mesh
mesh.add(light)

// ===================================================== add Model
const mixers = []
let clip1
let clip2
let clip3
let skeleton

var loader = new THREE.GLTFLoader()
loader.load('https://raw.githubusercontent.com/baronwatts/models/master/autumn_girl_01.glb', object => {
  object.scene.traverse(node => {
    if (node instanceof THREE.Mesh) {
      node.castShadow = true
      node.material.side = THREE.DoubleSide
      /* node.material.shading = THREE.SmoothShading;
        node.geometry.computeVertexNormals(true);*/

    }

    if (node.isSkinnedMesh) {
      skeleton = node.skeleton
      // add gun
      const loader = new THREE.LegacyJSONLoader()
      loader.load('https://raw.githubusercontent.com/baronwatts/models/master/weapon02.js', (geometry, materials) => {
        const gun = new THREE.Mesh(geometry, materials)
        gun.castShadow = true
        gun.geometry.center()
        /* gun.position.y = 10;//MOVES GUN FORWARD
          gun.rotation.x = Math.PI/2;
          gun.rotation.z = Math.PI/1.5;//TILTS GUN SIDEWAYS
          gun.rotation.y = Math.PI;*/

        gun.rotation.z = -Math.PI / 2
        gun.rotation.x = -Math.PI / 2// TILTS GUN SIDEWAYS
        gun.position.y = 25// MOVES GUN FORWARD
        gun.scale.set(75, 75, 75)
        skeleton.bones[22].add(gun)
      })
    }// end if isSkinnedMesh
  })

  const player = object.scene
  player.position.set(0, -.1, 0)
  player.scale.set(.5, .5, .5)
  mesh.add(player)

  const mixer = new THREE.AnimationMixer(player)
  clip0 = mixer.clipAction(object.animations[0])
  clip1 = mixer.clipAction(object.animations[1])
  clip2 = mixer.clipAction(object.animations[2])
  clip3 = mixer.clipAction(object.animations[3])
  mixers.push(mixer)

})

// ===================================================== add Model
// 3D Model from https://www.all3dfree.net/3dcharacter005.html
const collidableMeshList = []
for (var i = 0; i < 1; i++) {
  var geometry = new THREE.BoxBufferGeometry(0.2, .5, 0.2)
  // We change the pivot point to be at the bottom of the cube, instead of its center. So we translate the whole geometry.
  geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, .25, 0))
  var material = new THREE.MeshNormalMaterial({ transparent: true, opacity: 0 })
  var group = new THREE.Mesh(geometry, material)
  collidableMeshList.push(group)
  scene.add(group)
}

// randomly position the enemy
collidableMeshList.map((d, i) => {
  d.position.z = randnum(-50, 50)
  d.position.x = randnum(-50, 50)
})

// group.rotateY(Math.PI);

let SPEED = 1

var loader = new THREE.GLTFLoader()
let die
loader.load('https://raw.githubusercontent.com/baronwatts/models/master/zombie.glb', gltf => {

  gltf.scene.traverse(node => {
    if (node instanceof THREE.Mesh) {
      node.castShadow = true
      node.material.side = THREE.DoubleSide
    }
  })

  firstObject = gltf.scene
  firstObject.scale.set(.12, .12, .12)
  firstObject.position.set(0, -.1, 0)
  group.add(firstObject)

  // console.log(gltf.animations); //shows all animations imported into the dopesheet in blender

  const mixer = new THREE.AnimationMixer(firstObject)
  clip01 = mixer.clipAction(gltf.animations[1])// punch
  clip02 = mixer.clipAction(gltf.animations[0])// die
  clip03 = mixer.clipAction(gltf.animations[2])// run
  mixers.push(mixer)

  clip03.play()

  die = function() {

    clip03.stop()
    clip02.play()
    SPEED = 0 // stop the enemey were he's at

    // restart runing
    setTimeout(() => {
      collidableMeshList.map((d, i) => {
        d.position.z = randnum(-50, 50)
        d.position.x = randnum(-50, 50)
      })

      clip03.play()
      clip02.stop()
      SPEED = 1
    }, 2500)
  }

})

// =========================================================================================== model
var geometry = new THREE.BoxBufferGeometry(0.2, 0.2, 0.2)
var material = new THREE.MeshNormalMaterial({ transparent: true, opacity: 0 })
const mesh2 = new THREE.Mesh(geometry, material)
mesh2.position.set(20, 0, 10)
collisionMesh.push(mesh2)
scene.add(mesh2)

loader = new THREE.LegacyJSONLoader()
loader.load('https://raw.githubusercontent.com/baronwatts/models/master/camp.js', (geometry, materials) => {
  const wall = new THREE.Mesh(geometry, materials)
  wall.rotateY(-Math.PI / 2)
  wall.scale.set(1, 1, 1)
  wall.position.y = -.1
  wall.castShadow = true
  mesh2.add(wall)

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
  const maxForce = window.innerWidth < 1400 ? .085 : .15
  const brakeForce = 10

  const force = maxForce * forward
  const steer = maxSteerVal * turn

  if (forward != 0) {
    mesh.translateZ(force)// move cube
    clip0.play()
    clip3.stop()
  } else {
    clip0.stop()
    clip3.play()
  }
  mesh.rotateY(steer)
}

// =========================================================================================== infrared beam for collision detection
var geometry = new THREE.Geometry()
geometry.vertices.push(
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 20)
)

const line = new THREE.Line(geometry, new THREE.MeshBasicMaterial({ color: new THREE.Color('red'), transparent: true, opacity: 0 }))
line.position.y = .5
mesh.add(line)

// ===================================================== shoot
function PlaySound() {
  bflat.play()
}

document.body.addEventListener('dblclick', e => {

  PlaySound()

  // red beam collision
  const firstBB = new THREE.Box3().setFromObject(line)

  // box collision
  for (let i = 0; i < collidableMeshList.length; i++) {
    const secondBB = new THREE.Box3().setFromObject(collidableMeshList[i])
    if (firstBB.intersectsBox(secondBB))
      die()

  }

  // play animation
  clip2.play()

  // stop animation
  setTimeout(() => {
    clip2.stop()
  }, 900)

  // toggle muzle fire
  /* TweenMax.to("#crosshair", .05, {
    ease: Elastic.easeOut,
    autoAlpha:1,
    onComplete: function(){
      TweenMax.to("#crosshair",.5,{autoAlpha:0});
    }
  });*/

})

camera.position.set(0, .75, -1.5)

// ===================================================== 3rd person view
const followCam = new THREE.Object3D()
followCam.position.copy(camera.position)
scene.add(followCam)
followCam.parent = mesh
function updateCamera() {
  if (followCam) {
    camera.position.lerp(followCam.getWorldPosition(new THREE.Vector3()), 0.1)
    camera.lookAt(mesh.position.x, mesh.position.y + .5, mesh.position.z)
  }
}

const lightPlayer = new THREE.PointLight(new THREE.Color('wheat'), 5, .5)
scene.add(lightPlayer)

// ===================================================== add particle texture for model
const textureLoader = new THREE.TextureLoader()
textureLoader.crossOrigin = '' // allow cross origin loading

const imageSrc = textureLoader.load('data:image/png;base64,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')
const shaderPoint = THREE.ShaderLib.points

uniforms = THREE.UniformsUtils.clone(shaderPoint.uniforms)
uniforms.map.value = imageSrc

const smoke = new THREE.Group()
mesh2.add(smoke)
const matts = new THREE.PointsMaterial({
  size: 5,
  color: new THREE.Color('hsl(' + Math.floor(randnum(10, 50)) + ',50%,50%)'),
  map: uniforms.map.value,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  transparent: true,
  opacity: .5
})

const geo = new THREE.Geometry()
const star = new THREE.Vector3()
geo.vertices.push(star)
const sparks = new THREE.Points(geo, matts)
sparks.scale.set(1, 1, 1)

for (var i = 0; i < 50; i++) {
  const clone = sparks.clone()
  clone.position.set((Math.random() - 0.5) * randnum(randnum(.5, 2), randnum(.5, 2)), 0, (Math.random() - 0.5) * randnum(randnum(.5, 2), randnum(.5, 2)))
  smoke.add(clone)
}

// console.log(smoke.children.length);

// ===================================================== animate
const clock = new THREE.Clock();
(function animate() {
  requestAnimationFrame(animate)
  updateCamera()
  updateDrive()
  renderer.render(scene, camera)
  // composer.render();

  const delta = clock.getDelta()
  mixers.map(x => x.update(delta))

  // position light on the mesh
  lightPlayer.position.x = mesh.position.x
  lightPlayer.position.y = mesh.position.y + .5
  lightPlayer.position.z = mesh.position.z

  // raycast player
  const raycaster = new THREE.Raycaster(mesh.position, new THREE.Vector3(0, -1, 0))
  intersects = raycaster.intersectObject(terrainMesh)
  if (intersects.length > 0) {
    raycastHelperMesh.position.set(0, 0, 0)
    raycastHelperMesh.lookAt(intersects[0].face.normal)
    raycastHelperMesh.position.copy(intersects[0].point)
  }
  // position objects ontop of the terrain
  mesh.position.y = intersects && intersects[0] ? intersects[0].point.y + .1 : 0

  // smoke.rotation.y += .025;
  smoke.children.map((d, i) => {
    d.position.y = d.position.y > 5 ? 0 : d.position.y += (i * .0025)
  })

  // raycast enemy
  collidableMeshList.map((d, i) => {

    const raycaster3 = new THREE.Raycaster(d.position, new THREE.Vector3(0, -1, 0))
    intersects3 = raycaster3.intersectObject(terrainMesh)
    if (intersects3.length > 0) {
      raycastHelperMesh.position.set(0, 0, 0)
      raycastHelperMesh.lookAt(intersects3[0].face.normal)
      raycastHelperMesh.position.copy(intersects3[0].point)
    }

    d.position.y = intersects3 && intersects3[0] ? intersects3[0].point.y + .1 : 0

    // position eneemies direction
    d.lookAt(mesh.position)

    // position enemy to follows you
    let dx = mesh.position.x - d.position.x
    let dz = mesh.position.z - d.position.z
    const length = Math.sqrt(dx * dx + dz * dz)

    // stop the enemy when it gets close to the player
    if (length > 3) {
      dx /= length
      dz /= length
      d.position.x += dx * delta * (SPEED)
      d.position.z += dz * delta * (SPEED)
    } else {
      dx = 3
      dz = 3
      d.position.x += dx * delta * (0)
      d.position.z += dz * delta * (0)
    }
  })

})()