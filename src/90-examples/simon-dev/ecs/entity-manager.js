export class EntityManager {
  constructor() {
    this.id = 0
    this.entitiesMap = {}
    this.entities = []
  }

  _GenerateName() {
    this.id += 1
    return '__name__' + this.id
  }

  Get(n) {
    return this.entitiesMap[n]
  }

  Filter(cb) {
    return this.entities.filter(cb)
  }

  Add(e, name = this._GenerateName()) {
    this.entitiesMap[name] = e
    this.entities.push(e)
    e.SetParent(this)
    e.SetName(name)
    e.InitEntity()
  }

  SetActive(e, b) {
    const i = this.entities.indexOf(e)
    if (!b) {
      if (i < 0) return
      this.entities.splice(i, 1)
    } else {
      if (i >= 0) return
      this.entities.push(e)
    }
  }

  Update(timeElapsed) {
    const dead = []
    const alive = []
    for (let i = 0; i < this.entities.length; ++i) {
      const e = this.entities[i]
      e.Update(timeElapsed)
      if (e.dead)
        dead.push(e)
      else
        alive.push(e)
    }

    for (let i = 0; i < dead.length; ++i) {
      const e = dead[i]
      delete this.entitiesMap[e.Name]
      e.Destroy()
    }

    this.entities = alive
  }
}
