import * as THREE from '/node_modules/three127/build/three.module.js'
import { TeapotGeometry } from '/node_modules/three127/examples/jsm/geometries/TeapotGeometry.js'
import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { material } from '/utils/shaders/cartoon.js'

createOrbitControls()

const light = new THREE.DirectionalLight(0xFFFFFF, 1.0)
light.position.set(0.32, 0.39, .7)
scene.add(light)

const teapot = new THREE.Mesh(new TeapotGeometry(), material)
teapot.scale.set(0.025, 0.025, 0.025)
scene.add(teapot)

material.uniforms.uDirLightColor.value = light.color
material.uniforms.uDirLightPos.value = light.position
material.uniforms.uMaterialColor.value = new THREE.Color(.8, .4, .1)

/* LOOP */

void function animate() {
  window.requestAnimationFrame(animate)
  renderer.render(scene, camera)
}()
