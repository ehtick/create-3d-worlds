/* global THREE, Box2D, generateSquareMaze */
import keyboard from '/classes/Keyboard.js'

let camera = undefined
let scene = undefined
let renderer = undefined
let light = undefined
let maze = undefined
let mazeMesh = undefined
let mazeDimension = 11
let planeMesh = undefined
let ballMesh = undefined
const ballRadius = 0.25
let keyAxis = [0, 0]
const ironTexture = THREE.ImageUtils.loadTexture('textures/ball.png')
const planeTexture = THREE.ImageUtils.loadTexture('textures/concrete.png')
const brickTexture = THREE.ImageUtils.loadTexture('textures/brick.png')
let gameState = undefined

// Box2D shortcuts
const { b2World } = Box2D.Dynamics
const { b2FixtureDef } = Box2D.Dynamics
const { b2BodyDef } = Box2D.Dynamics
const { b2Body } = Box2D.Dynamics
const { b2CircleShape } = Box2D.Collision.Shapes
const { b2PolygonShape } = Box2D.Collision.Shapes
const { b2Vec2 } = Box2D.Common.Math

// Box2D world variables
let wWorld = undefined
let wBall = undefined

function createPhysicsWorld() {
  wWorld = new b2World(new b2Vec2(0, 0), true)

  // Create ball
  const bodyDef = new b2BodyDef()
  bodyDef.type = b2Body.b2_dynamicBody
  bodyDef.position.Set(1, 1)
  wBall = wWorld.CreateBody(bodyDef)
  const fixDef = new b2FixtureDef()
  fixDef.density = 1.0
  fixDef.friction = 0.0
  fixDef.restitution = 0.25
  fixDef.shape = new b2CircleShape(ballRadius)
  wBall.CreateFixture(fixDef)

  // Create maze
  bodyDef.type = b2Body.b2_staticBody
  fixDef.shape = new b2PolygonShape()
  fixDef.shape.SetAsBox(0.5, 0.5)
  for (let i = 0; i < maze.dimension; i++)
    for (let j = 0; j < maze.dimension; j++)
      if (maze[i][j]) {
        bodyDef.position.x = i
        bodyDef.position.y = j
        wWorld.CreateBody(bodyDef).CreateFixture(fixDef)
      }
}

function generate_maze_mesh(field) {
  const dummy = new THREE.Geometry()
  for (let i = 0; i < field.dimension; i++)
    for (let j = 0; j < field.dimension; j++)
      if (field[i][j]) {
        const geometry = new THREE.CubeGeometry(1, 1, 1, 1, 1, 1)
        const mesh_ij = new THREE.Mesh(geometry)
        mesh_ij.position.x = i
        mesh_ij.position.y = j
        mesh_ij.position.z = 0.5
        THREE.GeometryUtils.merge(dummy, mesh_ij)
      }

  const material = new THREE.MeshPhongMaterial({ map: brickTexture })
  const mesh = new THREE.Mesh(dummy, material)
  return mesh
}

function createRenderWorld() {
  scene = new THREE.Scene()

  light = new THREE.PointLight(0xffffff, 1)
  light.position.set(1, 1, 1.3)
  scene.add(light)

  // Add the ball.
  let g = new THREE.SphereGeometry(ballRadius, 32, 16)
  let m = new THREE.MeshPhongMaterial({ map: ironTexture })
  ballMesh = new THREE.Mesh(g, m)
  ballMesh.position.set(1, 1, ballRadius)
  scene.add(ballMesh)

  // Add the camera.
  const aspect = window.innerWidth / window.innerHeight
  camera = new THREE.PerspectiveCamera(60, aspect, 1, 1000)
  camera.position.set(1, 1, 5)
  scene.add(camera)

  // Add the maze.
  mazeMesh = generate_maze_mesh(maze)
  scene.add(mazeMesh)

  // Add the ground.
  g = new THREE.PlaneGeometry(mazeDimension * 10, mazeDimension * 10, mazeDimension, mazeDimension)
  planeTexture.wrapS = planeTexture.wrapT = THREE.RepeatWrapping
  planeTexture.repeat.set(mazeDimension * 5, mazeDimension * 5)
  m = new THREE.MeshPhongMaterial({ map: planeTexture })
  planeMesh = new THREE.Mesh(g, m)
  planeMesh.position.set((mazeDimension - 1) / 2, (mazeDimension - 1) / 2, 0)
  planeMesh.rotation.set(Math.PI / 2, 0, 0)
  scene.add(planeMesh)

}

function updatePhysicsWorld() {
  // Apply "friction".
  const lv = wBall.GetLinearVelocity()
  lv.Multiply(0.95)
  wBall.SetLinearVelocity(lv)

  // Apply user-directed force.
  const f = new b2Vec2(keyAxis[0] * wBall.GetMass() * 0.25, keyAxis[1] * wBall.GetMass() * 0.25)
  wBall.ApplyImpulse(f, wBall.GetPosition())
  keyAxis = [0, 0]

  // Take a time step.
  wWorld.Step(1 / 60, 8, 3)
}

function updateRenderWorld() {
  // Update ball position.
  const stepX = wBall.GetPosition().x - ballMesh.position.x
  const stepY = wBall.GetPosition().y - ballMesh.position.y
  ballMesh.position.x += stepX
  ballMesh.position.y += stepY

  // Update ball rotation.
  let tempMat = new THREE.Matrix4()
  tempMat.makeRotationAxis(new THREE.Vector3(0, 1, 0), stepX / ballRadius)
  tempMat.multiplySelf(ballMesh.matrix)
  ballMesh.matrix = tempMat
  tempMat = new THREE.Matrix4()
  tempMat.makeRotationAxis(new THREE.Vector3(1, 0, 0), -stepY / ballRadius)
  tempMat.multiplySelf(ballMesh.matrix)
  ballMesh.matrix = tempMat
  ballMesh.rotation.getRotationFromMatrix(ballMesh.matrix)

  // Update camera and light positions.
  camera.position.x += (ballMesh.position.x - camera.position.x) * 0.1
  camera.position.y += (ballMesh.position.y - camera.position.y) * 0.1
  camera.position.z += (5 - camera.position.z) * 0.1
  light.position.x = camera.position.x
  light.position.y = camera.position.y
  light.position.z = camera.position.z - 3.7
}

// Create the renderer.
renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// Set the initial game state.
gameState = 'initialize'

function checkInput() {
  if (keyboard.up) return [0, 1]
  if (keyboard.down) return [0, -1]
  if (keyboard.left) return [-1, 0]
  if (keyboard.right) return [1, 0]
  return [0, 0]
}

/* LOOP */

void function gameLoop() {
  switch (gameState) {
    case 'initialize':
      maze = generateSquareMaze(mazeDimension)
      maze[mazeDimension - 1][mazeDimension - 2] = false
      createPhysicsWorld()
      createRenderWorld()
      camera.position.set(1, 1, 5)
      light.position.set(1, 1, 1.3)
      light.intensity = 0
      const level = Math.floor((mazeDimension - 1) / 2 - 4)
      document.getElementById('level').innerHTML = 'Level: ' + level
      gameState = 'fade in'
      break

    case 'fade in':
      light.intensity += 0.1 * (1.0 - light.intensity)
      renderer.render(scene, camera)
      if (Math.abs(light.intensity - 1.0) < 0.05) {
        light.intensity = 1.0
        gameState = 'play'
      }
      break

    case 'play':
      keyAxis = checkInput()
      updatePhysicsWorld()
      updateRenderWorld()
      renderer.render(scene, camera)

      // Check for victory.
      const mazeX = Math.floor(ballMesh.position.x + 0.5)
      const mazeY = Math.floor(ballMesh.position.y + 0.5)
      if (mazeX == mazeDimension && mazeY == mazeDimension - 2) {
        mazeDimension += 2
        gameState = 'fade out'
      }
      break

    case 'fade out':
      updatePhysicsWorld()
      updateRenderWorld()
      light.intensity += 0.1 * (0.0 - light.intensity)
      renderer.render(scene, camera)
      if (Math.abs(light.intensity - 0.0) < 0.1) {
        light.intensity = 0.0
        renderer.render(scene, camera)
        gameState = 'initialize'
      }
      break
  }
  requestAnimationFrame(gameLoop)
}()