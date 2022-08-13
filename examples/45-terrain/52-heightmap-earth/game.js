import * as THREE from 'three'
import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { material } from '/utils/shaders/heightmap-terrain.js'
import { hemLight } from '/utils/light.js'

const loader = new THREE.TextureLoader()

hemLight()
createOrbitControls()
camera.position.y = 150

const geometry = new THREE.PlaneGeometry(1000, 1000, 100, 100)
geometry.rotateX(-Math.PI / 2)

material.uniforms.heightmap = { type: 't', value: loader.load('/assets/heightmaps/earth.png') }
material.uniforms.displacementScale.value = 30.0

const terrain = new THREE.Mesh(geometry, material)
// terrain.position.y = -60
scene.add(terrain)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}()
