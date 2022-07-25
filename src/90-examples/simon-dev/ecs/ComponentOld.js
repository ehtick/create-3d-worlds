export default class Component {
  constructor() {
    this._parent = null
  }

  SetParent(p) {
    this._parent = p
  }

  InitComponent() { }

  GetComponent(n) {
    return this._parent.GetComponent(n)
  }

  FindEntity(n) {
    return this._parent.FindEntity(n)
  }

  Broadcast(m) {
    this._parent.Broadcast(m)
  }

  Update(_) { }

  _RegisterHandler(n, h) {
    this._parent._RegisterHandler(n, h)
  }
};
