import { Component } from '../ecs/component.js'

export class HealthComponent extends Component {
  constructor(params) {
    super()
    this.stats_ = params
  }

  get _health() {
    return this.stats_.health
  }

  set _health(value) {
    this.stats_.health = value
  }

  get _maxHealth() {
    return this.stats_.maxHealth
  }

  InitComponent() {
    this.RegisterHandler('health.damage', m => this._OnDamage(m))
    this.RegisterHandler('health.add-experience', m => this._OnAddExperience(m))
    this._UpdateUI()
  }

  IsAlive() {
    return this._health > 0
  }

  _UpdateUI() {
    if (!this.stats_.updateUI) return

    const bar = document.getElementById('health-bar')

    const healthAsPercentage = this._health / this._maxHealth
    bar.style.width = Math.floor(200 * healthAsPercentage) + 'px'

    document.getElementById('stats-strength').innerText = this.stats_.strength
    document.getElementById('stats-wisdomness').innerText = this.stats_.wisdomness
    document.getElementById('stats-benchpress').innerText = this.stats_.benchpress
    document.getElementById('stats-curl').innerText = this.stats_.curl
    document.getElementById('stats-experience').innerText = this.stats_.experience
  }

  _ComputeLevelXPRequirement() {
    const { level } = this.stats_
    // Blah just something easy
    const xpRequired = Math.round(2 ** (level - 1) * 100)
    return xpRequired
  }

  _OnAddExperience(msg) {
    this.stats_.experience += msg.value
    const requiredExperience = this._ComputeLevelXPRequirement()
    if (this.stats_.experience < requiredExperience)
      return

    this.stats_.level += 1
    this.stats_.strength += 1
    this.stats_.wisdomness += 1
    this.stats_.benchpress += 1
    this.stats_.curl += 2

    const spawner = this.FindEntity('level-up-spawner').GetComponent('LevelUpComponentSpawner')
    spawner.Spawn(this.parent._position)

    this.Broadcast({
      topic: 'health.levelGained',
      value: this.stats_.level,
    })

    this._UpdateUI()
  }

  _OnDeath(attacker) {
    if (attacker)
      attacker.Broadcast({
        topic: 'health.add-experience',
        value: this.stats_.level * 100
      })

    this.Broadcast({
      topic: 'health.death',
    })
  }

  _OnDamage(msg) {
    this._health = Math.max(0.0, this._health - msg.value)
    if (this._health == 0)
      this._OnDeath(msg.attacker)

    this.Broadcast({
      topic: 'health.update',
      health: this._health,
      maxHealth: this._maxHealth,
    })

    this._UpdateUI()
  }
};
