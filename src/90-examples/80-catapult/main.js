/* global CANNON */
import * as THREE from '/node_modules/three127/build/three.module.js'
import keyboard from '/classes/Keyboard.js'
import { scene, camera, renderer, clock, createSkyBox } from '/utils/scene.js'
import { ambLight, dirLight } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { loadModel } from '/utils/loaders.js'
import { getTexture } from '/utils/helpers.js'

ambLight({ intensity: 2 })
dirLight({ intensity: 5 })

const stones = [], stonesBody = []
const towerPosition = { x: -60, y: 5, z: 0 }

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
world.add(groundBody)

createStones()

/* FUNCTIONS */

function createStones() {
  const texture = getTexture({ file: 'rocks.jpg', repeat: 1 })
  for (let i = 0; i < 20; i++) {
    const stoneShape = new CANNON.Sphere(0.3)
    const stoneBody = new CANNON.Body({ mass: 80, material: physicsMaterial })
    stoneBody.addShape(stoneShape)
    stonesBody.push(stoneBody)

    const geometry = new THREE.SphereGeometry(stoneShape.radius, 8, 8)
    const material = new THREE.MeshLambertMaterial({
      color: 0x232426,
      side: THREE.FrontSide,
      map: texture
    })
    const stone = new THREE.Mesh(geometry, material)
    stone.castShadow = true
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
  const stoneBody = stonesBody[stoneIndex]
  scene.add(stone)
  world.add(stoneBody)

  stoneBody.velocity.set(
    shootDirection.x * shootVelocity,
    shootDirection.y * shootVelocity,
    shootDirection.z * shootVelocity
  )
  let { x, y, z } = catapult.position
  x += shootDirection.x * (2)
  y += shootDirection.y * (3)
  z += shootDirection.z * (2)

  stoneBody.position.set(x, y, z)
  stone.name = name
  userShootVelocity = 0
  stoneIndex++
}

function victory() {
  document.getElementById('game').innerHTML = 'Victory'
  document.getElementById('game').style.color = '#0AB408'
  document.getElementById('game').style.display = 'block'
}

function gameOver() {
  document.getElementById('game').innerHTML = 'Game over'
  document.getElementById('game').style.color = 'red'
  document.getElementById('game').style.display = 'block'
  scene.add(playerCatapult)
}

const checkVictory = () => {
  if (playerCatapult.parent == null) gameOver()

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
  stonesBody.forEach((stoneBody, i) => {
    stones[i].position.copy(stoneBody.position)
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

  if (keyboard.pressed.KeyA && userShootVelocity < 50) {
    document.getElementById('power').innerHTML = 'power :' + userShootVelocity
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
    activeCamera = camera
    document.getElementById('instruction').style.display = 'none'
    document.getElementById('game').style.display = 'none'
    document.getElementById('game').innerHTML = ''
    pause = false
  }
})
