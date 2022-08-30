import * as THREE from 'three'
import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'

const { randFloat, randFloatSpread } = THREE.MathUtils
const textureLoader = new THREE.TextureLoader()
const controls = createOrbitControls()

const radiusRange = 50

camera.position.set(0, 50, 150)
scene.background = new THREE.Color(0x000000)

const texture = textureLoader.load('/assets/particles/spark.png')

const particles = createParticles()
scene.add(particles)

/* FUNCTIONS */

function createParticles() {
  const particles = new THREE.Group()
  for (let i = 0; i < 200; i++) {
    const material = new THREE.SpriteMaterial({ map: texture, color: 0xffffff })
    const sprite = new THREE.Sprite(material)
    sprite.scale.set(32, 32, 1.0)
    sprite.position.set(randFloatSpread(10), randFloatSpread(10), randFloatSpread(10))
    sprite.position.setLength(radiusRange * randFloat(.9, 1))
    material.color.setHSL(Math.random(), 0.9, 0.7)
    material.blending = THREE.AdditiveBlending // glowing

    // assign custom properties
    sprite.initialPosition = sprite.position.clone()
    sprite.randomness = Math.random() + 1

    particles.add(sprite)
  }
  return particles
}

function updateParticles(time) {
  for (let i = 0; i < particles.children.length; i++) {
    const sprite = particles.children[i]
    // pulse away/towards center at individual rates
    const pulseFactor = Math.sin(sprite.randomness * time) * 0.1 + 0.9
    sprite.position.x = sprite.initialPosition.x * pulseFactor
    sprite.position.y = sprite.initialPosition.y * pulseFactor
    sprite.position.z = sprite.initialPosition.z * pulseFactor
  }
  particles.rotation.y = time * 0.75
}

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const time = 4 * clock.getElapsedTime()
  controls.update()
  updateParticles(time)
  renderer.render(scene, camera)
}()
