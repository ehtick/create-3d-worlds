/* global THREE */

function createRepeatingTexture(fileName, repeatX, repeatY) {
  const texture = THREE.ImageUtils.loadTexture(fileName)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(repeatX, repeatY)

  return texture
}

function createCastle() {
  const wallTextureName = 'assets/wall.jpg'
  const roofTextureName = 'assets/roof.jpg'
  const gateTextureName = 'assets/gate.png'
  const doorTextureName = 'assets/door.png'
  const floorTextureName = 'assets/floor.jpg'
  const roadTextureName = 'assets/road.png'

  const wallMaterial = new THREE.MeshLambertMaterial({ map: createRepeatingTexture(wallTextureName, 4, 0.8) })

  const floorMaterial = new THREE.MeshLambertMaterial({ map: createRepeatingTexture(floorTextureName, 4, 0.6) })

  const battlementTexture = createRepeatingTexture(wallTextureName, 0.22, 0.33)
  battlementTexture.offset.x = 0.1

  const battlementMaterial = new THREE.MeshLambertMaterial({ map: battlementTexture })

  const towerWallMaterial = new THREE.MeshLambertMaterial({ map: createRepeatingTexture(wallTextureName, 6, 1.5) })

  const roofMaterial = new THREE.MeshLambertMaterial({ map: createRepeatingTexture(roofTextureName, 8, 1.5) })

  const gateBuildingWallMaterial = new THREE.MeshLambertMaterial({ map: createRepeatingTexture(wallTextureName, 1, 1.5) })
  const gateMaterial = new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture(gateTextureName), side: THREE.DoubleSide })

  const buildingWallMaterial = new THREE.MeshLambertMaterial({ map: createRepeatingTexture(wallTextureName, 2, 1.3) })
  const doorMaterial = new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture(doorTextureName), transparent: true })
  const buildingRoofMaterial = new THREE.MeshLambertMaterial({ map: createRepeatingTexture(roofTextureName, 4, 2), side: THREE.DoubleSide })

  const innerRoadMaterial = new THREE.MeshLambertMaterial({ map: createRepeatingTexture(floorTextureName, 2, 0.8) })

  const roadMaterial = new THREE.MeshLambertMaterial({ map: createRepeatingTexture(roadTextureName, 15, 1) })

  function createTower() {
    // create tower cylinder

    const towerHeight = 46
    const radius = 10

    const tower = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, towerHeight, 20), towerWallMaterial)
    tower.castShadow = true
    tower.receiveShadow = true

    tower.position.y = 5

    // create roof

    const roof = new THREE.Mesh(new THREE.CylinderGeometry(0, radius, 16, 20), roofMaterial)
    roof.castShadow = true
    roof.receiveShadow = true

    roof.position.y = towerHeight - 15

    tower.add(roof)

    return tower
  }

  function createWall(wallWidth, wallDepth, withoutTower) {
    // create wall itself

    const wallHeight = 25

    const wallGeometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth)
    const wall = new THREE.Mesh(wallGeometry, new THREE.MeshFaceMaterial([wallMaterial, wallMaterial, floorMaterial, wallMaterial, wallMaterial, wallMaterial]))
    wall.castShadow = true
    wall.receiveShadow = true

    wall.position.y = wallHeight / 2

    wall.height = wallHeight // store height value

    // create and add basements to the wall

    const battlementWidth = 6
    const battlementHeight = 11

    const battlementGeometry = new THREE.BoxGeometry(battlementWidth, battlementHeight, battlementWidth)

    for (let x = 5 + -(wallWidth / 2) + battlementWidth / 2; x < wallWidth / 2 - 5; x += battlementWidth * 2) {
      const battlement = new THREE.Mesh(battlementGeometry, battlementMaterial)
      battlement.castShadow = true
      battlement.receiveShadow = true

      battlement.position.set(x, wallHeight / 2 + battlementWidth / 2, wallDepth / 2 - battlementWidth / 2)
      wall.add(battlement)
    }

    if (!withoutTower) {
      // add tower to the right end of the wall

      const tower = createTower()

      tower.position.x = wallWidth / 2

      wall.add(tower)
    }

    return wall
  }

  function createGate(size) {
    const gateBuildingWidth = size
    const gateBuildingHeight = 40
    const gateBuildingDepth = size

    let gateBuilding = new THREE.Mesh(new THREE.BoxGeometry(gateBuildingWidth, gateBuildingHeight, gateBuildingDepth), gateBuildingWallMaterial)

    gateBuilding.position.y = gateBuildingHeight / 2

    // create gate (2D plane with texture)

    const gateWidth = 24
    const gateHeight = 36

    const gateGeometry = new THREE.PlaneBufferGeometry(gateWidth, gateHeight)

    const gate = new THREE.Mesh(gateGeometry, gateMaterial)
    gate.receiveShadow = true

    gate.position.set(0, -2, gateBuildingDepth / 2)

    gate.name = 'gate'

    // create roof

    const roof = new THREE.Mesh(new THREE.CylinderGeometry(0, 25, 16, 4), roofMaterial)
    roof.castShadow = true

    roof.rotation.y = 0.25 * Math.PI
    roof.position.y = gateBuildingHeight / 2 + 8

    // extract space for the gate from the building

    const gateMesh = new THREE.Mesh(new THREE.BoxGeometry(gateWidth, gateHeight, gateBuildingDepth), new THREE.MeshLambertMaterial())
    gateMesh.position.y = gateHeight / 2

    const subtractedBsp = new ThreeBSP(gateBuilding).subtract(new ThreeBSP(gateMesh))

    gateBuilding = subtractedBsp.toMesh(gateBuildingWallMaterial)
    gateBuilding.geometry.computeVertexNormals()
    gateBuilding.castShadow = true
    gateBuilding.receiveShadow = true

    gateBuilding.add(gate)

    gateBuilding.add(roof)

    return gateBuilding
  }

  function createMainBuilding() {
    const buildingWidth = 98
    const buildingHeight = 45
    const buildingDepth = 80
    const roofHeight = 36

    function createRoof() {
      const roof = new THREE.Mesh(new THREE.PlaneBufferGeometry(buildingDepth, Math.sqrt(Math.pow(buildingWidth / 2, 2) + Math.pow(roofHeight, 2))), buildingRoofMaterial)
      roof.castShadow = true

      return roof
    }

    function createUpperPart() {
      const upperPartGeometry = new THREE.Geometry()

      upperPartGeometry.vertices.push(new THREE.Vector3(-buildingWidth / 2, 0, 0))
      upperPartGeometry.vertices.push(new THREE.Vector3(buildingWidth / 2, 0, 0))
      upperPartGeometry.vertices.push(new THREE.Vector3(0, roofHeight, 0))

      upperPartGeometry.faces.push(new THREE.Face3(0, 1, 2))
      upperPartGeometry.computeFaceNormals()
      assignUvs(upperPartGeometry)

      const upperPart = new THREE.Mesh(upperPartGeometry, buildingWallMaterial)
      upperPart.castShadow = true

      return upperPart
    }

    function createWindow(xRadius, yRadius, material) {
      const ellipse = new THREE.EllipseCurve(0, 0, xRadius, yRadius, 0, Math.PI)
      const ellipsePath = new THREE.Path(ellipse.getPoints(50))

      const windowGeometry = new THREE.ShapeGeometry(ellipsePath.toShapes()[0])

      return new THREE.Mesh(windowGeometry, material)
    }

    const building = new THREE.Mesh(new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth), buildingWallMaterial)
    building.castShadow = true
    building.receiveShadow = true

    building.position.y = buildingHeight / 2

    // add upper part of the building (2D truangles)

    const frontUpperBuildingPart = createUpperPart()
    const backUpperBuildingPart = createUpperPart()

    frontUpperBuildingPart.position.set(0, buildingHeight / 2, buildingDepth / 2)

    building.add(frontUpperBuildingPart)

    backUpperBuildingPart.rotation.y = Math.PI // rotate because only one side is rendered
    backUpperBuildingPart.position.set(0, buildingHeight / 2, -buildingDepth / 2)

    building.add(backUpperBuildingPart)

    // add roof (left and right sides)

    const leftRoof = createRoof()
    const rightRoof = createRoof()

    leftRoof.rotateZ(-0.3 * Math.PI)
    leftRoof.rotateY(0.5 * Math.PI)
    leftRoof.position.y = buildingHeight / 2 + roofHeight / 2 - 0.2
    leftRoof.position.x = -buildingWidth / 2 + 24.6

    building.add(leftRoof)

    rightRoof.rotateZ(0.3 * Math.PI)
    rightRoof.rotateY(0.5 * Math.PI)
    rightRoof.position.y = buildingHeight / 2 + roofHeight / 2 - 0.2
    rightRoof.position.x = buildingWidth / 2 - 24.6

    building.add(rightRoof)

    // create door

    const door = new THREE.Mesh(new THREE.PlaneBufferGeometry(20, 26), doorMaterial)

    door.position.z = buildingDepth / 2 + 0.2
    door.position.y = -10

    building.add(door)

    // add windows

    const windowMaterial = new THREE.MeshBasicMaterial({ color: 0x253D4C })

    const windowXRadius = 4
    const windowYRadius = 11
    const windowMargin = 19
    const windowY = 9

    // front side
    let x
    for (x = -buildingWidth / 2 + windowMargin; x < buildingWidth / 2 - windowMargin; x += windowMargin) {
      var wind = createWindow(windowXRadius, windowYRadius, windowMaterial)

      wind.position.set(x, windowY, buildingDepth / 2 + 0.2)

      building.add(wind)
    }

    // left side
    let z
    for (z = -buildingDepth / 2 + windowMargin; z < buildingDepth / 2 - windowMargin; z += windowMargin) {
      wind = createWindow(windowXRadius, windowYRadius, windowMaterial)

      wind.rotation.y = -0.5 * Math.PI
      wind.position.set(-buildingWidth / 2 - 0.2, windowY, z)

      building.add(wind)
    }

    // right side
    for (z = -buildingDepth / 2 + windowMargin; z < buildingDepth / 2 - windowMargin; z += windowMargin) {
      wind = createWindow(windowXRadius, windowYRadius, windowMaterial)

      wind.rotation.y = 0.5 * Math.PI
      wind.position.set(buildingWidth / 2 + 0.2, windowY, z)

      building.add(wind)
    }

    // a bigger window on front side upper part

    wind = createWindow(8, 24, windowMaterial)

    wind.position.set(0, 26, buildingDepth / 2 + 0.2)

    building.add(wind)

    return building
  }

  function createRoad(length, width, material) {
    const road = new THREE.Mesh(new THREE.PlaneBufferGeometry(length, width), material)
    road.receiveShadow = true
    road.rotation.x = -0.5 * Math.PI
    road.position.y = 0.2

    return road
  }

  const castle = new THREE.Object3D()

  const wallWidth = 210
  const wallDepth = 13

  castle.castleSize = wallWidth + wallDepth * 2

  const gateSize = 35

  const leftWall = createWall(wallWidth, wallDepth)
  const rightWall = createWall(wallWidth, wallDepth)
  const frontWallLeftPart = createWall((wallWidth - gateSize) / 2, wallDepth, true)
  const frontWallRightPart = createWall((wallWidth - gateSize) / 2, wallDepth)
  const backWall = createWall(wallWidth, wallDepth)

  frontWallLeftPart.name = 'frontWallLeft'
  frontWallRightPart.name = 'frontWallRight'

  // set walls position

  frontWallLeftPart.position.z = wallWidth / 2
  frontWallLeftPart.position.x = -(wallWidth - gateSize) / 2 / 2 - 16
  castle.add(frontWallLeftPart)

  frontWallRightPart.position.z = wallWidth / 2
  frontWallRightPart.position.x = (wallWidth - gateSize) / 2 / 2 + 16
  castle.add(frontWallRightPart)

  leftWall.rotation.y = -0.5 * Math.PI
  leftWall.position.x = -wallWidth / 2
  castle.add(leftWall)

  backWall.rotation.y = -1 * Math.PI
  backWall.position.z = -wallWidth / 2
  castle.add(backWall)

  rightWall.rotation.y = 0.5 * Math.PI
  rightWall.position.x = wallWidth / 2
  castle.add(rightWall)

  // add gate

  const gate = createGate(gateSize)
  gate.name = 'gateBuilding'

  castle.add(gate)

  gate.position.z = wallWidth / 2

  // add main castle building

  const building = createMainBuilding()

  building.position.z = -23

  castle.add(building)

  // add road inside the castle

  const innerRoad = createRoad(wallWidth / 2 + 3, 25, innerRoadMaterial)
  innerRoad.rotateZ(0.5 * Math.PI)
  innerRoad.position.z = wallWidth / 2 / 2 + gateSize / 2 - 2

  castle.add(innerRoad)

  // add roads with intersection outside

  const outerRoad = createRoad(850, 35, roadMaterial)
  outerRoad.rotateZ(0.5 * Math.PI)
  outerRoad.position.z = wallWidth / 2 + gateSize / 2 + 425

  castle.add(outerRoad)

  const outerRoad2 = createRoad(1900, 55, roadMaterial)
  outerRoad2.position.z = 600

  castle.add(outerRoad2)

  return castle
}

function createGround() {
  const size = 2000

  const groundGeometry = new THREE.PlaneBufferGeometry(size, size)

  const groundMaterial = new THREE.MeshLambertMaterial({
    map: createRepeatingTexture('assets/grass.jpg', 5, 5)
  })

  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.receiveShadow = true
  ground.rotation.x = -0.5 * Math.PI

  return ground
}

function moveKnight(knight, stepIncr) {
  if (knight.patrolStatus == 'starting')
    knight.position.y -= stepIncr * 100

  else {
    knight.step += stepIncr

    knight.position.x = Math.sin(knight.step) * knight.patrolRadius
    knight.position.y = Math.cos(knight.step) * knight.patrolRadius

    if (knight.rowPos !== undefined) {
      knight.position.x += knight.rowPos * 20
      knight.position.y -= knight.colPos * 20
    }

    knight.rotateY(-stepIncr)
  }
}

function addLight(scene) {
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.7)
  hemiLight.position.set(0, 500, 0)

  scene.add(hemiLight)

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.5)
  dirLight.castShadow = true
  dirLight.position.set(265, 150, -265)

  dirLight.shadowMapWidth = 8192
  dirLight.shadowMapHeight = 8192

  const lightDist = 800
  dirLight.shadowCameraLeft = -lightDist
  dirLight.shadowCameraRight = lightDist
  dirLight.shadowCameraTop = lightDist
  dirLight.shadowCameraBottom = -lightDist

  dirLight.shadowCameraFar = 3500
  dirLight.shadowBias = 0.001
  dirLight.shadowDarkness = 0.35

  scene.add(dirLight)
}

const scene = new THREE.Scene()

scene.fog = new THREE.Fog(0xcccccc, 400, 900)

const renderer = new THREE.WebGLRenderer({ antialias: true })

renderer.setClearColor(0x9fd2f1, 1.0)
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMapEnabled = true

const ground = createGround()

scene.add(ground)

// add castle

const castle = createCastle()

castle.rotation.x = 0.5 * Math.PI

ground.add(castle)

addLight(scene)

// load archer model

const loader = new THREE.JSONLoader()
loader.load('assets/archer_version_3.json',
  (geom, mat) => {
    const archer = new THREE.Mesh(geom, mat[0])

    archer.castShadow = true

    // add archer to the wall
    const walls = [castle.getObjectByName('frontWallLeft'), castle.getObjectByName('frontWallRight')]
    walls.forEach(wall => {
      let i
      for (i = 0; i < 3; i++) {
        const wallArcher = archer.clone()

        wallArcher.position.y = wall.height / 2 + 10
        wallArcher.position.x = -23 + i * 18

        wall.add(wallArcher)
      }
    })
  })

// load knight model

const knights = []
let knight
loader.load('assets/knight.json',
  (geom, mat) => {
    const scale = 1.2

    knight = new THREE.Mesh(geom, mat[0])

    knight.castShadow = true

    knight.rotation.x = 0.5 * Math.PI
    knight.position.z = 12

    knight.scale.set(scale, scale, scale)

    let i
    for (i = 0; i < 3; i++) {
      var j
      for (j = 0; j < 3; j++) {
        const patrolKnight = knight.clone()

        patrolKnight.rowPos = j
        patrolKnight.colPos = i
        patrolKnight.step = 0
        patrolKnight.patrolRadius = castle.castleSize / 2 + 110

        patrolKnight.rotateY(0.5 * Math.PI)

        knights.push(patrolKnight)

        ground.add(patrolKnight)
      }
    }
  })

document.body.appendChild(renderer.domElement)

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.x = -70
camera.position.y = 80
camera.position.z = 260
camera.lookAt(scene.position)

// add ability to rotate/move/zoom camera
const cameraControls = new THREE.TrackballControls(camera, renderer.domElement)
cameraControls.rotateSpeed = 1.0
cameraControls.zoomSpeed = 1.0
cameraControls.panSpeed = 1.0
cameraControls.noZoom = false
cameraControls.noPan = false
cameraControls.staticMoving = true
cameraControls.dynamicDampingFactor = 0.3

const gui = new dat.GUI()
gui.add(new function() {
  this.camera1 = function() {
    cameraControls.reset()

    camera.position.x = -70
    camera.position.y = 80
    camera.position.z = 260

    cameraControls.target = scene.position.clone()
  }
}, 'camera1')
gui.add(new function() {
  this.camera2 = function() {
    cameraControls.reset()

    camera.position.x = -90
    camera.position.y = 80
    camera.position.z = -50

    cameraControls.target = castle.getObjectByName('gateBuilding').position.clone()
  }
}, 'camera2')
gui.add(new function() {
  this.camera3 = function() {
    cameraControls.reset()

    camera.position.x = 120
    camera.position.y = 210
    camera.position.z = -240

    cameraControls.target = castle.position.clone()
  }
}, 'camera3')
gui.add(new function() {
  this.addKnight = function() {
    const patrolKnight = knight.clone()

    patrolKnight.patrolStatus = 'starting'
    patrolKnight.step = Math.PI
    patrolKnight.patrolRadius = castle.castleSize / 2 + 60

    patrolKnight.position.y = -30

    knights.push(patrolKnight)

    ground.add(patrolKnight)

  }
}, 'addKnight')

render()

function render() {
  cameraControls.update()

  let goingThroughGates = false

  knights.forEach(knight => {
    moveKnight(knight, 0.002)

    if (knight.patrolStatus == 'starting') {
      if (castle.castleSize / 2 - 5 < Math.abs(knight.position.y))
        goingThroughGates = true

      if (castle.castleSize / 2 + 50 < Math.abs(knight.position.y)) {
        knight.patrolStatus = 'patrol'

        knight.rotateY(-0.5 * Math.PI)
      }
    }
  })

  const gate = castle.getObjectByName('gate', true)
  gate.visible = !goingThroughGates

  requestAnimationFrame(render)
  renderer.render(scene, camera)
}

// fill UV coordinates (works only for planar surface), code from http://stackoverflow.com/questions/20774648/three-js-generate-uv-coordinate
function assignUvs(geometry) {
  geometry.computeBoundingBox()

  const { max } = geometry.boundingBox
  const { min } = geometry.boundingBox

  const offset = new THREE.Vector2(0 - min.x, 0 - min.y)
  const range = new THREE.Vector2(max.x - min.x, max.y - min.y)

  geometry.faceVertexUvs[0] = []
  const { faces } = geometry

  let i
  for (i = 0; i < geometry.faces.length; i++) {

    const v1 = geometry.vertices[faces[i].a]
    const v2 = geometry.vertices[faces[i].b]
    const v3 = geometry.vertices[faces[i].c]

    geometry.faceVertexUvs[0].push([
      new THREE.Vector2((v1.x + offset.x) / range.x, (v1.y + offset.y) / range.y),
      new THREE.Vector2((v2.x + offset.x) / range.x, (v2.y + offset.y) / range.y),
      new THREE.Vector2((v3.x + offset.x) / range.x, (v3.y + offset.y) / range.y)
    ])
  }

  geometry.uvsNeedUpdate = true
}
