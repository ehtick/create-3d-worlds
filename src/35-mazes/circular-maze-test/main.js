import * as THREE from '/node_modules/three127/build/three.module.js'
import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { initLights } from '/utils/light.js'

initLights()
createOrbitControls()
scene.add(new THREE.AxesHelper(50))

function createGun(point1, point2) {
  const h = point1.distanceTo(point2)
  const geometry = new THREE.CylinderGeometry(1, 1, h, 12)
  geometry.translate(0, -h / 2, 0)
  geometry.rotateX(-Math.PI / 2)
  const material = new THREE.MeshLambertMaterial({ color: 'gray' })
  material.transparent = true
  const gun = new THREE.Mesh(geometry, material)
  gun.position.copy(point1)
  gun.lookAt(point2)
  return gun
}

const point1 = new THREE.Vector3(-1, 0, 3)
const point2 = new THREE.Vector3(2, 0, -6)

const gun = createGun(point1, point2)
scene.add(gun)

/* LOOP */

void function render() {
  window.requestAnimationFrame(render)
  renderer.render(scene, camera)
}()