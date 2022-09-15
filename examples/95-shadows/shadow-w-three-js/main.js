import * as THREE from 'three'
import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { createGround } from '/utils/ground.js'
import { createBox } from '/utils/geometry.js'

const lightRadius = 8

camera.position.y = 15
createOrbitControls()

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5)
scene.add(ambientLight)

function createShadowLight() {
  const dirLight = new THREE.DirectionalLight(0xFFFFFF, 1)
  dirLight.target.position.set(0, 0, 0)
  dirLight.castShadow = true

  // poboljšava rezoluciju senke?
  dirLight.shadow.mapSize.width = 2000
  dirLight.shadow.mapSize.height = 2000

  scene.add(dirLight)
  return dirLight
}

const dirLight = createShadowLight()

const radius = 5

for (let degree = 0; degree <= 2 * Math.PI; degree += Math.PI / 6) {
  const cube = createBox({ height: 3, color: 'white', castShadow: true, receiveShadow: true })
  cube.position.set(Math.cos(degree) * radius, 0, Math.sin(degree) * radius)
  cube.rotation.y = -degree
  scene.add(cube)
}

const plane = createGround({ size: 20 })
scene.add(plane)

/* LOOP */

let lightAngle = 0

void function loop() {
  lightAngle += .003
  const x = Math.cos(lightAngle) * lightRadius
  const z = Math.sin(lightAngle) * lightRadius
  dirLight.position.set(x, 3, z)

  renderer.render(scene, camera)
  requestAnimationFrame(loop)
}()