import * as THREE from 'three'
import { renderer, scene, camera, clock } from '/utils/scene.js'
import { getCursorPosition } from '/utils/helpers.js'
import { material, uniforms } from './shader.js'

scene.background = new THREE.Color(0x000000)
camera.position.z = 20

const geometry = new THREE.TorusKnotGeometry(5, 2, 64, 32)
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  uniforms.u_time.value = clock.getElapsedTime()
  renderer.render(scene, camera)
}()

/* EVENTS */

function onCursorMove(e) {
  const { x, y } = getCursorPosition(e)
  uniforms.u_mouse.value = new THREE.Vector2(x, window.innerHeight - y).multiplyScalar(window.devicePixelRatio)
}

renderer.domElement.addEventListener('mousemove', onCursorMove, false)
renderer.domElement.addEventListener('touchstart', onCursorMove, false)
renderer.domElement.addEventListener('touchmove', onCursorMove, false)
