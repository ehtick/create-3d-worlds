// http://js1k.com/2014-dragons/demo/1837
const { cos, sin, random, PI } = Math

const canvas = document.getElementsByTagName('canvas')[0]
canvas.width = innerWidth
canvas.height = innerHeight
const context = canvas.getContext('2d')

let pfloat = 0,
  wingPerpendicular

const cw = canvas.width,
  ch = canvas.height,
  dragons = []

// the shape of the dragon, converted from canvas SVG image
const shape = '! ((&(&*$($,&.)/-.0,4%3"7$;(@/EAA<?:<9;;88573729/7,6(8&;'.split('').map(char => char.charCodeAt(0) - 32)

const dragon = function(index) {
  // Размер доакона scale = 0.2
  let scale = 0.17 + index * index / 49,
    gx = random() * cw / scale,
    gy = ch / scale,
    lim = 300,
    speed = 3 + random() * 5,
    direction = PI, // random() * PI * 2
    direction1 = direction,
    spine = []

  return function() {
    // проверьте, летит ли дракон с экрана
    if (gx < -lim || gx > cw / scale + lim || gy < -lim || gy > ch / scale + lim) {
      // flip them around
      const dx = cw / scale / 2 - gx,
        dy = ch / scale / 2 - gy
      direction = direction1 = Math.atan(dx / dy) + (dy < 0 ? PI : 0)
    } else {
      direction1 += random() * .1 - .05
      direction -= (direction - direction1) * .1
    }

    gx += sin(direction) * speed
    gy += cos(direction) * speed

    // calculate canvas spine - canvas chain of points
    // the first point in the array follows canvas floating position: gx,gy
    // the rest of the chain of points following each other in turn

    for (let i = 0; i < 70; i++)
      if (i === 0)
        // first point in spine
        spine[i] = { x: gx, y: gy, px: 0, py: 0 }
      else {
        if (!pfloat) spine[i] = { x: gx, y: gy }
        const p = spine[i - 1],
          dx = spine[i].x - p.x,
          dy = spine[i].y - p.y,
          d = Math.sqrt(dx * dx + dy * dy),
          perpendicular = Math.atan(dy / dx) + PI / 2 + (dx < 0 ? PI : 0)
        // make each point chase the previous, but never get too close
        let mod = 0
        if (d > 4)
          mod = .5
        else if (d > 2)
          mod = (d - 2) / 4

        spine[i].x -= dx * mod
        spine[i].y -= dy * mod
        // perpendicular is used to map the coordinates on to the spine
        spine[i].px = cos(perpendicular)
        spine[i].py = sin(perpendicular)

        if (i === 20)  // average point in the middle of the wings so the wings remain symmetrical
          wingPerpendicular = perpendicular
      }

    // map the dragon to the spine
    // the x coordinates of each point of the dragon shape are honoured
    // the y coordinates of each point of the dragon are mapped to the spine
    context.moveTo(spine[0].x, spine[0].y)

    for (let i = 0; i < 154; i += 2) { // shape.length * 2 - it's symmetrical
      if (i < 77) { // shape.length
        // draw the one half from nose to tail
        var index = i // even index is x, odd (index + 1) is y of each coordinate
        var L = 1
      } else {
        // draw the other half from tail back to nose
        index = 152 - i
        L = -1
      }

      let x = shape[index]
      let spineNode = spine[shape[index + 1]] // get the equivalent spine position from the dragon shape

      if (index >= 56) {  // draw tail
        const wobbleIndex = 56 - index // table wobbles more towards the end
        const wobble = sin(wobbleIndex / 3 + pfloat * 0.1) * wobbleIndex * L
        x = 20 - index / 4 + wobble
        // override the node for the correct tail position
        spineNode = spine[index * 2 - 83]
      } else if (index > 13) {  // draw "flappy wings"
        // 4 is hinge point
        x = 4 + (x - 4) * (sin((-x / 2 + pfloat) / 25 * speed / 4) + 2) * 2 // feed x into sin to make wings "bend"
        // override the perpindicular lines for the wings
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

/* LOOP */

void function loop() {
  canvas.width = cw // clear screen
  for (let j = 0; j < 7; j++) {
    if (!dragons[j]) dragons[j] = dragon(j) // Количество драконов
    dragons[j]()
  }
  pfloat++
  requestAnimationFrame(loop)
}()