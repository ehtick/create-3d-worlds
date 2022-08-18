import * as THREE from 'three'
import { BufferGeometryUtils } from '/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js'
import Grid from '../mazes/Grid.js'
import { scene, renderer, camera, createOrbitControls, hemLight } from '/utils/scene.js'
import RecursiveDivision from '../mazes/algorithms/RecursiveDivision.js'
import { centerObject } from '/utils/helpers.js'

const { Vector3 } = THREE

hemLight()
camera.position.set(0, 7, 10)
const controls = createOrbitControls()

const grid = new Grid(8)
RecursiveDivision.on(grid)

const turnTo = (geometry, p1, p2) => {
  const mesh = new THREE.Mesh(geometry)
  mesh.position.set(p1.x, 0, p1.z)
  mesh.lookAt(p2)
  mesh.updateMatrix()
  geometry.applyMatrix4(mesh.matrix)
}

function connect(p1, p2) {
  const h = p1.distanceTo(p2)
  const geometry = new THREE.CylinderGeometry(1, 1, h, 12)
  geometry.translate(0, -h / 2, 0)
  geometry.rotateX(-Math.PI / 2)

  turnTo(geometry, p1, p2)
  return geometry
}

function meshFromGrid(grid) {
  const cellSize = 10
  const geometries = []

  for (const row of grid.grid)
    for (const cell of row) {
      const x1 = cell.column * cellSize
      const y1 = cell.row * cellSize
      const x2 = (cell.column + 1) * cellSize
      const y2 = (cell.row + 1) * cellSize

      if (!cell.north) {
        const p1 = new Vector3(x1, 0, y1)
        const p2 = new Vector3(x2, 0, y1)
        geometries.push(connect(p1, p2))
      }
      if (!cell.west) {
        const p1 = new Vector3(x1, 0, y1)
        const p2 = new Vector3(x1, 0, y2)
        geometries.push(connect(p1, p2))
      }
      if ((cell.east && !cell.linked(cell.east)) || !cell.east) {
        const p1 = new Vector3(x2, 0, y1)
        const p2 = new Vector3(x2, 0, y2)
        geometries.push(connect(p1, p2))
      }
      if ((cell.south && !cell.linked(cell.south)) || !cell.south) {
        const p1 = new Vector3(x1, 0, y2)
        const p2 = new Vector3(x2, 0, y2)
        geometries.push(connect(p1, p2))
      }
    }

  const geometry = BufferGeometryUtils.mergeBufferGeometries(geometries)
  const material = new THREE.MeshLambertMaterial({ color: 'gray' })
  const mesh = new THREE.Mesh(geometry, material)
  centerObject(mesh)
  return mesh
}

const mesh = meshFromGrid(grid)
scene.add(mesh)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  controls.update()
  renderer.render(scene, camera)
}()
