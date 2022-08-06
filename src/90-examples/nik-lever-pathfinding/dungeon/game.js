/* global dat */
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

let fred

ambLight()
initLights()
camera.position.set(0, 22, 18)

const randomWaypoint = () => {
  const i = Math.floor(Math.random() * waypoints.length)
  return waypoints[i]
}

class Game {
  constructor() {
    this.loadEnvironment()
    const raycast = e => {
      const intersects = getMouseIntersects(e, camera, this.navmesh)
      if (intersects.length)
        fred.newPath(intersects[0].point, true)
    }
    renderer.domElement.addEventListener('click', raycast, false)
  }

  loadEnvironment() {
    loader.load(`${assetsPath}dungeon.glb`, gltf => {
      scene.add(gltf.scene)
      gltf.scene.traverse(child => {
        if (child.isMesh)
          if (child.name == 'Navmesh') {
            child.material.visible = false
            this.navmesh = child
          } else {
            child.castShadow = false
            child.receiveShadow = true
          }
      })
      pathfinder.setZoneData('dungeon', Pathfinding.createZone(this.navmesh.geometry))
      this.loadFred()
    },
    xhr => {
      loadingBar.progress = (xhr.loaded / xhr.total) * 0.33 + 0.0
    })
  }

  loadFred() {
    loader.load(`${assetsPath}fred.glb`, gltf => {
      const object = gltf.scene.children[0]
      object.traverse(child => {
        if (child.isMesh) child.castShadow = true
      })
      const options = {
        object,
        speed: 5,
        assetsPath,
        loader,
        anims: fradAnims,
        clip: gltf.animations[0],
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

      const wide = new THREE.Object3D()
      wide.position.copy(camera.position)
      wide.target = new THREE.Vector3(0, 0, 0)
      const rear = new THREE.Object3D()
      rear.position.set(0, 500, -500)
      rear.target = fred.object.position
      fred.object.add(rear)
      const front = new THREE.Object3D()
      front.position.set(0, 500, 500)
      front.target = fred.object.position
      fred.object.add(front)
      this.cameras = { wide, rear, front }
      this.activeCamera = wide

      const gui = new dat.GUI()
      gui.add(this, 'switchCamera')
      this.loadGhoul()
    },
    xhr => {
      loadingBar.progress = (xhr.loaded / xhr.total) * 0.33 + 0.33
    })
  }

  loadGhoul() {
    loader.load(`${assetsPath}ghoul.glb`, gltf => {
      const gltfs = [gltf]
      for (let i = 0; i < 3; i++) gltfs.push(cloneGLTF(gltf))
      this.ghouls = []

      gltfs.forEach(gltf => {
        const object = gltf.scene.children[0]
        object.traverse(child => {
          if (child.isMesh) child.castShadow = true
        })

        const options = {
          object,
          speed: 4,
          assetsPath,
          loader,
          anims: ghoulAnims,
          clip: gltf.animations[0],
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
        this.ghouls.push(ghoul)
      })
      this.render()
      loadingBar.visible = false
    },
    xhr => {
      loadingBar.progress = (xhr.loaded / xhr.total) * 0.33 + 0.67
    })
  }

  switchCamera() {
    if (this.activeCamera == this.cameras.wide)
      this.activeCamera = this.cameras.rear
    else if (this.activeCamera == this.cameras.rear)
      this.activeCamera = this.cameras.front
    else if (this.activeCamera == this.cameras.front)
      this.activeCamera = this.cameras.wide
  }

  render() {
    const delta = clock.getDelta()
    requestAnimationFrame(() => this.render())

    if (this.activeCamera && this.controls === undefined) {
      camera.position.lerp(this.activeCamera.getWorldPosition(new THREE.Vector3()), 0.1)
      const pos = this.activeCamera.target.clone()
      pos.y += 1.8
      camera.lookAt(pos)
    }

    fred.update(delta)
    this.ghouls.forEach(ghoul => ghoul.update(delta))
    renderer.render(scene, camera)
  }
}

new Game()