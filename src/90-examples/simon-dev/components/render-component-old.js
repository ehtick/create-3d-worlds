import * as THREE from '/node_modules/three127/build/three.module.js'
import { FBXLoader } from '/node_modules/three127/examples/jsm/loaders/FBXLoader.js'
import { GLTFLoader } from '/node_modules/three127/examples/jsm/loaders/GLTFLoader.js'

import { Component } from '../ecs/component.js'

export class AnimatedModelComponent extends Component {
  constructor(params) {
    super()
    this._Init(params)
  }

  InitComponent() {
    this._RegisterHandler('update.position', m => {
      this._OnPosition(m)
    })
  }

  _OnPosition(m) {
    if (this._target) {
      this._target.position.copy(m.value)
      this._target.position.y = 0.35
    }
  }

  _Init(params) {
    this.params_ = params

    this._LoadModels()
  }

  _LoadModels() {
    if (this.params_.resourceName.endsWith('glb') || this.params_.resourceName.endsWith('gltf'))
      this._LoadGLB()
    else if (this.params_.resourceName.endsWith('fbx'))
      this._LoadFBX()

  }

  _OnLoaded(obj, animations) {
    this._target = obj
    this.params_.scene.add(this._target)

    obj.scale.setScalar(this.params_.scale)
    this._target.position.copy(this._parent._position)

    this.Broadcast({
      topic: 'update.position',
      value: this._parent._position,
    })

    let texture = null
    if (this.params_.resourceTexture) {
      const texLoader = new THREE.TextureLoader()
      texture = texLoader.load(this.params_.resourceTexture)
      texture.encoding = THREE.sRGBEncoding
    }

    this._target.traverse(c => {
      let materials = c.material
      if (!(c.material instanceof Array))
        materials = [c.material]

      for (const m of materials)
        if (m) {
          if (texture)
            m.map = texture

          if (this.params_.specular)
            m.specular = this.params_.specular

          if (this.params_.emissive)
            m.emissive = this.params_.emissive

        }

      if (this.params_.receiveShadow != undefined)
        c.receiveShadow = this.params_.receiveShadow

      if (this.params_.castShadow != undefined)
        c.castShadow = this.params_.castShadow

      if (this.params_.visible != undefined)
        c.visible = this.params_.visible

    })

    const _OnLoad = anim => {
      const clip = anim.animations[0]
      const action = this._mixer.clipAction(clip)

      action.play()
    }

    const loader = new FBXLoader()
    loader.setPath(this.params_.resourcePath)
    loader.load(this.params_.resourceAnimation, a => {
      _OnLoad(a)
    })

    this._mixer = new THREE.AnimationMixer(this._target)

    this._parent._mesh = this._target
    this.Broadcast({
      topic: 'load.character',
      model: this._target,
    })
  }

  _LoadGLB() {
    const loader = new GLTFLoader()
    loader.setPath(this.params_.resourcePath)
    loader.load(this.params_.resourceName, glb => {
      this._OnLoaded(glb.scene, glb.animations)
    })
  }

  _LoadFBX() {
    const loader = new FBXLoader()
    loader.setPath(this.params_.resourcePath)
    loader.load(this.params_.resourceName, fbx => {
      this._OnLoaded(fbx)
    })
  }

  Update(timeInSeconds) {
    if (this._mixer)
      this._mixer.update(timeInSeconds)
  }
};
