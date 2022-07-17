const canvas = document.querySelector('.stage'),
  ctx = canvas.getContext('2d'),
  trials_sine = document.querySelector('.sine'),
  trials_cosine = document.querySelector('.cosine'),
  speed = 0.03,
  ellipse = 1.3,
  height = 300,
  width = height * ellipse,
  ox = width * .5,
  oy = height * .5,
  radius = height * .25,
  smallRadius = radius * .1,
  CIRCLE = Math.PI * 2

let px,
  py,
  tick = 0

canvas.width = trials_sine.width = trials_cosine.width = width
canvas.height = trials_sine.height = trials_cosine.height = height
canvas.style.width = trials_sine.style.width = trials_cosine.style.width = width + 'px'

function update() {
  tick += speed
  px = Math.cos(tick) * radius * ellipse
  py = Math.sin(tick) * radius
}

function draw() {
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#d63'
  ctx.beginPath()
  ctx.arc(px + ox, py + oy, smallRadius - 1, 0, CIRCLE, false)
  ctx.fill()
}

void function animate() {
  update()
  draw()
  requestAnimationFrame(animate)
}()