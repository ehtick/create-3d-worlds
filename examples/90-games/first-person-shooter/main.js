/* global THREE */

THREE.FirstPersonControls = function(camera, MouseMoveSensitivity = 0.002, speed = 800.0, jumpHeight = 350.0, height = 30.0) {
  const self = this

  self.MouseMoveSensitivity = MouseMoveSensitivity
  self.speed = speed
  self.height = height
  self.jumpHeight = self.height + jumpHeight
  self.click = false

  let moveForward = false
  let moveBackward = false
  let moveLeft = false
  let moveRight = false
  let canJump = false
  let run = false

  const velocity = new THREE.Vector3()
  const direction = new THREE.Vector3()

  let prevTime = performance.now()

  camera.rotation.set(0, 0, 0)

  const pitchObject = new THREE.Object3D()
  pitchObject.add(camera)

  const yawObject = new THREE.Object3D()
  yawObject.position.y = 10
  yawObject.add(pitchObject)

  const PI_2 = Math.PI / 2

  const onMouseMove = function(event) {
    if (self.enabled === false) return

    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0

    yawObject.rotation.y -= movementX * self.MouseMoveSensitivity
    pitchObject.rotation.x -= movementY * self.MouseMoveSensitivity

    pitchObject.rotation.x = Math.max(- PI_2, Math.min(PI_2, pitchObject.rotation.x))
  }

  const onKeyDown = (function(event) {
    if (self.enabled === false) return
    switch (event.keyCode) {
      case 38: // up
      case 87: // w
        moveForward = true
        break

      case 37: // left
      case 65: // a
        moveLeft = true
        break

      case 40: // down
      case 83: // s
        moveBackward = true
        break

      case 39: // right
      case 68: // d
        moveRight = true
        break

      case 32: // space
        if (canJump === true) velocity.y += run === false ? self.jumpHeight : self.jumpHeight + 50
        canJump = false
        break

      case 16: // shift
        run = true
        break
    }
  }).bind(this)

  const onKeyUp = (function(event) {
    if (self.enabled === false) return

    switch (event.keyCode) {

      case 38: // up
      case 87: // w
        moveForward = false
        break

      case 37: // left
      case 65: // a
        moveLeft = false
        break

      case 40: // down
      case 83: // s
        moveBackward = false
        break

      case 39: // right
      case 68: // d
        moveRight = false
        break

      case 16: // shift
        run = false
        break
    }
  }).bind(this)

  const onMouseDownClick = (function(event) {
    if (self.enabled === false) return
    self.click = true
  }).bind(this)

  const onMouseUpClick = (function(event) {
    if (self.enabled === false) return
    self.click = false
  }).bind(this)

  self.dispose = function() {
    document.removeEventListener('mousemove', onMouseMove, false)
    document.removeEventListener('keydown', onKeyDown, false)
    document.removeEventListener('keyup', onKeyUp, false)
    document.removeEventListener('mousedown', onMouseDownClick, false)
    document.removeEventListener('mouseup', onMouseUpClick, false)
  }

  document.addEventListener('mousemove', onMouseMove, false)
  document.addEventListener('keydown', onKeyDown, false)
  document.addEventListener('keyup', onKeyUp, false)
  document.addEventListener('mousedown', onMouseDownClick, false)
  document.addEventListener('mouseup', onMouseUpClick, false)

  self.enabled = false

  self.getObject = function() {
    return yawObject
  }

  self.update = function() {
    const time = performance.now()
    const delta = (time - prevTime) / 1000

    velocity.y -= 9.8 * 100.0 * delta
    velocity.x -= velocity.x * 10.0 * delta
    velocity.z -= velocity.z * 10.0 * delta

    direction.z = Number(moveForward) - Number(moveBackward)
    direction.x = Number(moveRight) - Number(moveLeft)
    direction.normalize()

    let currentSpeed = self.speed
    if (run && (moveForward || moveBackward || moveLeft || moveRight)) currentSpeed += (currentSpeed * 1.1)

    if (moveForward || moveBackward) velocity.z -= direction.z * currentSpeed * delta
    if (moveLeft || moveRight) velocity.x -= direction.x * currentSpeed * delta

    self.getObject().translateX(-velocity.x * delta)
    self.getObject().translateZ(velocity.z * delta)

    self.getObject().position.y += (velocity.y * delta)

    if (self.getObject().position.y < self.height) {

      velocity.y = 0
      self.getObject().position.y = self.height

      canJump = true
    }
    prevTime = time
  }
}

let camera, scene, renderer, controls, raycaster, arrow, world

init()

function init() {

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000)

  world = new THREE.Group()

  raycaster = new THREE.Raycaster(camera.getWorldPosition(new THREE.Vector3()), camera.getWorldDirection(new THREE.Vector3()))
  arrow = new THREE.ArrowHelper(camera.getWorldDirection(new THREE.Vector3()), camera.getWorldPosition(new THREE.Vector3()), 3, 0x000000)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff)
  scene.fog = new THREE.Fog(0xffffff, 0, 2000)
  // scene.fog = new THREE.FogExp2 (0xffffff, 0.007);

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.shadowMap.enabled = true
  document.body.appendChild(renderer.domElement)
  renderer.outputEncoding = THREE.sRGBEncoding

  const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75)
  light.position.set(0, 100, 0.4)
  scene.add(light)

  const dirLight = new THREE.SpotLight(0xffffff, .5, 0.0, 180.0)
  dirLight.color.setHSL(0.1, 1, 0.95)
  dirLight.position.set(0, 300, 100)
  dirLight.castShadow = true
  dirLight.lookAt(new THREE.Vector3())
  scene.add(dirLight)

  dirLight.shadow.mapSize.width = 4096
  dirLight.shadow.mapSize.height = 4096
  dirLight.shadow.camera.far = 3000

  controls = new THREE.FirstPersonControls(camera)
  scene.add(controls.getObject())

  // floor

  const floorGeometry = new THREE.PlaneBufferGeometry(2000, 2000, 100, 100)
  const floorMaterial = new THREE.MeshLambertMaterial()
  floorMaterial.color.setHSL(0.095, 1, 0.75)

  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.rotation.x = - Math.PI / 2
  floor.receiveShadow = true
  world.add(floor)

  // objects

  const boxGeometry = new THREE.BoxBufferGeometry(1, 1, 1)
  boxGeometry.translate(0, 0.5, 0)

  for (let i = 0; i < 500; i++) {
    const boxMaterial = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff, flatShading: false, vertexColors: false })

    const mesh = new THREE.Mesh(boxGeometry, boxMaterial)
    mesh.position.x = Math.random() * 1600 - 800
    mesh.position.y = 0
    mesh.position.z = Math.random() * 1600 - 800
    mesh.scale.x = 20
    mesh.scale.y = Math.random() * 80 + 10
    mesh.scale.z = 20
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.updateMatrix()
    mesh.matrixAutoUpdate = false
    world.add(mesh)
  }

  scene.add(world)
}

const particles = new Array()

function makeParticles(intersectPosition) {
  const totalParticles = 80

  const pointsGeometry = new THREE.Geometry()
  pointsGeometry.oldvertices = []
  const colors = []
  for (let i = 0; i < totalParticles; i++) {
    const position = randomPosition(Math.random())
    const vertex = new THREE.Vector3(position[0], position[1], position[2])
    pointsGeometry.oldvertices.push([0, 0, 0])
    pointsGeometry.vertices.push(vertex)
    const color = new THREE.Color(Math.random() * 0xffffff)
    colors.push(color)
  }
  pointsGeometry.colors = colors

  const pointsMaterial = new THREE.PointsMaterial({
    size: .8,
    sizeAttenuation: true,
    depthWrite: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
    vertexColors: THREE.VertexColors
  })

  const points = new THREE.Points(pointsGeometry, pointsMaterial)

  points.prototype = Object.create(THREE.Points.prototype)
  points.position.x = intersectPosition.x
  points.position.y = intersectPosition.y
  points.position.z = intersectPosition.z
  points.updateMatrix()
  points.matrixAutoUpdate = false

  points.prototype.constructor = points
  points.prototype.update = function(index) {
    let pCount = this.constructor.geometry.vertices.length
    let positionYSum = 0
    while (pCount--) {
      const position = this.constructor.geometry.vertices[pCount]
      const oldPosition = this.constructor.geometry.oldvertices[pCount]

      const velocity = {
        x: (position.x - oldPosition[0]),
        y: (position.y - oldPosition[1]),
        z: (position.z - oldPosition[2])
      }

      const oldPositionX = position.x
      let oldPositionY = position.y
      const oldPositionZ = position.z

      position.y -= .03 // gravity

      position.x += velocity.x
      position.y += velocity.y
      position.z += velocity.z

      const wordlPosition = this.constructor.position.y + position.y

      if (wordlPosition <= 0) {
        // particle touched the ground
        oldPositionY = position.y
        position.y = oldPositionY - (velocity.y * .3)
        positionYSum += 1
      }
      this.constructor.geometry.oldvertices[pCount] = [oldPositionX, oldPositionY, oldPositionZ]
    }

    pointsGeometry.verticesNeedUpdate = true

    if (positionYSum >= totalParticles) {
      particles.splice(index, 1)
      scene.remove(this.constructor)
      console.log('particle removed')
    }
  }
  particles.push(points)
  scene.add(points)
}

function randomPosition(radius) {
  radius *= Math.random()
  const theta = Math.random() * 2.0 * Math.PI
  const phi = Math.random() * Math.PI

  const sinTheta = Math.sin(theta)
  const cosTheta = Math.cos(theta)
  const sinPhi = Math.sin(phi)
  const cosPhi = Math.cos(phi)
  const x = radius * sinPhi * cosTheta
  const y = radius * sinPhi * sinTheta
  const z = radius * cosPhi

  return [x, y, z]
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)

  if (controls.enabled === true) {
    controls.update()

    raycaster.set(camera.getWorldPosition(new THREE.Vector3()), camera.getWorldDirection(new THREE.Vector3()))
    scene.remove(arrow)
    arrow = new THREE.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, 5, 0x000000)
    scene.add(arrow)

    if (controls.click === true) {
      const intersects = raycaster.intersectObjects(world.children)

      if (intersects.length > 0) {
        const intersect = intersects[0]
        makeParticles(intersect.point)
      }
    }

    if (particles.length > 0) {
      let pLength = particles.length
      while (pLength--)
        particles[pLength].prototype.update(pLength)
    }
  }
  renderer.render(scene, camera)
}()

/* EVENTS */

const instructions = document.querySelector('#instructions')

document.addEventListener('pointerlockchange', e => {
  if (document.pointerLockElement === document.body) {
    controls.enabled = true
    instructions.style.display = 'none'
  } else {
    controls.enabled = false
    instructions.style.display = '-webkit-box'
  }
})

instructions.addEventListener('click', () => document.body.requestPointerLock())
