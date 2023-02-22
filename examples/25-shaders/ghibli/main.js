import * as THREE from 'three'
import { TeapotGeometry } from '/node_modules/three/examples/jsm/geometries/TeapotGeometry.js'
import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { material } from '/utils/shaders/ghibli.js'

createOrbitControls()

let time = 0

const light = new THREE.PointLight(0xffffff)
const lightContainer = new THREE.Mesh(
  new THREE.SphereGeometry(3, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xffff00 })
)
scene.add(lightContainer)
lightContainer.add(light)

const teapot = new THREE.Mesh(new TeapotGeometry(2), material)
scene.add(teapot)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  lightContainer.position.set(40 * Math.cos(time), 75, 40 * Math.sin(time))
  teapot.material.uniforms.lightPosition.value = lightContainer.position
  time += 0.01

  renderer.render(scene, camera)
}()
