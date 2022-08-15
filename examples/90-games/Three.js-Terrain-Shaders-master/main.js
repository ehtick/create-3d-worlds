/* global THREE */
import { material } from './terrain-colors.js'

const scene = new THREE.Scene()
const simplex = new SimplexNoise(Math.random())

const camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 1, 3500)
camera.position.z = 64

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
directionalLight.position.set(10, 100, 10)
scene.add(directionalLight)

const geometry = new THREE.BufferGeometry()
const indices = []
const vertices = []
const normals = []
const colors = []
const size = 40
const segments = 500
const halfSize = size / 2
const segmentSize = size / segments
const magnitudeY = 6
const magY = magnitudeY / 2

for (let i = 0; i <= segments; i++) {
  const y = (i * segmentSize) - halfSize
  for (let j = 0; j <= segments; j++) {
    const x = (j * segmentSize) - halfSize
    const zVal = (simplex.noise2D(x / 10, y / 10) + 1) * magY
    vertices.push(x, zVal, y)
    normals.push(0, 1, 0)
    colors.push(Math.random(), Math.random(), Math.random())
  }
}

for (let i = 0; i < segments; i++)
  for (let j = 0; j < segments; j++) {
    const a = i * (segments + 1) + (j + 1)
    const b = i * (segments + 1) + j
    const c = (i + 1) * (segments + 1) + j
    const d = (i + 1) * (segments + 1) + (j + 1)
    indices.push(a, b, d) // face one
    indices.push(b, c, d) // face two
  }

geometry.setIndex(indices)
geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
geometry.addAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

geometry.computeVertexNormals()

const mesh = new THREE.Mesh(geometry, material)
mesh.position.y -= 10

scene.add(mesh)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)

document.body.appendChild(renderer.domElement)

void function animate() {
  requestAnimationFrame(animate)
  const time = Date.now() * 0.001
  mesh.rotation.y = time * 0.5
  renderer.render(scene, camera)
}()
