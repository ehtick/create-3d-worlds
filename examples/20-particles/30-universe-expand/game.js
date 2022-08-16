import * as THREE from 'three'
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js'
import { scene, camera, renderer } from '/utils/scene.js'

const { randInt, randFloat } = THREE.Math

camera.position.z = 750
scene.background = new THREE.Color(0x000040)

const material = new THREE.SpriteMaterial({
  map: new THREE.CanvasTexture(generateTexture()),
  blending: THREE.AdditiveBlending
})

for (let i = 0; i < 1000; i++) {
  const particle = new THREE.Sprite(material)
  tweenParticle(particle, i * 10)
  scene.add(particle)
}

/* FUNCTIONS */

function generateTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 16
  const halfSize = canvas.width / 2

  const context = canvas.getContext('2d')
  const gradient = context.createRadialGradient(halfSize, halfSize, 0, halfSize, halfSize, halfSize)
  gradient.addColorStop(0, 'white')
  gradient.addColorStop(0.2, 'white')
  gradient.addColorStop(0.4, 'rgba(0,0,64,1)')
  gradient.addColorStop(1, 'rgba(0,0,0,1)')
  context.fillStyle = gradient
  context.fillRect(0, 0, canvas.width, canvas.height)

  return canvas
}

function tweenParticle(particle, delay = 0) {
  particle.position.set(0, 0, 0)
  particle.scale.x = particle.scale.y = randFloat(16, 48)

  new TWEEN.Tween(particle.position)
    .delay(delay)
    .to({
      x: randInt(-2000, 2000),
      y: randInt(-500, 500),
      z: randInt(-2000, 2000)
    }, 10000)
    .start()

  new TWEEN.Tween(particle.scale)
    .delay(delay)
    .to({
      x: 0.01,
      y: 0.01
    }, 10000)
    .start()

  new TWEEN.Tween(particle)
    .delay(delay)
    .to({}, 10000)
    .onComplete(() => tweenParticle(particle))
    .start()
}

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  TWEEN.update()
  renderer.render(scene, camera)
}()
