export default class State {
  constructor(player, name) {
    this.player = player
    this.name = name
    this.action = player?.actions[name]
    this.prevState = ''
  }

  get actions() {
    return this.player.actions
  }

  enter(oldState) {}

  update(delta) {}

  exit() { }
}