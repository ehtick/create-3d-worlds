import * as THREE from 'three'
import { TeapotGeometry } from '/node_modules/three/examples/jsm/geometries/TeapotGeometry.js'
import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { material, uniforms } from '/utils/shaders/cartoon.js'

createOrbitControls()

const light = new THREE.DirectionalLight(0xFFFFFF, 1.0)
light.position.set(0.32, 0.39, .7)
scene.add(light)

const teapot = new THREE.Mesh(new TeapotGeometry(2), material)
scene.add(teapot)

uniforms.uDirLightColor.value = light.color
uniforms.uLightPos.value = light.position
uniforms.uMaterialColor.value = new THREE.Color('crimson')

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}()
