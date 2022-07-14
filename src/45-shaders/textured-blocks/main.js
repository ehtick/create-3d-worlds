// https://threejs.org/examples/webgl_shader2.html
import * as THREE from '/node_modules/three127/build/three.module.js'
import { camera, scene, renderer, clock } from '/utils/scene.js'

camera.position.set(0, 0, 2)

const geometry = new THREE.BoxGeometry(0.75, 0.75, 0.75)

const uniforms1 = {
  'time': { value: 1.0 }
}

const uniforms2 = {
  'time': { value: 1.0 },
  'colorTexture': { value: new THREE.TextureLoader().load('/assets/textures/marble.jpg') }
}

uniforms2.colorTexture.value.wrapS = uniforms2.colorTexture.value.wrapT = THREE.RepeatWrapping

const params = [
  ['fragment_shader2', uniforms2],
  ['fragment_shader3', uniforms1],
]

for (let i = 0; i < params.length; i ++) {
  const material = new THREE.ShaderMaterial({
    uniforms: params[i][1],
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById(params[i][0]).textContent
  })

  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.x = i - (params.length - 1) / 2
  mesh.position.y = i % 2 - 0.5
  scene.add(mesh)
}

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()

  uniforms1.time.value += delta * 5
  uniforms2.time.value = clock.elapsedTime

  for (let i = 0; i < scene.children.length; i ++) {
    const object = scene.children[i]
    object.rotation.y += delta * 0.5 * (i % 2 ? 1 : - 1)
    object.rotation.x += delta * 0.5 * (i % 2 ? - 1 : 1)
  }
  renderer.render(scene, camera)
}()