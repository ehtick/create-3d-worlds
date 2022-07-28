import * as THREE from '/node_modules/three127/build/three.module.js'
import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { initLights } from '/utils/light.js'

initLights()
createOrbitControls()
scene.add(new THREE.AxesHelper(50))

function createBlock(point1, point2) {
  const h = point1.distanceTo(point2)
  const geometry = new THREE.BoxGeometry(1, 1, h)
  geometry.translate(0, 0, h / 2)
  const material = new THREE.MeshLambertMaterial({ color: 'gray' })
  material.transparent = true
  const gun = new THREE.Mesh(geometry, material)
  gun.position.copy(point1)
  gun.lookAt(point2)
  return gun
}

const point1 = new THREE.Vector3(-1, 0, 0)
const point2 = new THREE.Vector3(2, 0, -6)

const gun = createBlock(point1, point2)
scene.add(gun)

/* LOOP */

void function render() {
  window.requestAnimationFrame(render)
  renderer.render(scene, camera)
}()