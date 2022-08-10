// https://codepen.io/mwmwmw/pen/wNWoMV
import * as THREE from 'three'
import { material } from './shaders.js'

export default class Combustion {
  constructor(density = 30, height = 8, r = 0.2, resolution = 64) {
    this.mesh = new THREE.Group()
    this.fireballs = []
    this.height = height
    this.radius = r

    for (let i = 0; i < density; i++) {
      const geometry = new THREE.SphereGeometry(1, resolution, resolution)
      const mat = material.clone()
      mat.uniforms.blendPattern.value = material.uniforms.blendPattern.value
      mat.uniforms.gradient.value = material.uniforms.gradient.value
      const sphere = new THREE.Mesh(geometry, mat)
      sphere.position.y = Math.random() * height
      sphere.position.x = (0.5 - Math.random()) * this.radius
      sphere.position.z = (0.5 - Math.random()) * this.radius
      sphere.rotateX(Math.random() * 1)
      sphere.rotateZ(Math.PI + (0.5 - Math.random()))
      sphere.rotateY(Math.random() * 3)
      sphere.dirX = ((0.5 - Math.random()) * 0.02)
      sphere.dirY = 0.02
      sphere.dirZ = ((0.5 - Math.random()) * 0.02)
      this.fireballs.push(sphere)
    }
    this.mesh.add(...this.fireballs)
  }

  update() {
    this.fireballs.forEach(ball => {
      ball.position.y += ball.dirY + Math.sin(ball.position.y * 0.002)
      ball.position.x += Math.sin(ball.position.y * 0.5) * ball.dirX
      ball.position.z += Math.cos(ball.position.y * 0.25) * ball.dirZ
      if (ball.position.y > this.height) {
        ball.position.y = -0.01
        ball.position.x = (0.5 - Math.random()) * this.radius
        ball.position.z = (0.5 - Math.random()) * this.radius
      }
      const p = ball.position.y / this.height
      ball.rotateY((1.2 - p) * 0.01)
      ball.scale.set(0.4 + p, 0.4 + p, 0.4 + p)
      ball.material.uniforms.blend.value = p
    })
  }
}
