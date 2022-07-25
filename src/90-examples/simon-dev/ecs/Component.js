export default class Component {
  constructor() {
    this.parent_ = null
  }

  // compatibility with old code
  get _parent() {
    return this.parent_
  }

  Destroy() { }

  SetParent(p) {
    this.parent_ = p
  }

  InitComponent() { }

  InitEntity() { }

  GetComponent(n) {
    return this.parent_.GetComponent(n)
  }

  get Manager() {
    return this.parent_.Manager
  }

  get Parent() {
    return this.parent_
  }

  FindEntity(n) {
    return this.parent_.FindEntity(n)
  }

  Broadcast(m) {
    this.parent_.Broadcast(m)
  }

  Update(_) { }

  _RegisterHandler(n, h) {
    this.parent_._RegisterHandler(n, h)
  }
};
