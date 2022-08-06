import * as THREE from 'three'
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js'
import { Pathfinding } from '../libs/three-pathfinding.module.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { Player } from './Player.js'
import { fradAnims, ghoulAnims } from './data.js'
import { initLights, ambLight } from '/utils/light.js'
import { getMouseIntersects } from '/utils/helpers.js'
import { cloneGLTF, randomWaypoint } from './utils.js'
import { loadModel } from '/utils/loaders.js'

const assetsPath = '../assets/'
const loader = new GLTFLoader()
const pathfinder = new Pathfinding()
const ghouls = []

const wideCamera = new THREE.Object3D()
wideCamera.target = new THREE.Vector3(0, 0, 0)
const frontCamera = new THREE.Object3D()
frontCamera.position.set(0, 500, 500)
const rearCamera = new THREE.Object3D()
rearCamera.position.set(0, 500, -500)
const cameras = { wideCamera, rearCamera, frontCamera }

/* INIT */

let fred, activeCamera, navmesh

ambLight()
initLights()
camera.position.set(0, 22, 18)
wideCamera.position.copy(camera.position)

loadEnvironment()
loadFred()
loadGhoul()

/* FUNCTIONS */

const raycast = e => {
  const intersects = getMouseIntersects(e, camera, navmesh)
  if (intersects.length)
    fred.newPath(intersects[0].point, true)
}

const switchCamera = () => {
  if (activeCamera == cameras.wideCamera)
    activeCamera = cameras.rearCamera
  else if (activeCamera == cameras.rearCamera)
    activeCamera = cameras.frontCamera
  else if (activeCamera == cameras.frontCamera)
    activeCamera = cameras.wideCamera
}

function loadEnvironment() {
  loader.load(`${assetsPath}dungeon.glb`, model => {
    scene.add(model.scene)
    model.scene.traverse(child => {
      if (child.isMesh)
        if (child.name == 'Navmesh') {
          child.material.visible = false
          navmesh = child
        } else
          child.receiveShadow = true
    })
    pathfinder.setZoneData('dungeon', Pathfinding.createZone(navmesh.geometry))
  })
}

function loadFred() {
  loader.load(`${assetsPath}fred.glb`, model => {
    const object = model.scene.children[0]
    object.traverse(child => {
      if (child.isMesh) child.castShadow = true
    })
    const options = {
      object,
      speed: 5,
      assetsPath,
      loader,
      anims: fradAnims,
      clip: model.animations[0],
      pathfinder,
      name: 'fred',
      npc: false
    }
    fred = new Player(options)
    fred.action = 'idle'
    const scale = 0.015
    fred.object.scale.set(scale, scale, scale)
    fred.object.position.set(-1, 0, 2)

    rearCamera.target = fred.object.position
    fred.object.add(rearCamera)
    frontCamera.target = fred.object.position
    fred.object.add(frontCamera)
    activeCamera = wideCamera
  })
}

function loadGhoul() {
  loader.load(`${assetsPath}ghoul.glb`, model => {
    const gltfs = [model]
    for (let i = 0; i < 3; i++) gltfs.push(cloneGLTF(model))

    gltfs.forEach(model => {
      const object = model.scene.children[0]
      object.traverse(child => {
        if (child.isMesh) child.castShadow = true
      })

      const options = {
        object,
        speed: 4,
        assetsPath,
        loader,
        anims: ghoulAnims,
        clip: model.animations[0],
        pathfinder,
        name: 'ghoul',
        npc: true
      }

      const ghoul = new Player(options)
      const scale = 0.015
      ghoul.object.scale.set(scale, scale, scale)
      ghoul.object.position.copy(randomWaypoint())
      ghoul.newPath(randomWaypoint())
      ghouls.push(ghoul)
    })
    render()
  })
}

/* LOOP */

function render() {
  const delta = clock.getDelta()
  requestAnimationFrame(render)

  if (activeCamera) {
    camera.position.lerp(activeCamera.getWorldPosition(new THREE.Vector3()), 0.1)
    const pos = activeCamera.target.clone()
    pos.y += 1.8
    camera.lookAt(pos)
  }

  fred.update(delta)
  ghouls.forEach(ghoul => ghoul.update(delta))
  renderer.render(scene, camera)
}

/* EVENTS */

renderer.domElement.addEventListener('click', raycast, false)

document.getElementById('camera').addEventListener('click', switchCamera)
