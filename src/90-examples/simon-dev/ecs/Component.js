export class Component {
  constructor() {
    this.parent = null
  }

  Destroy() { }

  SetParent(p) {
    this.parent = p
  }

  InitComponent() { }

  InitEntity() { }

  GetComponent(n) {
    return this.parent.GetComponent(n)
  }

  get Manager() {
    return this.parent.Manager
  }

  get Parent() {
    return this.parent
  }

  FindEntity(n) {
    return this.parent.FindEntity(n)
  }

  Broadcast(m) {
    this.parent.Broadcast(m)
  }

  Update(_) { }

  _RegisterHandler(n, h) {
    this.parent._RegisterHandler(n, h)
  }
}