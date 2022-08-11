import * as THREE from 'three'
import { camera, scene, renderer, clock } from '/utils/scene.js'
import { material, uniforms } from '/utils/shaders/droplets.js'

const textureLoader = new THREE.TextureLoader()

camera.position.z = 7

const texture = await textureLoader.loadAsync('background.jpg')
uniforms.u_texture.value = texture
const aspectRatio = texture.image.height / texture.image.width
const planeHeight = 10
const planeWidth = planeHeight / aspectRatio

const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 1, 1)
const plane = new THREE.Mesh(geometry, material)
scene.add(plane)

void function loop() {
  requestAnimationFrame(loop)
  const time = clock.getElapsedTime()
  uniforms.u_time.value = time * 0.03
  renderer.render(scene, camera)
}()
