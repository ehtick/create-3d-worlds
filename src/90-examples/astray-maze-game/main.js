/* global THREE */
import { generateSquareMaze } from './maze.js'

const textureLoader = new THREE.TextureLoader()

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const brickTexture = textureLoader.load('textures/brick.png')

const mazeDimension = 11
const maze = generateSquareMaze(mazeDimension)
maze[mazeDimension - 1][mazeDimension - 2] = false

const scene = new THREE.Scene()

const light = new THREE.PointLight(0xffffff, 1)
light.position.set(1, 1, 1.3)
scene.add(light)

const aspect = window.innerWidth / window.innerHeight
const camera = new THREE.PerspectiveCamera(60, aspect, 1, 1000)
camera.position.set(1, 1, 5)
scene.add(camera)

const mazeMesh = createMazeMesh(maze)
scene.add(mazeMesh)

function createMazeMesh(matrix) {
  const parent = new THREE.Geometry()
  for (let i = 0; i < matrix.dimension; i++)
    for (let j = 0; j < matrix.dimension; j++)
      if (matrix[i][j]) {
        const geometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1)
        const mesh = new THREE.Mesh(geometry)
        mesh.position.set(i, j, 0.5)
        mesh.updateMatrix()
        parent.merge(mesh.geometry, mesh.matrix)
      }

  const material = new THREE.MeshPhongMaterial({ map: brickTexture })
  const mesh = new THREE.Mesh(parent, material)
  return mesh
}

void function render() {
  window.requestAnimationFrame(render)
  renderer.render(scene, camera)
}()