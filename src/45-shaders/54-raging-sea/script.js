import * as THREE from '/node_modules/three127/build/three.module.js'
import { camera, scene, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { material } from '/utils/shaders/waves.js'

const controls = createOrbitControls()
camera.position.set(1, 1, 1)

const param = {
  fogNear: 1,
  fogFar: 3,
  fogColor: '#8e99a2'
}

scene.fog = new THREE.Fog(param.fogColor, param.fogNear, param.fogFar)
scene.background = new THREE.Color(param.fogColor)

const waterGeometry = new THREE.PlaneGeometry(12, 12, 512, 512)

const water = new THREE.Mesh(waterGeometry, material)
water.rotation.x = -Math.PI * 0.5
scene.add(water)

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  controls.update()
  material.uniforms.uTime.value = elapsedTime
  renderer.render(scene, camera)
  window.requestAnimationFrame(tick)
}

tick()