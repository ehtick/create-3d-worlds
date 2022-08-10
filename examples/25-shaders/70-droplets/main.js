import * as THREE from 'three'
import { camera, scene, renderer } from '/utils/scene.js'
import { material, texture } from '/utils/shaders/droplets.js'

camera.position.z = 7

const { image } = texture
const aspectRatio = image.height / image.width
const planeHeight = 10
const planeWidth = planeHeight / aspectRatio

const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 1, 1)
const plane = new THREE.Mesh(geometry, material)
scene.add(plane)

void function loop(time) {
  plane.material.uniforms.u_time.value = time / 1000
  renderer.render(scene, camera)
  requestAnimationFrame(loop)
}()
