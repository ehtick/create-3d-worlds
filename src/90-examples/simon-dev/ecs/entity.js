import * as THREE from '/node_modules/three127/build/three.module.js'
import Component from './Component.js'

export class Entity {
  constructor() {
    this._name = null
    this._components = {}
    this._position = new THREE.Vector3()
    this._rotation = new THREE.Quaternion()
    this._handlers = {}
    this.parent_ = null
    this.dead_ = false
  }

  Destroy() {
    for (const k in this._components)
      this._components[k].Destroy()

    this._components = null
    this.parent_ = null
    this._handlers = null
  }

  _RegisterHandler(n, h) {
    if (!(n in this._handlers))
      this._handlers[n] = []

    this._handlers[n].push(h)
  }

  SetParent(p) {
    this.parent_ = p
  }

  SetName(n) {
    this._name = n
  }

  get Name() {
    return this._name
  }

  get Manager() {
    return this.parent_
  }

  get _parent() {
    return this.parent_
  }

  SetActive(b) {
    this.parent_.SetActive(this, b)
  }

  SetDead() {
    this.dead_ = true
  }

  AddComponent(c) {
    c.SetParent(this)
    this._components[c.constructor.name] = c

    c.InitComponent()
  }

  InitEntity() {
    for (const k in this._components)
      this._components[k].InitEntity()
  }

  GetComponent(n) {
    return this._components[n]
  }

  FindEntity(n) {
    return this.parent_.Get(n)
  }

  Broadcast(msg) {
    if (!(msg.topic in this._handlers))
      return

    for (const curHandler of this._handlers[msg.topic])
      curHandler(msg)
  }

  SetPosition(p) {
    this._position.copy(p)
    this.Broadcast({
      topic: 'update.position',
      value: this._position,
    })
  }

  SetQuaternion(r) {
    this._rotation.copy(r)
    this.Broadcast({
      topic: 'update.rotation',
      value: this._rotation,
    })
  }

  get Position() {
    return this._position
  }

  get Quaternion() {
    return this._rotation
  }

  Update(timeElapsed) {
    for (const k in this._components)
      this._components[k].Update(timeElapsed)
  }
};

export const entity = (() => ({
  Entity,
  Component,
}))()