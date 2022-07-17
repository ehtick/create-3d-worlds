// https://codepen.io/_helmut/pen/wvGYYEx
const canvas = document.querySelector('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const ctx = canvas.getContext('2d')

const length = 100
const frequency = 8
const maxAmplitude = 100
const bgOpacity = 0.03
const y = canvas.height / 2

let increment = Math.random() * 360
let amplitude = 0

function draw() {
  ctx.beginPath()

  ctx.fillStyle = `rgba(0,0,0,${bgOpacity})`
  ctx.strokeStyle = `hsl(${increment * 20}, 80%, 70%)`
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.moveTo(0, canvas.height / 2)

  for (let i = 0; i < canvas.width; i += 1)
    ctx.lineTo(i, y + Math.sin(i / length + increment) * amplitude)

  ctx.stroke()
  ctx.closePath()

  amplitude = Math.sin(increment) * maxAmplitude
  increment -= frequency / 1000
}

function animate() {
  requestAnimationFrame(animate)
  draw()
}

animate()