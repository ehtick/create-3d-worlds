import * as THREE from '/node_modules/three127/build/three.module.js'
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.127/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.127/examples/jsm/loaders/OBJLoader.js'

import { Component } from '../ecs/component.js'

export class RenderComponent extends Component {
  constructor(params) {
    super()
    this.group_ = new THREE.Group()
    this.params = params
    this.params.scene.add(this.group_)
  }

  Destroy() {
    this.group_.traverse(c => {
      if (c.material)
        c.material.dispose()

      if (c.geometry)
        c.geometry.dispose()
    })
    this.params.scene.remove(this.group_)
  }

  InitEntity() {
    this.Init(this.params)
  }

  Init(params) {
    this.params = params

    this._LoadModels()
  }

  InitComponent() {
    this._RegisterHandler('update.position', m => {
      this._OnPosition(m)
    })
    this._RegisterHandler('update.rotation', m => {
      this._OnRotation(m)
    })
  }

  _OnPosition(m) {
    this.group_.position.copy(m.value)
  }

  _OnRotation(m) {
    this.group_.quaternion.copy(m.value)
  }

  _LoadModels() {
    if (this.params.resourceName.endsWith('glb'))
      this._LoadGLB()
    else if (this.params.resourceName.endsWith('fbx'))
      this._LoadFBX()
    else if (this.params.resourceName.endsWith('obj'))
      this._LoadOBJ()
  }

  _OnLoaded(obj) {
    this.target = obj
    this.group_.add(this.target)
    this.target.scale.setScalar(this.params.scale)

    const textures = {}
    if (this.params.textures) {
      const loader = this.FindEntity('loader').GetComponent('LoadController')

      for (const k in this.params.textures.names) {
        const t = loader.LoadTexture(
          this.params.textures.resourcePath, this.params.textures.names[k])
        t.encoding = THREE.sRGBEncoding

        if (this.params.textures.wrap) {
          t.wrapS = THREE.RepeatWrapping
          t.wrapT = THREE.RepeatWrapping
        }

        textures[k] = t
      }
    }

    this.target.traverse(c => {
      let materials = c.material
      if (!(c.material instanceof Array))
        materials = [c.material]

      if (c.geometry)
        c.geometry.computeBoundingBox()

      for (const m of materials)
        if (m) {
          if (this.params.onMaterial)
            this.params.onMaterial(m)

          for (const k in textures)
            if (m.name.search(k) >= 0)
              m.map = textures[k]

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

      this.Broadcast({
        topic: 'render.loaded',
        value: this.target,
      })
    })
  }

  _LoadGLB() {
    const loader = new GLTFLoader()
    loader.setPath(this.params.resourcePath)
    loader.load(this.params.resourceName, glb => {
      this._OnLoaded(glb.scene)
    })
  }

  _LoadFBX() {
    const loader = this.FindEntity('loader').GetComponent('LoadController')
    loader.LoadFBX(
      this.params.resourcePath, this.params.resourceName, fbx => {
        this._OnLoaded(fbx)
      })
  }

  _LoadOBJ() {
    const loader = new OBJLoader()
    loader.setPath(this.params.resourcePath)
    loader.load(this.params.resourceName, fbx => {
      this._OnLoaded(fbx)
    })
  }

  Update(timeInSeconds) {}
}