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

    this.entities.forEach(e => {
      e.Update(timeElapsed)
      if (e.dead)
        dead.push(e)
      else
        alive.push(e)
    })

    dead.forEach(e => {
      delete this.entitiesMap[e.Name]
      e.Destroy()
    })

    this.entities = alive
  }
}
