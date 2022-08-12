import * as THREE from 'three'
import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { randomInRange } from '/utils/helpers.js'

createOrbitControls()

const factor = 1
const geometry = new THREE.PlaneGeometry(100, 100, 100, 100)
const material = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true })
const mesh = new THREE.Mesh(geometry, material)
mesh.rotateX(-Math.PI / 2)

const { position } = geometry.attributes
const vertex = new THREE.Vector3()
for (let i = 0, l = position.count; i < l; i++) {
  vertex.fromBufferAttribute(position, i)
  vertex.z += randomInRange(-factor, factor)
  position.setXYZ(i, vertex.x, vertex.y, vertex.z)
}

const oldPosition = position.clone()

const frequency = .75
const amplitude = 1.5

function wave(geometry, time) {
  const { position } = geometry.attributes
  const vertex = new THREE.Vector3()
  const oldVertex = new THREE.Vector3()

  for (let i = 0, l = position.count; i < l; i++) {
    vertex.fromBufferAttribute(position, i)
    oldVertex.fromBufferAttribute(oldPosition, i)
    vertex.z = amplitude * Math.sin((vertex.x + time) * frequency)
    vertex.z += oldVertex.z // preserve initial z
    position.setXYZ(i, vertex.x, vertex.y, vertex.z)
  }
  position.needsUpdate = true
}

scene.add(mesh)

/* LOOP */

void function render() {
  requestAnimationFrame(render)

  const delta = clock.getDelta()
  const elapsed = clock.getElapsedTime()
  wave(geometry, elapsed)

  renderer.render(scene, camera)
}()