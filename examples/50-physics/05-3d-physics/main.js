import * as THREE from '/node_modules/three/build/three.module.js'
import { scene, camera, renderer, clock } from '/utils/scene.js'
import { createSphere } from '/utils/geometry.js'
import Canvas from '/utils/classes/2d/Canvas.js'

const canvas = new Canvas()
const { ctx } = canvas

const objects = []
const ground = canvas.height
const drag = 0.001
const wind = new THREE.Vector2(1, 0)
const gravity = new THREE.Vector2(0, 98)

function createPhysicsBall({ r = .5, x = Math.random() * 10, y = Math.random() * 5 } = {}) {
  const sphere = createSphere({ r })
  sphere.position.set(x, y, 0)
  sphere.area = Math.PI * r * r
  sphere.volume = 4 / 3 * sphere.area * r
  return sphere
}

const sphere = createPhysicsBall()
scene.add(sphere)

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
  constructor(r = 50, x = Math.random() * canvas.width, y = Math.random() * 100) {
    this.r = r
    this.position = new THREE.Vector2(x, y)
    this.shape = new Circle(r, this.position)
    this.density = 70
    this.volume = this.shape.volume
    this.force = new THREE.Vector3(0, 0, 0)
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

const touchingGround = object => object.position.y + object.r >= ground

const applyResistance = (force, percent) => {
  force.multiplyScalar(1 - percent)
}

// http://davidlively.com/programming/simple-physics-fun-with-verlet-integration/
function integration(object, dt) {
  object.force.add(wind)
  object.force.add(gravity)
  applyResistance(object.force, touchingGround(object) ? object.friction : drag)

  object.acceleration = multiplyScalar(object.force, 1 / object.mass)
  object.velocity.add(multiplyScalar(object.acceleration, dt))
  object.position.add(multiplyScalar(object.velocity, dt))
}

function checkGround(object) {
  if (touchingGround(object)) collisionResponse(object)
}

function collisionResponse(object) {
  object.position.y = ground - object.r
  object.velocity.y *= -1
  object.velocity.y *= object.bounciness
}

/* INIT */

function add(...premeti) {
  objects.push(...premeti)
}

const krug1 = new Object(50)
const krug2 = new Object(40)
const krug3 = new Object(60)

add(krug1, krug2, krug3)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  const delta = clock.getDelta() * 1000

  objects.map(object => {
    integration(object, delta)
    checkGround(object)
    object.shape.render()
  })

  renderer.render(scene, camera)
}()