import * as THREE from 'three'
import { scene, camera, renderer } from '/utils/scene.js'
import { createSphere } from '/utils/geometry.js'
import { initLights } from '/utils/light.js'

initLights()
scene.background = new THREE.Color(0x000000)

camera.position.set(0, 0, 5)

const saturn = createSaturn()
scene.add(saturn)

function createRing(radius, tube, color) {
  const geometry = new THREE.TorusGeometry(radius, tube, 2, 35)
  const material = new THREE.MeshBasicMaterial({ color })
  const ring = new THREE.Mesh(geometry, material)
  ring.rotation.x = Math.PI * .5
  return ring
}

function createSaturn() {
  const group = new THREE.Group()
  group.add(createSphere({ color: 0xDDBC77 }))
  group.add(createRing(1.4, .2, 0x665E4E))
  group.add(createRing(1.9, .2, 0x7C776B))
  group.add(createRing(2.4, .2, 0x645F52))
  return group
}

/* LOOP */

let add = 0.01

void function loop() {
  requestAnimationFrame(loop)

  saturn.position.y += add
  if (saturn.position.y >= 1 || saturn.position.y <= -1)
    add *= -1

  renderer.render(scene, camera)
}()