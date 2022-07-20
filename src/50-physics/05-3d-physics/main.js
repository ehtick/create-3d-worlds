import * as THREE from '/node_modules/three127/build/three.module.js'
import { scene, camera, renderer } from '/utils/scene.js'
import { createSphere } from '/utils/geometry.js'
import Canvas from '/classes/2d/Canvas.js'

const canvas = new Canvas()
const { ctx } = canvas

const objects = []
const ground = canvas.height
const drag = 0.001

function createPhysicsBall({ r = .5, x = Math.random() * 10, y = Math.random() * 5 } = {}) {
  const sphere = createSphere({ r })
  sphere.position.set(x, y, 0)
  sphere.area = Math.PI * r * r
  sphere.volume = 4 / 3 * sphere.area * r
  return sphere
}

const sphere = createPhysicsBall()
scene.add(sphere)

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
  constructor(r, position) {
    this.r = r
    this.center = position
  }

  get area() {
    return Math.PI * this.r * this.r
  }

  get volume() {
    return 4 / 3 * this.area * this.r
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
    this.halfHeight = height / 2
    this.position = new THREE.Vector2(x, y)
    this.shape = new Circle(height / 2, this.position)
    this.density = 70
    this.volume = this.shape.volume
    this.force = new Vector(0, 0, 0)
    this.acceleration = new THREE.Vector2(0, 0)
    this.velocity = new THREE.Vector2(0, 0)
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

const wind = new THREE.Vector2(1, 0)

function add(...premeti) {
  objects.push(...premeti)
}

const gravity = new THREE.Vector2(0, 98)

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
  renderer.render(scene, camera)
}()