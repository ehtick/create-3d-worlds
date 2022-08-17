import * as THREE from 'three'
import { scene, renderer, camera, clock, createOrbitControls } from '/utils/scene.js'
import { material } from '/utils/shaders/thrust.js'

createOrbitControls()
camera.position.z = 20

class LinearSpline {
  constructor(lerp) {
    this.points = []
    this.lerp = lerp
  }

  addPoint(t, d) {
    this.points.push([t, d])
  }

  get(t) {
    let p1 = 0

    for (let i = 0; i < this.points.length; i++) {
      if (this.points[i][0] >= t)
        break
      p1 = i
    }

    const p2 = Math.min(this.points.length - 1, p1 + 1)

    if (p1 == p2) return this.points[p1][1]

    return this.lerp(
      (t - this.points[p1][0]) / (this.points[p2][0] - this.points[p1][0]),
      this.points[p1][1],
      this.points[p2][1]
    )
  }
}

let particles = []

const geometry = new THREE.BufferGeometry()
const points = new THREE.Points(geometry, material)
scene.add(points)

const sizeSpline = new LinearSpline((t, a, b) => a + t * (b - a))
sizeSpline.addPoint(0.0, 1.0)
sizeSpline.addPoint(0.5, 5.0)
sizeSpline.addPoint(1.0, 1.0)

let t

function addParticles(deltaTime) {
  if (!t) t = 0.0

  t += deltaTime
  const n = Math.floor(t * 75.0)
  t -= n / 75.0

  for (let i = 0; i < n; i++) {
    const life = (Math.random() * 0.75 + 0.25) * 5.0
    particles.push({
      position: new THREE.Vector3(
        (Math.random() * 2 - 1) * 1.0,
        (Math.random() * 2 - 1) * 1.0,
        (Math.random() * 2 - 1) * 1.0),
      size: (Math.random() * 0.5 + 0.5) * 4.0,
      colour: new THREE.Color(),
      alpha: 1.0,
      life,
      maxLife: life,
      rotation: Math.random() * 2.0 * Math.PI,
      velocity: new THREE.Vector3(0, -15, 0),
    })
  }
}

function updateGeometry() {
  const positions = []
  const sizes = []
  const colours = []

  for (const p of particles) {
    positions.push(p.position.x, p.position.y, p.position.z)
    colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha)
    sizes.push(p.currentSize)
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))
  geometry.setAttribute('colour', new THREE.Float32BufferAttribute(colours, 4))
}

function updateParticles(deltaTime) {
  for (const p of particles) p.life -= deltaTime
  particles = particles.filter(p => p.life > 0.0)

  for (const p of particles) {
    const t = 1.0 - p.life / p.maxLife

    p.rotation += deltaTime * 0.5
    p.currentSize = p.size * sizeSpline.get(t)
    p.position.add(p.velocity.clone().multiplyScalar(deltaTime))
  }
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()

  addParticles(delta)
  updateParticles(delta)
  updateGeometry()

  renderer.render(scene, camera)
}()
