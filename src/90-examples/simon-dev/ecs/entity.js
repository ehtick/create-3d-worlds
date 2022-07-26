import * as THREE from '/node_modules/three127/build/three.module.js'

export class Entity {
  constructor() {
    this.name = null
    this.components = {}
    this.position = new THREE.Vector3()
    this._rotation = new THREE.Quaternion()
    this.handlers = {}
    this.parent = null
    this.dead = false
  }

  Destroy() {
    for (const k in this.components)
      this.components[k].Destroy()

    this.components = null
    this.parent = null
    this.handlers = null
  }

  RegisterHandler(n, h) {
    if (!(n in this.handlers))
      this.handlers[n] = []

    this.handlers[n].push(h)
  }

  SetParent(p) {
    this.parent = p
  }

  SetName(n) {
    this.name = n
  }

  get Name() {
    return this.name
  }

  get Manager() {
    return this.parent
  }

  SetActive(b) {
    this.parent.SetActive(this, b)
  }

  SetDead() {
    this.dead = true
  }

  AddComponent(c) {
    c.SetParent(this)
    this.components[c.constructor.name] = c

    c.InitComponent()
  }

  InitEntity() {
    for (const k in this.components)
      this.components[k].InitEntity()
  }

  GetComponent(n) {
    return this.components[n]
  }

  FindEntity(n) {
    return this.parent.Get(n)
  }

  Broadcast(msg) {
    if (!(msg.topic in this.handlers))
      return

    for (const handler of this.handlers[msg.topic])
      handler(msg)
  }

  SetPosition(p) {
    this.position.copy(p)
    this.Broadcast({
      topic: 'update.position',
      value: this.position,
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
    return this.position
  }

  get Quaternion() {
    return this._rotation
  }

  Update(timeElapsed) {
    for (const k in this.components)
      this.components[k].Update(timeElapsed)
  }
}