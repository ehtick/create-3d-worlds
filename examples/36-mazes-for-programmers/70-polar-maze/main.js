import * as THREE from 'three'
import { BufferGeometryUtils } from '/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js'
import { centerObject } from '/utils/helpers.js'
import PolarGrid from '../mazes/PolarGrid.js'
import RecursiveBacktracker from '../mazes/algorithms/RecursiveBacktracker.js'
import { scene, renderer, camera, createOrbitControls, hemLight } from '/utils/scene.js'

const { Vector3 } = THREE

hemLight()
camera.position.set(0, 7, 10)
const controls = createOrbitControls()

const grid = new PolarGrid(10)
RecursiveBacktracker.on(grid)

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

function meshFromPolarGrid(grid, cellSize = 10) {
  const geometries = []
  const img_size = 2 * grid.rows * cellSize
  const center = img_size / 2

  for (const row of grid.grid)
    for (const cell of row) {
      if (cell.row == 0) continue // center cell is empty

      const cell_count = grid.grid[cell.row].length
      const theta = 2 * Math.PI / cell_count
      const inner_radius = cell.row * cellSize
      const outer_radius = (cell.row + 1) * cellSize
      const theta_ccw = cell.column * theta // counter-clockwise wall
      const theta_cw = (cell.column + 1) * theta // clockwise wall

      const ax = Math.round(center + (inner_radius * Math.cos(theta_ccw)))
      const ay = Math.round(center + (inner_radius * Math.sin(theta_ccw)))
      const bx = Math.round(center + (outer_radius * Math.cos(theta_ccw)))
      const by = Math.round(center + (outer_radius * Math.sin(theta_ccw)))
      const cx = Math.round(center + (inner_radius * Math.cos(theta_cw)))
      const cy = Math.round(center + (inner_radius * Math.sin(theta_cw)))
      const dx = Math.round(center + (outer_radius * Math.cos(theta_cw)))
      const dy = Math.round(center + (outer_radius * Math.sin(theta_cw)))

      if (!cell.linked(cell.inward)) {
        const p1 = new Vector3(ax, 0, ay)
        const p2 = new Vector3(cx, 0, cy)
        geometries.push(connect(p1, p2))
      }
      if (!cell.linked(cell.cw)) {
        const p1 = new Vector3(cx, 0, cy)
        const p2 = new Vector3(dx, 0, dy)
        geometries.push(connect(p1, p2))
      }

      // last ring with entrance
      if (cell.row === grid.size - 1 && cell.column !== row.length * 0.75) {
        const p1 = new Vector3(bx, 0, by)
        const p2 = new Vector3(dx, 0, dy)
        geometries.push(connect(p1, p2))
      }
    }

  const geometry = BufferGeometryUtils.mergeBufferGeometries(geometries)
  const material = new THREE.MeshLambertMaterial({ color: 'gray' })
  const mesh = new THREE.Mesh(geometry, material)
  centerObject(mesh)
  return mesh
}

const mesh = meshFromPolarGrid(grid)
scene.add(mesh)

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  controls.update()
  renderer.render(scene, camera)
}()
