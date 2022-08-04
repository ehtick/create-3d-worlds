import * as THREE from '/node_modules/three127/build/three.module.js'
import { TeapotGeometry } from '/node_modules/three127/examples/jsm/geometries/TeapotGeometry.js'
import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { material } from './shader.js'

createOrbitControls()

const light = new THREE.DirectionalLight(0xFFFFFF, 1.0)
light.position.set(3, 3, -7)
scene.add(light)

const teapot = new THREE.Mesh(new TeapotGeometry(2), material)
scene.add(teapot)

material.uniforms.uLightDir.value = light.position

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}()
