import * as THREE from '/node_modules/three127/build/three.module.js'
import { FBXLoader } from '/node_modules/three127/examples/jsm/loaders/FBXLoader.js'
import { GLTFLoader } from '/node_modules/three127/examples/jsm/loaders/GLTFLoader.js'

import { Component } from '../ecs/component.js'

export class AnimatedModelComponent extends Component {
  constructor(params) {
    super()
    this.Init(params)
  }

  InitComponent() {
    this.RegisterHandler('update.position', m => {
      this._OnPosition(m)
    })
  }

  _OnPosition(m) {
    if (this.target) {
      this.target.position.copy(m.value)
      this.target.position.y = 0.35
    }
  }

  Init(params) {
    this.params = params

    this._LoadModels()
  }

  _LoadModels() {
    if (this.params.resourceName.endsWith('glb') || this.params.resourceName.endsWith('gltf'))
      this._LoadGLB()
    else if (this.params.resourceName.endsWith('fbx'))
      this._LoadFBX()

  }

  _OnLoaded(obj, animations) {
    this.target = obj
    this.params.scene.add(this.target)

    obj.scale.setScalar(this.params.scale)
    this.target.position.copy(this.parent.position)

    this.Broadcast({
      topic: 'update.position',
      value: this.parent.position,
    })

    let texture = null
    if (this.params.resourceTexture) {
      const texLoader = new THREE.TextureLoader()
      texture = texLoader.load(this.params.resourceTexture)
      texture.encoding = THREE.sRGBEncoding
    }

    this.target.traverse(c => {
      let materials = c.material
      if (!(c.material instanceof Array))
        materials = [c.material]

      for (const m of materials)
        if (m) {
          if (texture)
            m.map = texture

          if (this.params.specular)
            m.specular = this.params.specular

          if (this.params.emissive)
            m.emissive = this.params.emissive

        }

      if (this.params.receiveShadow != undefined)
        c.receiveShadow = this.params.receiveShadow

      if (this.params.castShadow != undefined)
        c.castShadow = this.params.castShadow

      if (this.params.visible != undefined)
        c.visible = this.params.visible

    })

    const _OnLoad = anim => {
      const clip = anim.animations[0]
      const action = this.mixer.clipAction(clip)

      action.play()
    }

    const loader = new FBXLoader()
    loader.setPath(this.params.resourcePath)
    loader.load(this.params.resourceAnimation, a => {
      _OnLoad(a)
    })

    this.mixer = new THREE.AnimationMixer(this.target)

    this.parent._mesh = this.target
    this.Broadcast({
      topic: 'load.character',
      model: this.target,
    })
  }

  _LoadGLB() {
    const loader = new GLTFLoader()
    loader.setPath(this.params.resourcePath)
    loader.load(this.params.resourceName, glb => {
      this._OnLoaded(glb.scene, glb.animations)
    })
  }

  _LoadFBX() {
    const loader = new FBXLoader()
    loader.setPath(this.params.resourcePath)
    loader.load(this.params.resourceName, fbx => {
      this._OnLoaded(fbx)
    })
  }

  Update(timeInSeconds) {
    if (this.mixer)
      this.mixer.update(timeInSeconds)
  }
};
