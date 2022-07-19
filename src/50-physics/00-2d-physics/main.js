/* eslint-disable no-use-before-define */
// https://gamedevelopment.tutsplus.com/tutorials/when-worlds-collide-simulating-circle-circle-collisions--gamedev-769
// import { ctx, canvas } from '../core/io/canvas.js'
import Canvas from '/classes/2d/Canvas.js'

const canvas = new Canvas()
const { ctx } = canvas

let then = Date.now()

class Vector {
  constructor(x, y, z = 0) {
    this.x = x
    this.y = y
    this.z = z
  }

  add(vector) {
    this.x += vector.x
    this.y += vector.y
    this.z += vector.z
  }

  multiplyScalar(skalar) {
    this.x *= skalar
    this.y *= skalar
    this.z *= skalar
  }

  applyResistance(percent) {
    this.multiplyScalar(1 - percent)
  }
}

function multiplyScalar(vector, skalar) {
  return {
    x: vector.x * skalar,
    y: vector.y * skalar,
    z: vector.z * skalar
  }
}

class Circle {
  /*
  * param position: Vector
  */
  constructor(r, position) {
    this.r = r
    this.center = position
    this.depth = 10
  }

  get area() {
    return Math.PI * this.r * this.r
  }

  get volume() {
    return this.area * this.depth
  }

  render(x = this.center.x, y = this.center.y, r = this.r) {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.fill()
  }
}

/*
* Object podrazumevano ima shape Kruga
*/
class Object {
  constructor(height = 100, x = Math.random() * canvas.width, y = Math.random() * 100) {
    this.height = height
    this.halfHeight = height / 2
    this.position = new Vector(x, y)
    this.shape = new Circle(this.height / 2, this.position)
    this.density = 700
    this.volume = this.shape.volume
    this.force = new Vector(0, 0, 0)
    this.acceleration = new Vector(0, 0)
    this.velocity = new Vector(0, 0)
    this.staticFriction = 0.74
    this.kineticFriction = 0.57
    this.bounciness = 0.7
  }

  get mass() {
    return this.density * this.volume
  }

  get friction() {
    return this.velocity.x === 0 ? this.staticFriction : this.kineticFriction
  }
}

const objects = []
const ground = canvas.height
const wind = new Vector(1, 0)
const drag = 0.001

function add(...premeti) {
  objects.push(...premeti)
}

/* LOGIC */

const touchingGround = object => object.position.y + object.halfHeight >= ground

// http://davidlively.com/programming/simple-physics-fun-with-verlet-integration/
function integration(object, dt) {
  object.force.add(wind)
  object.force.add(gravity)
  object.force.applyResistance(touchingGround(object) ? object.friction : drag)

  object.acceleration = multiplyScalar(object.force, 1 / object.mass)
  object.velocity.add(multiplyScalar(object.acceleration, dt))
  object.position.add(multiplyScalar(object.velocity, dt))
}

function checkGround(object) {
  if (touchingGround(object)) collisionResponse(object)
}

function collisionResponse(object) {
  object.position.y = ground - object.halfHeight
  object.velocity.y *= -1
  object.velocity.y *= object.bounciness
}

/* INIT */

const gravity = new Vector(0, 98)

const krug1 = new Object(100)
const krug2 = new Object(80)
const krug3 = new Object(120)

add(krug1, krug2, krug3)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  const now = Date.now()
  const dt = now - then

  objects.map(object => {
    integration(object, dt)
    checkGround(object)
    object.shape.render()
  })

  then = now
}()