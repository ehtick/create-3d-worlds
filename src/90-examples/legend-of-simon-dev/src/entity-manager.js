export default class EntityManager {
  constructor() {
    this._ids = 0
    this._entitiesMap = {}
    this._entities = []
  }

  _GenerateName() {
    this._ids += 1
    return '__name__' + this._ids
  }

  Get(n) {
    return this._entitiesMap[n]
  }

  Filter(cb) {
    return this._entities.filter(cb)
  }

  Add(e, name) {
    if (!name) name = this._GenerateName()

    this._entitiesMap[name] = e
    this._entities.push(e)

    e.SetParent(this)
    e.SetName(name)
  }

  SetActive(e) {
    const i = this._entities.indexOf(e)
    if (i < 0) return

    this._entities.splice(i, 1)
  }

  Update(timeElapsed) {
    for (const e of this._entities)
      e.Update(timeElapsed)
  }
}
