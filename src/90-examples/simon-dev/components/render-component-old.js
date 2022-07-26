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
    this._target = obj
    this.params.scene.add(this._target)

    obj.scale.setScalar(this.params.scale)
    this._target.position.copy(this.parent._position)

    this.Broadcast({
      topic: 'update.position',
      value: this.parent._position,
    })

    let texture = null
    if (this.params.resourceTexture) {
      const texLoader = new THREE.TextureLoader()
      texture = texLoader.load(this.params.resourceTexture)
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
      const action = this._mixer.clipAction(clip)

      action.play()
    }

    const loader = new FBXLoader()
    loader.setPath(this.params.resourcePath)
    loader.load(this.params.resourceAnimation, a => {
      _OnLoad(a)
    })

    this._mixer = new THREE.AnimationMixer(this._target)

    this.parent._mesh = this._target
    this.Broadcast({
      topic: 'load.character',
      model: this._target,
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
    if (this._mixer)
      this._mixer.update(timeInSeconds)
  }
};
