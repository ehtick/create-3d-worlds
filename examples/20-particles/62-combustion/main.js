// https://codepen.io/mwmwmw/pen/wNWoMV
import * as THREE from 'three'
import { material } from './shaders.js'
import { camera, scene, renderer, createOrbitControls } from '/utils/scene.js'

createOrbitControls()

const height = 8, radius = 0.2

function createFireballs({ num = 30 } = {}) {
  const fireballs = []
  for (let i = 0; i < num; i++) {
    const geometry = new THREE.SphereGeometry(1, 64, 64)
    const mat = material.clone()
    mat.uniforms.blendPattern.value = material.uniforms.blendPattern.value
    mat.uniforms.gradient.value = material.uniforms.gradient.value
    const sphere = new THREE.Mesh(geometry, mat)
    sphere.position.y = Math.random() * height
    sphere.position.x = (0.5 - Math.random()) * radius
    sphere.position.z = (0.5 - Math.random()) * radius
    sphere.rotateX(Math.random() * 1)
    sphere.rotateZ(Math.PI + (0.5 - Math.random()))
    sphere.rotateY(Math.random() * 3)
    sphere.dirX = ((0.5 - Math.random()) * 0.02)
    sphere.dirY = 0.02
    sphere.dirZ = ((0.5 - Math.random()) * 0.02)
    fireballs.push(sphere)
  }
  return fireballs
}

function update(fireballs) {
  fireballs.forEach(ball => {
    ball.position.y += ball.dirY + Math.sin(ball.position.y * 0.002)
    ball.position.x += Math.sin(ball.position.y * 0.5) * ball.dirX
    ball.position.z += Math.cos(ball.position.y * 0.25) * ball.dirZ
    if (ball.position.y > height) {
      ball.position.y = -0.01
      ball.position.x = (0.5 - Math.random()) * radius
      ball.position.z = (0.5 - Math.random()) * radius
    }
    const p = ball.position.y / height
    ball.rotateY((1.2 - p) * 0.01)
    ball.scale.set(0.4 + p, 0.4 + p, 0.4 + p)
    ball.material.uniforms.blend.value = p
  })
}

const fireballs = createFireballs()
scene.add(...fireballs)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  update(fireballs)
  renderer.render(scene, camera)
}()