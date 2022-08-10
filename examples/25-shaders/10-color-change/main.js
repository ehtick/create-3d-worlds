import * as THREE from '/node_modules/three/build/three.module.js'
import { scene, renderer, camera, clock, createOrbitControls } from '/utils/scene.js'

createOrbitControls()

const vertexShader = /* glsl*/`
  varying vec3 v_Normal;

  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    v_Normal = normal;
  }
`

const fragmentShader = /* glsl*/`
  uniform vec3 sphereColor;
  varying vec3 v_Normal;

  void main() {
    gl_FragColor = vec4(sphereColor, 1.0);
  }
`

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  new THREE.ShaderMaterial({
    uniforms: {
      sphereColor: {
        value: new THREE.Vector3(0, 0, 1)
      }
    },
    vertexShader,
    fragmentShader,
  })
)

scene.add(sphere)

/* LOOP */

void function update() {
  requestAnimationFrame(update)
  const time = clock.getElapsedTime()

  const v = Math.sin(time * 2) * 0.5 + 0.5
  const c1 = new THREE.Vector3(1, 0, 0)
  const c2 = new THREE.Vector3(0, 1, 0)
  const sphereColor = c1.lerp(c2, v)
  sphere.material.uniforms.sphereColor.value = sphereColor

  renderer.render(scene, camera)
}()
