import * as THREE from 'three'
import { TeapotGeometry } from '/node_modules/three/examples/jsm/geometries/TeapotGeometry.js'
import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { material, uniforms } from './shader.js'

let time = 0

camera.position.z = 150
camera.lookAt(new THREE.Vector3(0, 0, 0))

createOrbitControls()

const pointLight = new THREE.PointLight(0xffffff)
const lightContainer = new THREE.Mesh(
  new THREE.SphereGeometry(3, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xffff00 })
)
scene.add(lightContainer)
lightContainer.add(pointLight)

const geometry = new TeapotGeometry()
const teapot = new THREE.Mesh(geometry, material)
teapot.scale.set(.21, .21, .21)
teapot.position.set(50, 0, 0)
const teapot2 = teapot.clone()
teapot2.position.set(-50, 0, 50)

scene.add(teapot, teapot2)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)

  lightContainer.position.set(40 * Math.cos(time), 75, 40 * Math.sin(time))
  uniforms.uLightPos.value = lightContainer.position
  time += 0.01

  renderer.render(scene, camera)
}()