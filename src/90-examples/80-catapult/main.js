import * as THREE from '/node_modules/three127/build/three.module.js'
import * as CANNON from '/libs/cannon-es.js'
import keyboard from '/classes/Keyboard.js'
import { scene, camera, renderer, clock, createSkyBox } from '/utils/scene.js'
import { ambLight, dirLight } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { loadModel } from '/utils/loaders.js'
import { gameOver, victory, hideIntro } from './utils.js'

ambLight({ intensity: 2 })
dirLight({ intensity: 5 })

const stones = []
const towerPosition = { x: -60, y: 5, z: 0 }
const maxVelocity = 50

let activeCamera
let lastEnemyAttack = 0
let userShootVelocity = 4
let stoneIndex = 0
let pause = true

scene.background = createSkyBox()

const ground = createGround({ size: 512, file: 'grass-512.jpg' })
scene.add(ground)

camera.position.set(-64, 14, 7)
camera.lookAt(new THREE.Vector3(-47, 10, 0))

const fpsCamera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 1, 1000)
fpsCamera.position.set(-62, 16, 0)
fpsCamera.lookAt(new THREE.Vector3(-47, 14, 0))

activeCamera = camera

const { mesh: tower } = await loadModel({ file: 'tower/round/tower2.obj', mtl: 'tower/round/tower2.mtl', size: 12 })
tower.position.set(towerPosition.x, towerPosition.y - 4, towerPosition.z)
tower.castShadow = true
scene.add(tower)

const { mesh: catapult } = await loadModel({ file: 'catapult/scene.gltf', size: 1.75 })
const playerCatapult = catapult.clone()
playerCatapult.rotateY(Math.PI / 2)
const enemyCatapult = catapult.clone()
enemyCatapult.rotateY(-Math.PI / 2)

playerCatapult.position.set(towerPosition.x - 1.5, towerPosition.y + 7, towerPosition.z + 1)
scene.add(playerCatapult)

/* INIT PHYSICS */

const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)

const physicsMaterial = new CANNON.Material()

const groundBody = new CANNON.Body({ mass: 0, material: physicsMaterial })
groundBody.addShape(new CANNON.Plane())
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
world.addBody(groundBody)

createStones()

/* FUNCTIONS */

function createStones() {
  for (let i = 0; i < 20; i++) {
    const shape = new CANNON.Sphere(0.3)
    const body = new CANNON.Body({ mass: 80, material: physicsMaterial })
    body.addShape(shape)
    const geometry = new THREE.SphereGeometry(shape.radius, 8, 8)
    const material = new THREE.MeshLambertMaterial({
      color: 0x232426,
      side: THREE.FrontSide,
    })
    const stone = new THREE.Mesh(geometry, material)
    stone.castShadow = true
    stone.body = body
    stones.push(stone)
  }
}

function getRandPosition() {
  const position = new THREE.Vector3()
  const x = -46
  const y = Math.floor(Math.random() * 20)
  position.set(x, y, 0.7)
  return position
}

function positioningEnemy() {
  const pos = getRandPosition()
  scene.add(enemyCatapult)
  enemyCatapult.position.copy(pos)
}

function throwStone(catapult, shootDirection, shootVelocity, name) {
  if (stoneIndex > 19) stoneIndex = 0
  const stone = stones[stoneIndex]
  scene.add(stone)
  world.addBody(stone.body)

  stone.body.velocity.set(
    shootDirection.x * shootVelocity,
    shootDirection.y * shootVelocity,
    shootDirection.z * shootVelocity
  )
  let { x, y, z } = catapult.position
  x += shootDirection.x * (2)
  y += shootDirection.y * (3)
  z += shootDirection.z * (2)

  stone.body.position.set(x, y, z)
  stone.name = name
  userShootVelocity = 0
  stoneIndex++
}

const checkVictory = () => {
  if (playerCatapult.parent == null) {
    gameOver()
    scene.add(playerCatapult)
  }
  let check = 0
  if (enemyCatapult.parent == scene)
    check++

  if (check === 0) victory()
}

function enemyAttack() {
  throwStone(enemyCatapult, new THREE.Vector3(-1, 1, 0), Math.random() * 12.5 + 8, 'enemy')
  checkVictory()
}

function attack() {
  throwStone(playerCatapult, new THREE.Vector3(1, 1, 0), userShootVelocity, 'player')
  checkVictory()
}

function updatePhysics() {
  world.step(1 / 60)
  stones.forEach((stone, i) => {
    stones[i].position.copy(stone.body.position)
  })
}

function checkHit(stone, catapult) {
  if (stone.position.distanceTo(catapult.position) < 1.5)
    scene.remove(catapult)
}

function checkCollison(stone) {
  if (stone.name == 'enemy') checkHit(stone, playerCatapult)
  if (stone.name == 'player') checkHit(stone, enemyCatapult)
}

/* LOOP */

void function update() {
  requestAnimationFrame(update)
  if (pause) return

  if (keyboard.pressed.KeyA && userShootVelocity < maxVelocity) {
    document.getElementById('range').value = userShootVelocity
    userShootVelocity += 0.5
  }

  updatePhysics()

  for (let i = 0; i < stones.length; i++)
    checkCollison(stones[i], [playerCatapult, enemyCatapult])

  if (clock.getElapsedTime() > lastEnemyAttack + 3) {
    lastEnemyAttack = clock.getElapsedTime()
    enemyAttack()
  }
  renderer.render(scene, activeCamera)
}()

/* EVENTS */

window.addEventListener('keyup', e => {
  if (e.code == 'KeyA') attack()

  if (e.code == 'KeyC')
    activeCamera = activeCamera === camera ? fpsCamera : camera

  if (e.code == 'Space') {
    positioningEnemy()
    hideIntro()
    activeCamera = camera
    pause = false
  }
})
