// http://js1k.com/2014-dragons/demo/1837
const { cos, sin, random, PI } = Math

const canvas = document.getElementById('c')
canvas.width = innerWidth
canvas.height = innerHeight
const context = canvas.getContext('2d')

let elapsed = 0,
  wingPerpendicular

const cw = canvas.width,
  ch = canvas.height,
  dragons = []

const shape = '! ((&(&*$($,&.)/-.0,4%3"7$;(@/EAA<?:<9;;88573729/7,6(8&;'.split('')
  .map(char => char.charCodeAt(0) - 32)

const dragon = index => {
  const scale = 0.17 + index * index / 49
  const spine = []
  const lim = 300
  const speed = 3 + random() * 5
  let gx = random() * cw / scale
  let gy = ch / scale
  let direction = PI // random() * PI * 2
  let direction1 = direction

  const outOfBounds = () => gx < -lim || gx > cw / scale + lim || gy < -lim || gy > ch / scale + lim

  return function update() {
    if (outOfBounds()) {
      const dx = cw / scale / 2 - gx
      const dy = ch / scale / 2 - gy
      direction = direction1 = Math.atan(dx / dy) + (dy < 0 ? PI : 0)
    } else {
      direction1 += random() * .1 - .05
      direction -= (direction - direction1) * .1
    }

    gx += sin(direction) * speed
    gy += cos(direction) * speed

    for (let i = 0; i < 70; i++)
      if (i === 0)
        spine[i] = { x: gx, y: gy, px: 0, py: 0 }
      else {
        if (!elapsed) spine[i] = { x: gx, y: gy }
        const p = spine[i - 1],
          dx = spine[i].x - p.x,
          dy = spine[i].y - p.y,
          d = Math.sqrt(dx * dx + dy * dy),
          perpendicular = Math.atan(dy / dx) + PI / 2 + (dx < 0 ? PI : 0)
        let mod = 0
        if (d > 4)
          mod = .5
        else if (d > 2)
          mod = (d - 2) / 4

        spine[i].x -= dx * mod
        spine[i].y -= dy * mod
        spine[i].px = cos(perpendicular)
        spine[i].py = sin(perpendicular)

        if (i === 20)
          wingPerpendicular = perpendicular
      }

    context.moveTo(spine[0].x, spine[0].y)

    for (let i = 0; i < 154; i += 2) {
      let index, L
      if (i < 77) {
        index = i
        L = 1
      } else {
        index = 152 - i
        L = -1
      }

      let x = shape[index]
      let spineNode = spine[shape[index + 1]]

      if (index >= 56) {
        const wobbleIndex = 56 - index
        const wobble = sin(wobbleIndex / 3 + elapsed * 0.1) * wobbleIndex * L
        x = 20 - index / 4 + wobble
        spineNode = spine[index * 2 - 83]
      } else if (index > 13) {
        x = 4 + (x - 4) * (sin((-x / 2 + elapsed) / 25 * speed / 4) + 2) * 2
        spineNode.px = cos(wingPerpendicular)
        spineNode.py = sin(wingPerpendicular)
      }
      context.lineTo(
        (spineNode.x + x * L * spineNode.px) * scale,
        (spineNode.y + x * L * spineNode.py) * scale
      )
    }
    context.fill()
  }
}

for (let i = 0; i < 7; i++)
  dragons[i] = dragon(i)

/* LOOP */

void function loop() {
  canvas.width = cw // clear screen
  dragons.map(dragon => dragon())
  elapsed++
  requestAnimationFrame(loop)
}()