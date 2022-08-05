/* dat */
import * as THREE from 'three'
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from '/node_modules/three/examples/jsm/loaders/RGBELoader.js'
import { Pathfinding } from '../libs/three-pathfinding.module.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { Player } from './Player.js'
import { LoadingBar } from './LoadingBar.js'
import { waypoints, fradAnims, ghoulAnims } from './data.js'

const assetsPath = '../assets/'

camera.position.set(0, 22, 18)

class Game {
  constructor() {
    const ambient = new THREE.HemisphereLight(0x555555, 0x999999)
    scene.add(ambient)

    this.sun = new THREE.DirectionalLight(0xAAAAFF, 3.5)
    this.sun.castShadow = true
    this.sun.position.set(0, 10, 10)
    scene.add(this.sun)

    this.setSceneEnvironment()

    this.loadingBar = new LoadingBar()
    this.loadEnvironment()

    const raycaster = new THREE.Raycaster()
    renderer.domElement.addEventListener('click', raycast, false)

    this.loading = true

    const self = this
    const mouse = { x: 0, y: 0 }

    function raycast(e) {
      if (self.loading) return

      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = - (e.clientY / window.innerHeight) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObject(self.navmesh)

      if (intersects.length > 0) {
        const pt = intersects[0].point
        self.fred.newPath(pt, true)
      }
    }
  }

  setSceneEnvironment() {
    const loader = new RGBELoader().setDataType(THREE.UnsignedByteType)
    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    pmremGenerator.compileEquirectangularShader()

    loader.load(`${assetsPath}venice_sunset_1k.hdr`, texture => {
      const envMap = pmremGenerator.fromEquirectangular(texture).texture
      pmremGenerator.dispose()
      scene.environment = envMap
    })
  }

  loadEnvironment() {
    const loader = new GLTFLoader()
    const self = this
    loader.load(`${assetsPath}dungeon.glb`, gltf => {
      scene.add(gltf.scene)
      gltf.scene.traverse(child => {
        if (child.isMesh)
          if (child.name == 'Navmesh') {
            child.material.visible = false
            self.navmesh = child
          } else {
            child.castShadow = false
            child.receiveShadow = true
          }
      })

      self.pathfinder = new Pathfinding()
      self.ZONE = 'dungeon'
      self.pathfinder.setZoneData(self.ZONE, Pathfinding.createZone(self.navmesh.geometry))
      self.loadFred()
    },
    xhr => {
      self.loadingBar.progress = (xhr.loaded / xhr.total) * 0.33 + 0.0
    })
  }

  loadFred() {
    const loader = new GLTFLoader()
    const self = this

    loader.load(`${assetsPath}fred.glb`, gltf => {
      const object = gltf.scene.children[0]
      object.traverse(child => {
        if (child.isMesh)
          child.castShadow = true
      })
      self.sun.target = object
      const options = {
        object,
        speed: 5,
        assetsPath,
        loader,
        anims: fradAnims,
        clip: gltf.animations[0],
        app: self,
        name: 'fred',
        npc: false
      }
      self.fred = new Player(options)
      self.loading = false
      self.fred.action = 'idle'
      const scale = 0.015
      self.fred.object.scale.set(scale, scale, scale)
      self.fred.object.position.set(-1, 0, 2)

      const wide = new THREE.Object3D()
      wide.position.copy(camera.position)
      wide.target = new THREE.Vector3(0, 0, 0)
      const rear = new THREE.Object3D()
      rear.position.set(0, 500, -500)
      rear.target = self.fred.object.position
      self.fred.object.add(rear)
      const front = new THREE.Object3D()
      front.position.set(0, 500, 500)
      front.target = self.fred.object.position
      self.fred.object.add(front)
      self.cameras = { wide, rear, front }
      self.activeCamera = wide

      const gui = new dat.GUI()
      gui.add(self, 'switchCamera')
      self.loadGhoul()
    },
    xhr => {
      self.loadingBar.progress = (xhr.loaded / xhr.total) * 0.33 + 0.33
    })
  }

  loadGhoul() {
    const loader = new GLTFLoader()
    const self = this

    loader.load(`${assetsPath}ghoul.glb`, gltf => {
      const gltfs = [gltf]
      for (let i = 0; i < 3; i++) gltfs.push(self.cloneGLTF(gltf))
      self.ghouls = []

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
          app: self,
          name: 'ghoul',
          npc: true
        }

        const ghoul = new Player(options)
        const scale = 0.015
        ghoul.object.scale.set(scale, scale, scale)
        ghoul.object.position.copy(self.randomWaypoint)
        ghoul.newPath(self.randomWaypoint)
        self.ghouls.push(ghoul)
      })
      self.render()
      self.loadingBar.visible = false
    },
    xhr => {
      self.loadingBar.progress = (xhr.loaded / xhr.total) * 0.33 + 0.67
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
    const dt = clock.getDelta()
    const self = this
    requestAnimationFrame(() => self.render())

    this.sun.position.copy(this.fred.object.position)
    this.sun.position.y += 10
    this.sun.position.z += 10

    if (this.activeCamera && this.controls === undefined) {
      camera.position.lerp(this.activeCamera.getWorldPosition(new THREE.Vector3()), 0.1)
      const pos = this.activeCamera.target.clone()
      pos.y += 1.8
      camera.lookAt(pos)
    }

    this.fred.update(dt)
    this.ghouls.forEach(ghoul => ghoul.update(dt))
    renderer.render(scene, camera)
  }
}

new Game()