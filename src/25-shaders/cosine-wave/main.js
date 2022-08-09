import * as THREE from '/node_modules/three/build/three.module.js'
import { renderer, scene, camera, clock } from '/utils/scene.js'
import { getCursorPosition } from '/classes/Joystick.js'
import { material, uniforms } from './shader.js'

scene.background = new THREE.Color(0x000000)
camera.position.z = 30

const geometry = new THREE.TorusKnotGeometry(6.5, 2.3, 256, 32)
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  uniforms.u_time.value = clock.getElapsedTime()
  uniforms.u_frame.value += 1.0
  renderer.render(scene, camera)
}()

/* EVENTS */

function onCursorMove(e) {
  const { x, y } = getCursorPosition(e)
  uniforms.u_mouse.value.set(x, window.innerHeight - y).multiplyScalar(window.devicePixelRatio)
}

renderer.domElement.addEventListener('mousemove', onCursorMove, false)
renderer.domElement.addEventListener('touchstart', onCursorMove, false)
renderer.domElement.addEventListener('touchmove', onCursorMove, false)
