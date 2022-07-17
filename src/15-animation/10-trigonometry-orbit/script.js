const canvas = document.querySelector('#container')
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const halfWidth = canvas.width * .5,
  halfHeight = canvas.height * .5,
  orbitRadius = canvas.height * .4,
  planetRadius = orbitRadius * .1

let tick = 0

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  tick += 0.03
  const px = Math.cos(tick) * orbitRadius // add percent to ellipse
  const py = Math.sin(tick) * orbitRadius // add percent to ellipse
  // draw
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#d63'
  ctx.beginPath()
  ctx.arc(px + halfWidth, py + halfHeight, planetRadius - 1, 0, Math.PI * 2)
  ctx.fill()
}()