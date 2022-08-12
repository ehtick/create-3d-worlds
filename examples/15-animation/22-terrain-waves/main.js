import * as THREE from 'three'
import { scene, camera, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { randomInRange } from '/utils/helpers.js'
import { waveTerrain } from '/utils/ground.js'

camera.position.set(0, 20, 20)
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

scene.add(mesh)

/* LOOP */

void function render() {
  requestAnimationFrame(render)

  const time = clock.getElapsedTime()
  waveTerrain(geometry, time)

  renderer.render(scene, camera)
}()