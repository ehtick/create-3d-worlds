import * as THREE from '/node_modules/three/build/three.module.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { loadModel, loadFbxAnimations } from '/utils/loaders.js'
import { hemLight, dirLight } from '/utils/light.js'
import keyboard from '/classes/Keyboard.js'
import JoyStick from '/classes/JoyStick.js'

hemLight()
dirLight()

scene.background = new THREE.Color(0x605050)
renderer.outputEncoding = THREE.GammaEncoding

let onAction, cameraTarget, collected, environmentProxy

const anims = ['ascend-stairs', 'gather-objects', 'look-around', 'push-button', 'run']
const collect = []
const player = {}
const cameraFade = 0.05
const actionBtn = document.getElementById('action-btn')

// FUNCTION

const setActiveCamera = object => {
  player.cameras.active = object
}

const toggleBriefcase = () => {
  const briefcase = document.getElementById('briefcase')
  briefcase.style.opacity = briefcase.style.opacity > 0 ? '0' : '1'
}

const setAction = name => {
  if (player.action == name) return
  const anim = player[name]
  const action = player.mixer.clipAction(anim, player.root)
  player.mixer.stopAllAction()
  player.action = name
  action.timeScale = (name == 'walk' && player.move && player.move.forward < 0) ? -0.3 : 1
  action.time = 0
  action.fadeIn(0.5)
  if (name == 'push-button' || name == 'gather-objects') action.loop = THREE.LoopOnce
  action.play()
  player.actionTime = Date.now()
}

function contextAction() {
  if (onAction && onAction.action)
    setAction(onAction.action)

  if (onAction.mode == 'collect') {
    setActiveCamera(player.cameras.collect)
    collect[onAction.index].visible = false
    if (!collected) collected = []
    collected.push(onAction.index)
    document.getElementById('briefcase').children[0].children[0].children[onAction.index].children[0].src = onAction.src
  }
}

const playerControl = (forward, turn) => {
  turn = -turn // eslint-disable-line no-param-reassign
  player.move = (forward == 0 && turn == 0) ? null : { forward, turn }

  if (forward > 0) {
    if (player.action != 'walk' && player.action != 'run')
      setAction('walk')
  } else if (forward < -0.2) {
    if (player.action != 'walk') setAction('walk')
  } else
  if (player.action == 'walk' || player.action == 'run')
    setAction('look-around')
}

const checkKeyboard = () => {
  if (keyboard.pressed.mouse) return
  let forward = 0, turn = 0
  if (keyboard.up) forward = 1
  if (keyboard.down) forward = -1
  if (keyboard.left) turn = -1
  if (keyboard.right) turn = 1
  playerControl(forward, turn)
}

function movePlayer(dt) {
  const pos = player.object.position.clone()
  pos.y += 60
  const dir = new THREE.Vector3()
  player.object.getWorldDirection(dir)
  if (player.move.forward < 0) dir.negate()
  let raycaster = new THREE.Raycaster(pos, dir)
  let blocked = false
  const box = environmentProxy

  if (environmentProxy) {
    const intersect = raycaster.intersectObject(box)
    if (intersect.length > 0 && intersect[0].distance < 50) blocked = true
  }

  if (!blocked)
    if (player.move.forward > 0) {
      const speed = (player.action == 'run') ? 200 : 100
      player.object.translateZ(dt * speed)
    } else
      player.object.translateZ(-dt * 30)

  if (environmentProxy) {
    dir.set(-1, 0, 0) // cast left
    dir.applyMatrix4(player.object.matrix)
    dir.normalize()
    raycaster = new THREE.Raycaster(pos, dir)

    let intersect = raycaster.intersectObject(box)
    if (intersect.length > 0 && intersect[0].distance < 50) player.object.translateX(50 - intersect[0].distance)

    dir.set(1, 0, 0) // cast right
    dir.applyMatrix4(player.object.matrix)
    dir.normalize()
    raycaster = new THREE.Raycaster(pos, dir)

    intersect = raycaster.intersectObject(box)
    if (intersect.length > 0 && intersect[0].distance < 50) player.object.translateX(intersect[0].distance - 50)

    dir.set(0, -1, 0) // cast down
    pos.y += 200
    raycaster = new THREE.Raycaster(pos, dir)
    const gravity = 30

    intersect = raycaster.intersectObject(box)
    if (intersect.length > 0) {
      const targetY = pos.y - intersect[0].distance
      if (targetY > player.object.position.y) {
        // Going up
        player.object.position.y = 0.8 * player.object.position.y + 0.2 * targetY
        player.velocityY = 0
      } else if (targetY < player.object.position.y) {
        // Falling
        if (player.velocityY == undefined) player.velocityY = 0
        player.velocityY += dt * gravity
        player.object.position.y -= player.velocityY
        if (player.object.position.y < targetY) {
          player.velocityY = 0
          player.object.position.y = targetY
        }
      }
    }
  }
}

// LOAD GIRL

const { mesh: girlMesh, animations } = await loadModel('lost-treasure/girl-walk.fbx')
player.object = girlMesh
player.mixer = new THREE.AnimationMixer(girlMesh)
player.mixer.addEventListener('finished', () => {
  setAction('look-around')
  if (player.cameras.active == player.cameras.collect) {
    setActiveCamera(player.cameras.back)
    toggleBriefcase()
  }
})
player.root = player.mixer.getRoot()
player.walk = animations[0]
scene.add(girlMesh)

// LOAD ENVIRONMENT

const { mesh: environmentMesh } = await loadModel({ file: 'lost-treasure/factory/scene.gltf', size: 1000 })
scene.add(environmentMesh)

environmentMesh.traverse(child => {
  if (child.isMesh && child.name.includes('mentproxy')) {
    child.material.visible = false
    environmentProxy = child
  }
})

// LOAD USB

const { mesh: usbMesh } = await loadModel('item/ammunition-box/scene.gltf')
usbMesh.name = 'usb'
usbMesh.position.set(-416, 0.8, -472)
collect.push(usbMesh)
scene.add(usbMesh)

// LOAD ANIMATIONS

const otherAnims = await loadFbxAnimations(anims, 'lost-treasure/')
otherAnims.forEach(clip => {
  player[clip.name] = clip
  if (clip.name == 'push-button') player[clip.name].loop = false
})

setAction('look-around')
player.object.position.y += 50

// INIT

const back = new THREE.Object3D()
back.position.set(0, 100, -250)
back.parent = player.object
const collectCamera = new THREE.Object3D()
collectCamera.position.set(40, 82, 94)
collectCamera.parent = player.object
player.cameras = { back, collect: collectCamera }
setActiveCamera(player.cameras.back)

new JoyStick({ onMove: playerControl })

/* LOOP */

void function animate() {
  requestAnimationFrame(() => animate())
  const dt = clock.getDelta()
  checkKeyboard()

  if (player.mixer) player.mixer.update(dt)

  if (player.action == 'walk') {
    const elapsedTime = Date.now() - player.actionTime
    if (elapsedTime > 1000 && player.move.forward > 0) setAction('run')
  }
  if (player.move) {
    if (player.move.forward)
      movePlayer(dt)
    player.object.rotateY(player.move.turn * dt)
  }

  if (player.cameras && player.cameras.active) {
    camera.position.lerp(player.cameras.active.getWorldPosition(new THREE.Vector3()), cameraFade)
    let pos
    if (cameraTarget) {
      camera.position.copy(cameraTarget.position)
      pos = cameraTarget.target
    } else {
      pos = player.object.position.clone()
      pos.y += 60
    }
    camera.lookAt(pos)
  }

  actionBtn.style = 'display:none;'
  let trigger = false

  if (collect && !trigger)
    collect.forEach(object => {
      if (object.visible && player.object.position.distanceTo(object.position) < 100) {
        actionBtn.style = 'display:block;'
        onAction = { action: 'gather-objects', mode: 'collect', index: 0, src: 'usb.jpg' }
        trigger = true
      }
    })

  if (!trigger) onAction = null

  renderer.render(scene, camera)
}()

/* EVENTS */

document.getElementById('briefcase-btn').onclick = () => toggleBriefcase()

document.getElementById('action-btn').onclick = () => contextAction()
