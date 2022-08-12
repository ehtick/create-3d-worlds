import * as THREE from 'three'
import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'

createOrbitControls()

const geometry = new THREE.PlaneGeometry(100, 100, 100, 100)
const material = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true })
const mesh = new THREE.Mesh(geometry, material)
mesh.rotateX(-Math.PI / 2)

const frequency = .75
const amplitude = 1.5

function wave(geometry, time) {
  const { position } = geometry.attributes
  const vertex = new THREE.Vector3()

  for (let i = 0, l = position.count; i < l; i++) {
    vertex.fromBufferAttribute(position, i)
    vertex.z = amplitude * Math.sin((vertex.x + time) * frequency)
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