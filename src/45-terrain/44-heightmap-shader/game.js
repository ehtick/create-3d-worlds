import * as THREE from '/node_modules/three127/build/three.module.js'
import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { createWater } from '/utils/ground.js'
import { material } from '/utils/shaders/heightmap-terrain.js'
import { hemLight } from '/utils/light.js'

const loader = new THREE.TextureLoader()

hemLight()
createOrbitControls()
camera.position.y = 150

const water = createWater({ size: 1000, opacity: 0.60 })
scene.add(water)

const geometry = new THREE.PlaneGeometry(1000, 1000, 100, 100)
geometry.rotateX(-Math.PI / 2)
material.uniforms.bumpTexture = { type: 't', value: loader.load('/assets/heightmaps/stemkoski.png') }
const terrain = new THREE.Mesh(geometry, material)
terrain.position.y = -60
scene.add(terrain)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}()
