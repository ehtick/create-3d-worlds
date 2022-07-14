// https://threejs.org/examples/webgl_shader2.html
import * as THREE from '/node_modules/three127/build/three.module.js'
import { camera, scene, renderer, clock } from '/utils/scene.js'
import { vertexShader, fragmentShaderMarble, fragmentShaderLed } from './shader.js'

camera.position.set(0, 0, 2)

const uniformsLed = {
  time: { value: 1.0 }
}

const uniformsMarble = {
  time: { value: 1.0 },
  colorTexture: { value: new THREE.TextureLoader().load('/assets/textures/marble.jpg') }
}

uniformsMarble.colorTexture.value.wrapS = uniformsMarble.colorTexture.value.wrapT = THREE.RepeatWrapping

const geometry = new THREE.BoxGeometry(0.75, 0.75, 0.75)

const createBox = (fragmentShader, uniforms) => {
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader
  })
  const mesh = new THREE.Mesh(geometry, material)
  return mesh
}

const marbleBox = createBox(fragmentShaderMarble, uniformsMarble)
marbleBox.position.set(-1, 0, 0)
scene.add(marbleBox)

const ledBox = createBox(fragmentShaderLed, uniformsLed)
ledBox.position.set(1, 0, 0)
scene.add(ledBox)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()

  uniformsLed.time.value += delta * 5
  uniformsMarble.time.value = clock.elapsedTime

  marbleBox.rotation.y += delta * -0.5
  ledBox.rotation.y += delta * 0.5

  renderer.render(scene, camera)
}()