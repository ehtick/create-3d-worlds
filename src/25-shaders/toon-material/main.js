import * as THREE from '/node_modules/three127/build/three.module.js'
import { OrbitControls } from '/node_modules/three127/examples/jsm/controls/OrbitControls.js'
import { OutlineEffect } from '/node_modules/three127/examples/jsm/effects/OutlineEffect.js'
import { scene, camera, renderer } from '/utils/scene.js'

camera.position.set(0, 200, 200 * 3.5)

const cubeWidth = 400
const numberOfSphersPerSide = 5
const sphereRadius = (cubeWidth / numberOfSphersPerSide) * 0.8 * 0.5
const stepSize = 1.0 / numberOfSphersPerSide

const geometry = new THREE.SphereGeometry(sphereRadius, 32, 16)

for (let alpha = 0, alphaIndex = 0; alpha <= 1.0; alpha += stepSize, alphaIndex++) {
  const colors = new Uint8Array(alphaIndex + 2)
  for (let c = 0; c <= colors.length; c++)
    colors[c] = (c / colors.length) * 256

  for (let beta = 0; beta <= 1.0; beta += stepSize)
    for (let gamma = 0; gamma <= 1.0; gamma += stepSize) {
      // basic monochromatic energy preservation
      const diffuseColor = new THREE.Color().setHSL(alpha, 0.5, gamma * 0.5 + 0.1).multiplyScalar(1 - beta * 0.2)

      const material = new THREE.MeshToonMaterial({
        color: diffuseColor,
      })

      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.x = alpha * 400 - 200
      mesh.position.y = beta * 400 - 200
      mesh.position.z = gamma * 400 - 200
      scene.add(mesh)
    }
}

const lightContainer = new THREE.Mesh(
  new THREE.SphereGeometry(4, 8, 8),
  new THREE.MeshBasicMaterial({ color: 0xffff00 })
)
scene.add(lightContainer)

scene.add(new THREE.AmbientLight(0x888888))

const pointLight = new THREE.PointLight(0xffffff, 2, 800)
lightContainer.add(pointLight)

const effect = new OutlineEffect(renderer)

const controls = new OrbitControls(camera, renderer.domElement)
controls.minDistance = 200
controls.maxDistance = 2000

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const timer = Date.now() * 0.00025

  lightContainer.position.x = Math.sin(timer * 7) * 300
  lightContainer.position.y = Math.cos(timer * 5) * 400
  lightContainer.position.z = Math.cos(timer * 3) * 300

  effect.render(scene, camera)
}()