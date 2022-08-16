import * as THREE from 'three'
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js'
import { scene, camera, renderer } from '/utils/scene.js'

const { randInt, randFloat } = THREE.Math
const textureLoader = new THREE.TextureLoader()

camera.position.z = 750
scene.background = new THREE.Color(0x000040)

const material = new THREE.SpriteMaterial({
  map: textureLoader.load('/assets/particles/spark.png'),
  blending: THREE.AdditiveBlending
})

for (let i = 0; i < 1000; i++) {
  const particle = new THREE.Sprite(material)
  tweenParticle(particle, i * 10)
  scene.add(particle)
}

/* FUNCTIONS */

function tweenParticle(particle, delay = 0) {
  particle.scale.x = particle.scale.y = randFloat(16, 48)

  new TWEEN.Tween(particle.position)
    .delay(delay)
    .to({
      x: randInt(-2000, 2000),
      y: randInt(-500, 500),
      z: randInt(-2000, 2000)
    }, 10000)
    .start()
}

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  TWEEN.update()
  renderer.render(scene, camera)
}()
