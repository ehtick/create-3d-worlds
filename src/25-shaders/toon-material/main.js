import * as THREE from '/node_modules/three/build/three.module.js'
import { OutlineEffect } from '/node_modules/three/examples/jsm/effects/OutlineEffect.js'
import { scene, camera, renderer } from '/utils/scene.js'

camera.position.set(0, 100, 100 * 3.5)

const geometry = new THREE.SphereGeometry(20, 32, 16)

for (let i = 0; i < 10; i++) {
  const material = new THREE.MeshToonMaterial({ color: Math.random() * 0xffffff })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.x = i * 100 - 400
  scene.add(mesh)
}

const lightContainer = new THREE.Mesh(
  new THREE.SphereGeometry(4, 8, 8),
  new THREE.MeshBasicMaterial({ color: 0xffff00 })
)
scene.add(lightContainer)

const pointLight = new THREE.PointLight(0xffffff, 2, 800)
lightContainer.add(pointLight)

const effect = new OutlineEffect(renderer)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const timer = Date.now() * 0.00025

  lightContainer.position.x = Math.sin(timer * 7) * 300
  lightContainer.position.y = Math.cos(timer * 5) * 400
  lightContainer.position.z = Math.cos(timer * 3) * 300

  effect.render(scene, camera) // renderer.render(scene, camera)
}()