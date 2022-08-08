import * as THREE from 'three'
import { renderer, scene, camera, clock } from '/utils/scene.js'
import { material } from './shader.js'

const { uniforms } = material

scene.background = new THREE.Color(0x000000)
camera.position.z = 30

const geometry = new THREE.TorusKnotGeometry(6.5, 2.3, 256, 32)
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  uniforms.u_time.value = clock.getElapsedTime()
  uniforms.u_frame.value += 1.0
  renderer.render(scene, camera)
}()

/* EVENTS */

function onMouseMove(event) {
  uniforms.u_mouse.value.set(event.pageX, window.innerHeight - event.pageY)
    .multiplyScalar(window.devicePixelRatio)
}

function onTouchMove(event) {
  uniforms.u_mouse.value.set(event.touches[0].pageX, window.innerHeight - event.touches[0].pageY)
    .multiplyScalar(window.devicePixelRatio)
}

renderer.domElement.addEventListener('mousemove', onMouseMove, false)
renderer.domElement.addEventListener('touchstart', onTouchMove, false)
renderer.domElement.addEventListener('touchmove', onTouchMove, false)
