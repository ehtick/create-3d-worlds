import * as THREE from '/node_modules/three127/build/three.module.js'
import { scene, camera, renderer } from '/utils/scene.js'
import { vertexShader, fragmentShader } from './shader.js'

const parameters = {
  speed: .2,
  hue: .5,
  hueVariation: 1,
  gradient: .3,
  density: .5,
  displacement: .66
}

let time = 0

const material = new THREE.RawShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: { type: 'f', value: 0 },
    uHue: { type: 'f', value: .5 },
    uHueVariation: { type: 'f', value: 1 },
    uGradient: { type: 'f', value: 1 },
    uDensity: { type: 'f', value: 1 },
    uDisplacement: { type: 'f', value: 1 },
  }
})

const planeGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)

const plane = new THREE.Mesh(planeGeometry, material)
scene.add(plane)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  time += parameters.speed
  plane.material.uniforms.uTime.value = time

  renderer.render(scene, camera)
}()
