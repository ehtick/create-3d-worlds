/* dat */
import * as THREE from 'three'
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from '/node_modules/three/examples/jsm/loaders/RGBELoader.js'
import { Pathfinding } from '../libs/three-pathfinding.module.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { Player } from './Player.js'
import { LoadingBar } from './LoadingBar.js'
import { waypoints, fradAnims, ghoulAnims } from './data.js'
import { initLights } from '/utils/light.js'
import { normalizeMouse } from '/utils/helpers.js'

const assetsPath = '../assets/'
initLights()
camera.position.set(0, 22, 18)

class Game {
  constructor() {
    const ambient = new THREE.HemisphereLight(0x555555, 0x999999)
    scene.add(ambient)

    this.loadingBar = new LoadingBar()
    this.loadEnvironment()

    this.loading = true
    const raycaster = new THREE.Raycaster()

    const raycast = e => {
      if (this.loading) return
      const mouse = normalizeMouse(e)

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObject(this.navmesh)
      if (intersects.length > 0) {
        const pt = intersects[0].point
        this.fred.newPath(pt, true)
      }
    }
    renderer.domElement.addEventListener('click', raycast, false)
  }

  loadEnvironment() {
    const loader = new GLTFLoader()
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
      this.pathfinder = new Pathfinding()
      this.ZONE = 'dungeon'
      this.pathfinder.setZoneData(this.ZONE, Pathfinding.createZone(this.navmesh.geometry))
      this.loadFred()
    },
    xhr => {
      this.loadingBar.progress = (xhr.loaded / xhr.total) * 0.33 + 0.0
    })
  }

  loadFred() {
    const loader = new GLTFLoader()

    loader.load(`${assetsPath}fred.glb`, gltf => {
      const object = gltf.scene.children[0]
      object.traverse(child => {
        if (child.isMesh)
          child.castShadow = true
      })
      const options = {
        object,
        speed: 5,
        assetsPath,
        loader,
        anims: fradAnims,
        clip: gltf.animations[0],
        app: this,
        name: 'fred',
        npc: false
      }
      this.fred = new Player(options)
      this.loading = false
      this.fred.action = 'idle'
      const scale = 0.015
      this.fred.object.scale.set(scale, scale, scale)
      this.fred.object.position.set(-1, 0, 2)

      const wide = new THREE.Object3D()
      wide.position.copy(camera.position)
      wide.target = new THREE.Vector3(0, 0, 0)
      const rear = new THREE.Object3D()
      rear.position.set(0, 500, -500)
      rear.target = this.fred.object.position
      this.fred.object.add(rear)
      const front = new THREE.Object3D()
      front.position.set(0, 500, 500)
      front.target = this.fred.object.position
      this.fred.object.add(front)
      this.cameras = { wide, rear, front }
      this.activeCamera = wide

      const gui = new dat.GUI()
      gui.add(this, 'switchCamera')
      this.loadGhoul()
    },
    xhr => {
      this.loadingBar.progress = (xhr.loaded / xhr.total) * 0.33 + 0.33
    })
  }

  loadGhoul() {
    const loader = new GLTFLoader()
    loader.load(`${assetsPath}ghoul.glb`, gltf => {
      const gltfs = [gltf]
      for (let i = 0; i < 3; i++) gltfs.push(this.cloneGLTF(gltf))
      this.ghouls = []

      gltfs.forEach(gltf => {
        const object = gltf.scene.children[0]
        object.traverse(child => {
          if (child.isMesh)
            child.castShadow = true
        })

        const options = {
          object,
          speed: 4,
          assetsPath,
          loader,
          anims: ghoulAnims,
          clip: gltf.animations[0],
          app: this,
          name: 'ghoul',
          npc: true
        }

        const ghoul = new Player(options)
        const scale = 0.015
        ghoul.object.scale.set(scale, scale, scale)
        ghoul.object.position.copy(this.randomWaypoint)
        ghoul.newPath(this.randomWaypoint)
        this.ghouls.push(ghoul)
      })
      this.render()
      this.loadingBar.visible = false
    },
    xhr => {
      this.loadingBar.progress = (xhr.loaded / xhr.total) * 0.33 + 0.67
    })
  }

  cloneGLTF(gltf) {
    const clone = {
      animations: gltf.animations,
      scene: gltf.scene.clone(true)
    }

    const skinnedMeshes = {}
    gltf.scene.traverse(node => {
      if (node.isSkinnedMesh)
        skinnedMeshes[node.name] = node
    })

    const cloneBones = {}
    const cloneSkinnedMeshes = {}

    clone.scene.traverse(node => {
      if (node.isBone)
        cloneBones[node.name] = node
      if (node.isSkinnedMesh)
        cloneSkinnedMeshes[node.name] = node
    })

    for (const name in skinnedMeshes) {
      const skinnedMesh = skinnedMeshes[name]
      const { skeleton } = skinnedMesh
      const cloneSkinnedMesh = cloneSkinnedMeshes[name]
      const orderedCloneBones = []
      for (let i = 0; i < skeleton.bones.length; ++i) {
        const cloneBone = cloneBones[skeleton.bones[i].name]
        orderedCloneBones.push(cloneBone)
      }
      cloneSkinnedMesh.bind(
        new THREE.Skeleton(orderedCloneBones, skeleton.boneInverses),
        cloneSkinnedMesh.matrixWorld)
    }
    return clone
  }

  get randomWaypoint() {
    const index = Math.floor(Math.random() * waypoints.length)
    return waypoints[index]
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

    this.fred.update(delta)
    this.ghouls.forEach(ghoul => ghoul.update(delta))
    renderer.render(scene, camera)
  }
}

new Game()