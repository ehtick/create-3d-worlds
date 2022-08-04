import * as THREE from '/node_modules/three127/build/three.module.js'
import { OrbitControls } from '/node_modules/three127/examples/jsm/controls/OrbitControls.js'
import { TeapotGeometry } from '/node_modules/three127/examples/jsm/geometries/TeapotGeometry.js'
import { scene, camera, renderer } from '/utils/scene.js'
import { material } from './shader.js'

new OrbitControls(camera, renderer.domElement)

const light = new THREE.DirectionalLight(0xFFFFFF, 1.0)
light.position.set(0.32, 0.39, .7)
scene.add(light)

material.side = THREE.DoubleSide

const teapot = new THREE.Mesh(new TeapotGeometry(), material)
teapot.scale.set(0.025, 0.025, 0.025)
scene.add(teapot)

material.uniforms.uDirLightPos.value = light.position
material.uniforms.uDirLightColor.value = light.color
material.uniforms.uMaterialColor.value.copy(new THREE.Color(.8, .4, .1))

material.uniforms.uKd.value = 0.75
material.uniforms.uBorder.value = 0.4

/* LOOP */

void function animate() {
  window.requestAnimationFrame(animate)
  renderer.render(scene, camera)
}()
