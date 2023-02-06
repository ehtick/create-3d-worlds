import * as THREE from 'three'
import { camera, scene, renderer } from '/utils/scene.js'
import { createCrate } from '/utils/geometry.js'

const light = new THREE.AmbientLight(0xffffff)
scene.add(light)

const cube = createCrate()
scene.add(cube)

void function render() {
  requestAnimationFrame(render)
  cube.rotation.y += 0.01
  renderer.render(scene, camera)
}()
