import * as THREE from '/node_modules/three/build/three.module.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { loadModel, loadFbxAnimations } from '/utils/loaders.js'
import { hemLight, dirLight } from '/utils/light.js'
import keyboard from '/utils/classes/Keyboard.js'
import JoyStick from '/utils/classes/JoyStick.js'

hemLight()
dirLight()

scene.background = new THREE.Color(0x605050)
renderer.outputEncoding = THREE.GammaEncoding

let onAction, cameraTarget, environment, activeCamera, currentAction

const animNames = ['ascend-stairs', 'gather-objects', 'look-around', 'push-button', 'run']
const collectables = []
const player = {}
const animations = {}
const cameraFade = 0.05
const actionBtn = document.getElementById('action-btn')
const collected = []

const backCamera = new THREE.Object3D()
backCamera.position.set(0, 100, -250)
const collectCamera = new THREE.Object3D()
collectCamera.position.set(40, 82, 94)
const cameras = { back: backCamera, collect: collectCamera }

// FUNCTION

const setActiveCamera = object => {
  activeCamera = object
}

const toggleBriefcase = () => {
  const briefcase = document.getElementById('briefcase')
  briefcase.style.opacity = Number(briefcase.style.opacity) ? 0 : 1
}

const setAction = name => {
  if (currentAction == name) return
  const anim = animations[name]
  const action = player.mixer.clipAction(anim)
  player.mixer.stopAllAction()
  currentAction = name
  action.time = 0
  action.fadeIn(0.5)
  if (name == 'push-button' || name == 'gather-objects') action.loop = THREE.LoopOnce
  action.play()
  player.actionTime = Date.now()
}

function contextAction() {
  if (!onAction) return

  setAction(onAction.action)

  if (onAction.mode == 'collect') {
    setActiveCamera(cameras.collect)
    collectables[onAction.index].visible = false
    collected.push(onAction.index)
    document.getElementById('briefcase').children[0].children[0].children[onAction.index].children[0].src = onAction.src
  }
}

const playerControl = (forward, turn) => {
  turn = -turn // eslint-disable-line no-param-reassign
  player.move = (forward == 0 && turn == 0) ? null : { forward, turn }

  if (forward > 0) {
    if (currentAction != 'walk' && currentAction != 'run')
      setAction('walk')
  } else if (forward < -0.2) {
    if (currentAction != 'walk') setAction('walk')
  } else
  if (currentAction == 'walk' || currentAction == 'run')
    setAction('look-around')
}

const checkKeyboard = onMove => {
  if (keyboard.pressed.mouse) return
  let forward = 0, turn = 0
  if (keyboard.up) forward = 1
  if (keyboard.down) forward = -1
  if (keyboard.left) turn = -1
  if (keyboard.right) turn = 1
  onMove(forward, turn)
}

function movePlayer(dt) {
  if (!environment) return
  let blocked = false
  const step = 50
  const pos = player.model.position.clone()
  pos.y += 60

  // cast forward
  const dir = new THREE.Vector3()
  player.model.getWorldDirection(dir)
  if (player.move.forward < 0) dir.negate()
  let raycaster = new THREE.Raycaster(pos, dir)

  let intersect = raycaster.intersectObject(environment)
  if (intersect.length > 0 && intersect[0].distance < step)
    blocked = true

  if (!blocked) {
    const speed = (currentAction == 'run') ? 200 : 100
    if (player.move.forward > 0)
      player.model.translateZ(dt * speed)
    else
      player.model.translateZ(-dt * speed * .5)
  }

  // cast down
  dir.set(0, -1, 0)
  pos.y += 200
  raycaster = new THREE.Raycaster(pos, dir)
  const gravity = 30

  intersect = raycaster.intersectObject(environment)
  if (intersect.length) {
    const targetY = pos.y - intersect[0].distance
    if (targetY > player.model.position.y) {
      // Going up
      player.model.position.y = 0.8 * player.model.position.y + 0.2 * targetY
      player.velocityY = 0
    } else if (targetY < player.model.position.y) {
      // Falling
      if (player.velocityY == undefined) player.velocityY = 0
      player.velocityY += dt * gravity
      player.model.position.y -= player.velocityY
      if (player.model.position.y < targetY) {
        player.velocityY = 0
        player.model.position.y = targetY
      }
    }
  }
}

// LOAD GIRL

const { mesh: girlMesh, animations: walkAnim } = await loadModel('lost-treasure/girl-walk.fbx')
player.model = girlMesh
player.mixer = new THREE.AnimationMixer(girlMesh)
player.mixer.addEventListener('finished', () => {
  if (activeCamera == cameras.collect)
    setActiveCamera(cameras.back)
  setAction('look-around')
})
animations.walk = walkAnim[0]
scene.add(girlMesh)

// LOAD ENVIRONMENT

const { mesh: environmentMesh } = await loadModel({ file: 'lost-treasure/factory/scene.gltf', size: 1000 })
scene.add(environmentMesh)

environmentMesh.traverse(child => {
  if (child.isMesh && child.name.includes('mentproxy')) {
    child.material.visible = false
    environment = child
  }
})

// LOAD USB

const { mesh: usbMesh } = await loadModel('item/ammunition-box/scene.gltf')
usbMesh.name = 'usb'
usbMesh.position.set(-416, 0.8, -472)
collectables.push(usbMesh)
scene.add(usbMesh)

// LOAD ANIMATIONS

const otherAnims = await loadFbxAnimations(animNames, 'lost-treasure/')
otherAnims.forEach(clip => {
  animations[clip.name] = clip
  if (clip.name == 'push-button') clip.loop = false
})

setAction('look-around')
player.model.position.y += 50

// INIT

collectCamera.parent = backCamera.parent = player.model
setActiveCamera(backCamera)

new JoyStick({ onMove: playerControl })

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const dt = clock.getDelta()
  checkKeyboard(playerControl)

  if (player.mixer) player.mixer.update(dt)

  if (currentAction == 'walk') {
    const walkingTime = Date.now() - player.actionTime
    if (walkingTime > 1000 && player.move.forward > 0) setAction('run')
  }
  if (player.move) {
    if (player.move.forward) movePlayer(dt)
    player.model.rotateY(player.move.turn * dt)
  }

  if (activeCamera) {
    camera.position.lerp(activeCamera.getWorldPosition(new THREE.Vector3()), cameraFade)
    let pos
    if (cameraTarget) {
      camera.position.copy(cameraTarget.position)
      pos = cameraTarget.target
    } else {
      pos = player.model.position.clone()
      pos.y += 60
    }
    camera.lookAt(pos)
  }

  actionBtn.style = 'display:none;'
  onAction = null

  collectables.forEach(object => {
    if (object.visible && player.model.position.distanceTo(object.position) < 100) {
      actionBtn.style = 'display:block;'
      onAction = { action: 'gather-objects', mode: 'collect', index: 0, src: 'usb.jpg' }
    }
  })

  renderer.render(scene, camera)
}()

/* EVENTS */

document.getElementById('briefcase-btn').onclick = () => toggleBriefcase()

document.getElementById('action-btn').onclick = () => contextAction()
