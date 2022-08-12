import * as THREE from 'three'
import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { waveTerrain } from '/utils/ground.js'
import { SimplexNoise } from '/libs/SimplexNoise.js'

camera.position.set(0, 20, 20)
createOrbitControls()

const simplex = new SimplexNoise()

const geometry = new THREE.PlaneGeometry(100, 100, 100, 100)
const material = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true })
const mesh = new THREE.Mesh(geometry, material)
mesh.rotateX(-Math.PI / 2)

const { position } = geometry.attributes
const vertex = new THREE.Vector3()
for (let i = 0, l = position.count; i < l; i++) {
  vertex.fromBufferAttribute(position, i)
  const res = simplex.noise(vertex.x * .1, vertex.y * .1)
  vertex.z = res * 1.5
  position.setXYZ(i, vertex.x, vertex.y, vertex.z)
}

scene.add(mesh)

/* LOOP */

let time = 0

void function render() {
  requestAnimationFrame(render)

  waveTerrain(geometry, time)
  time += .01

  renderer.render(scene, camera)
}()