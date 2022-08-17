import * as THREE from 'three'
import { scene, renderer, camera, clock, createOrbitControls } from '/utils/scene.js'
import { material } from '/utils/shaders/thrust.js'

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

material.uniforms.diffuseTexture.value = new THREE.TextureLoader().load('/assets/particles/fire.png')

let particles = []

const geometry = new THREE.BufferGeometry()
geometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3))
geometry.setAttribute('size', new THREE.Float32BufferAttribute([], 1))
geometry.setAttribute('colour', new THREE.Float32BufferAttribute([], 4))
geometry.setAttribute('angle', new THREE.Float32BufferAttribute([], 1))

const points = new THREE.Points(geometry, material)

scene.add(points)

const alphaSpline = new LinearSpline((t, a, b) => a + t * (b - a))
alphaSpline.addPoint(0.0, 0.0)
alphaSpline.addPoint(0.1, 1.0)
alphaSpline.addPoint(0.6, 1.0)
alphaSpline.addPoint(1.0, 0.0)

const colorSpline = new LinearSpline((t, a, b) => a.clone().lerp(b, t))
colorSpline.addPoint(0.0, new THREE.Color(0xFFFF80))
colorSpline.addPoint(1.0, new THREE.Color(0xFF8080))

const sizeSpline = new LinearSpline((t, a, b) => a + t * (b - a))
sizeSpline.addPoint(0.0, 1.0)
sizeSpline.addPoint(0.5, 5.0)
sizeSpline.addPoint(1.0, 1.0)

let gdfsghk

function addParticles(deltaTime) {
  if (!gdfsghk) gdfsghk = 0.0

  gdfsghk += deltaTime
  const n = Math.floor(gdfsghk * 75.0)
  gdfsghk -= n / 75.0

  for (let i = 0; i < n; i++) {
    const life = (Math.random() * 0.75 + 0.25) * 10.0
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
  const angles = []

  for (const p of particles) {
    positions.push(p.position.x, p.position.y, p.position.z)
    colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha)
    sizes.push(p.currentSize)
    angles.push(p.rotation)
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))
  geometry.setAttribute('colour', new THREE.Float32BufferAttribute(colours, 4))
  geometry.setAttribute('angle', new THREE.Float32BufferAttribute(angles, 1))

  geometry.attributes.position.needsUpdate = true
  geometry.attributes.size.needsUpdate = true
  geometry.attributes.colour.needsUpdate = true
  geometry.attributes.angle.needsUpdate = true
}

function updateParticles(deltaTime) {
  for (const p of particles)
    p.life -= deltaTime

  particles = particles.filter(p => p.life > 0.0)

  for (const p of particles) {
    const t = 1.0 - p.life / p.maxLife

    p.rotation += deltaTime * 0.5
    p.alpha = alphaSpline.get(t)
    p.currentSize = p.size * sizeSpline.get(t)
    p.colour.copy(colorSpline.get(t))

    p.position.add(p.velocity.clone().multiplyScalar(deltaTime))

    const drag = p.velocity.clone()
    drag.multiplyScalar(deltaTime * 0.1)
    drag.x = Math.sign(p.velocity.x) * Math.min(Math.abs(drag.x), Math.abs(p.velocity.x))
    drag.y = Math.sign(p.velocity.y) * Math.min(Math.abs(drag.y), Math.abs(p.velocity.y))
    drag.z = Math.sign(p.velocity.z) * Math.min(Math.abs(drag.z), Math.abs(p.velocity.z))
    p.velocity.sub(drag)
  }

  particles.sort((a, b) => {
    const d1 = camera.position.distanceTo(a.position)
    const d2 = camera.position.distanceTo(b.position)

    if (d1 > d2) return -1
    if (d1 < d2) return 1
    return 0
  })
}

function update(deltaTime) {
  addParticles(deltaTime)
  updateParticles(deltaTime)
  updateGeometry()
}

createOrbitControls()
camera.position.z = 20

const light = new THREE.AmbientLight(0x666666)
scene.add(light)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const delta = clock.getDelta()
  update(delta)
  renderer.render(scene, camera)
}()
