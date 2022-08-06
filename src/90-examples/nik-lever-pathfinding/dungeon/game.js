import * as THREE from 'three'
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js'
import { Pathfinding } from '../libs/three-pathfinding.module.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { Player } from './Player.js'
import { LoadingBar } from './LoadingBar.js'
import { waypoints, fradAnims, ghoulAnims } from './data.js'
import { initLights, ambLight } from '/utils/light.js'
import { getMouseIntersects } from '/utils/helpers.js'
import { cloneGLTF } from './utils.js'

const assetsPath = '../assets/'
const loader = new GLTFLoader()
const loadingBar = new LoadingBar()
const pathfinder = new Pathfinding()
const ghouls = []

const wide = new THREE.Object3D()
wide.target = new THREE.Vector3(0, 0, 0)
const front = new THREE.Object3D()
front.position.set(0, 500, 500)
const rear = new THREE.Object3D()
rear.position.set(0, 500, -500)
const cameras = { wide, rear, front }

let fred, activeCamera, navmesh

/* INIT */

ambLight()
initLights()
camera.position.set(0, 22, 18)
wide.position.copy(camera.position)

/* FUNCTIONS */

const randomWaypoint = () => {
  const i = Math.floor(Math.random() * waypoints.length)
  return waypoints[i]
}

const raycast = e => {
  const intersects = getMouseIntersects(e, camera, navmesh)
  if (intersects.length)
    fred.newPath(intersects[0].point, true)
}

const switchCamera = () => {
  if (activeCamera == cameras.wide)
    activeCamera = cameras.rear
  else if (activeCamera == cameras.rear)
    activeCamera = cameras.front
  else if (activeCamera == cameras.front)
    activeCamera = cameras.wide
}

/* EVENTS */

renderer.domElement.addEventListener('click', raycast, false)

document.getElementById('camera').addEventListener('click', switchCamera)

class Game {
  constructor() {
    this.loadEnvironment()
    this.loadFred()
    this.loadGhoul()
  }

  loadEnvironment() {
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
    },
    xhr => {
      loadingBar.progress = (xhr.loaded / xhr.total) * 0.33 + 0.0
    })
  }

  loadFred() {
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
        app: this,
        pathfinder,
        name: 'fred',
        npc: false
      }
      fred = new Player(options)
      fred.action = 'idle'
      const scale = 0.015
      fred.object.scale.set(scale, scale, scale)
      fred.object.position.set(-1, 0, 2)

      rear.target = fred.object.position
      fred.object.add(rear)
      front.target = fred.object.position
      fred.object.add(front)
      activeCamera = wide
    },
    xhr => {
      loadingBar.progress = (xhr.loaded / xhr.total) * 0.33 + 0.33
    })
  }

  loadGhoul() {
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
          app: this,
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
      this.render()
      loadingBar.visible = false
    },
    xhr => {
      loadingBar.progress = (xhr.loaded / xhr.total) * 0.33 + 0.67
    })
  }

  render() {
    const delta = clock.getDelta()
    requestAnimationFrame(() => this.render())

    if (activeCamera && this.controls === undefined) {
      camera.position.lerp(activeCamera.getWorldPosition(new THREE.Vector3()), 0.1)
      const pos = activeCamera.target.clone()
      pos.y += 1.8
      camera.lookAt(pos)
    }

    fred.update(delta)
    ghouls.forEach(ghoul => ghoul.update(delta))
    renderer.render(scene, camera)
  }
}

new Game()