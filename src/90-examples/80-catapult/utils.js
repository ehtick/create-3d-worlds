/* GUI */

export function victory() {
  document.getElementById('game').innerHTML = 'Victory'
  document.getElementById('game').style.color = '#0AB408'
  document.getElementById('game').style.display = 'block'
}

export function gameOver() {
  document.getElementById('game').innerHTML = 'Game over'
  document.getElementById('game').style.color = 'red'
  document.getElementById('game').style.display = 'block'
}
