import * as THREE from 'three'
import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { randomInRange } from '/utils/helpers.js'

const { sin } = Math

createOrbitControls()

const geometry = new THREE.PlaneGeometry(100, 100, 100, 100)
const material = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true })
const mesh = new THREE.Mesh(geometry, material)
mesh.rotateX(-Math.PI / 2)

const { position } = geometry.attributes
const vertex = new THREE.Vector3()
for (let i = 0, l = position.count; i < l; i++) {
  vertex.fromBufferAttribute(position, i)
  vertex.z += randomInRange(-1, 1)
  position.setXYZ(i, vertex.x, vertex.y, vertex.z)
}

const oldPosition = position.clone()

const frequency = 1
const amplitude = 1

function wave(geometry, time) {
  const { position } = geometry.attributes
  const vertex = new THREE.Vector3()
  const oldVertex = new THREE.Vector3()

  for (let i = 0, l = position.count; i < l; i++) {
    vertex.fromBufferAttribute(position, i)
    oldVertex.fromBufferAttribute(oldPosition, i)
    const { x, y } = vertex
    let change = 0

    // change X
    change += amplitude * sin(x * 2.1 * frequency + time)
    change += 3 * amplitude * sin(x * 0.1 * frequency + time)

    // change Y
    change += amplitude * sin(y * frequency + time)
    change += 2.8 * amplitude * sin(y * frequency * 0.2 + time)

    change *= amplitude * 0.6
    vertex.z = change + oldVertex.z // preserve initial terrain
    position.setXYZ(i, vertex.x, vertex.y, vertex.z)
  }
  position.needsUpdate = true
}

scene.add(mesh)

/* LOOP */

void function render() {
  requestAnimationFrame(render)

  const elapsed = clock.getElapsedTime()
  wave(geometry, elapsed)

  renderer.render(scene, camera)
}()