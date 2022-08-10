import chroma from '/libs/chroma.js'
import * as THREE from 'three'
import { renderer, scene, camera } from '/utils/scene.js'
import { material } from './shader.js'

const { randFloat: rnd, randFloatSpread: rndFS } = THREE.Math

const numPoints = 50000
const mouse = new THREE.Vector2(0.2, 0.2)
const startTime = Date.now()

camera.position.z = 400
scene.background = new THREE.Color(0x00001a)

const cscale = chroma.scale([0x00b9e0, 0xff880a, 0x5f1b90, 0x7ec08d])
const positions = new Float32Array(numPoints * 3)
const colors = new Float32Array(numPoints * 3)
const sizes = new Float32Array(numPoints)
const rotations = new Float32Array(numPoints)
const sCoef = new Float32Array(numPoints)
const position = new THREE.Vector3()

for (let i = 0; i < numPoints; i++) {
  position.set(rndFS(1000), rndFS(1000), rndFS(2000))
  position.toArray(positions, i * 3)
  const color = new THREE.Color(cscale(rnd(0, 1)).hex())
  color.toArray(colors, i * 3)
  sizes[i] = rnd(5, 100)
  sCoef[i] = rnd(0.0005, 0.005)
  rotations[i] = rnd(0, Math.PI)
}

const geometry = new THREE.BufferGeometry()
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
geometry.setAttribute('rotation', new THREE.BufferAttribute(rotations, 1))
geometry.setAttribute('sCoef', new THREE.BufferAttribute(sCoef, 1))

const points = new THREE.Points(geometry, material)
scene.add(points)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)

  points.material.uniforms.uTime.value = Date.now() - startTime
  points.material.uniforms.uMouse.value = mouse

  renderer.render(scene, camera)
}()

renderer.domElement.addEventListener('mousemove', e => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
})