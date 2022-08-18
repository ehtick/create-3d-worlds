import * as THREE from 'three'
import { BufferGeometryUtils } from '/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js'
import { scene, renderer, camera, createOrbitControls, hemLight } from '/utils/scene.js'
import PolarGrid from '../mazes/PolarGrid.js'
import RecursiveBacktracker from '../mazes/algorithms/RecursiveBacktracker.js'
import {centerObject} from '/utils/helpers.js'

const { Vector3 } = THREE

const grid = new PolarGrid(10)
RecursiveBacktracker.on(grid)

// grid.init_path()
grid.draw(20)

/* CIRCULAR MAZE */

const isLinked = (cellA, cellB) => {
  const link = Object.values(cellA.links).find(l => l.row === cellB.row && l.col === cellB.col)
  return !!link
}

const turnTo = (geometry, p1, p2) => {
  const mesh = new THREE.Mesh(geometry)
  mesh.position.set(p1.x, 0, p1.z)
  mesh.lookAt(p2)
  mesh.updateMatrix()
  geometry.applyMatrix4(mesh.matrix)
}

function createPipe(p1, p2) {
  const h = p1.distanceTo(p2)
  const geometry = new THREE.CylinderGeometry(1, 1, h, 12)
  geometry.translate(0, -h / 2, 0)
  geometry.rotateX(-Math.PI / 2)

  turnTo(geometry, p1, p2)
  return geometry
}

const createCircularMazeMesh = ({ grid, cellSize = 10, rows } = {}) => {
  const geometries = []
  const center = rows * cellSize

  for (const row of grid)
    for (const cell of row)
      if (cell.row) {

        const theta = 2 * Math.PI / grid[cell.row].length
        const inner_radius = cell.row * cellSize
        const outer_radius = (cell.row + 1) * cellSize
        const theta_ccw = cell.column * theta // counter-clockwise (left) wall
        const theta_cw = (cell.column + 1) * theta // clockwise (right) wall

        const innerCcwX = Math.round(center + (inner_radius * Math.cos(theta_ccw)))
        const innerCcwY = Math.round(center + (inner_radius * Math.sin(theta_ccw)))
        const outerCcwX = Math.round(center + (outer_radius * Math.cos(theta_ccw)))
        const outerCcwY = Math.round(center + (outer_radius * Math.sin(theta_ccw)))
        const innerCwX = Math.round(center + (inner_radius * Math.cos(theta_cw)))
        const innerCwY = Math.round(center + (inner_radius * Math.sin(theta_cw)))
        const outerCwX = Math.round(center + (outer_radius * Math.cos(theta_cw)))
        const outerCwY = Math.round(center + (outer_radius * Math.sin(theta_cw)))

        if (!cell.inward || !isLinked(cell, cell.inward)) {
          const p1 = new Vector3(innerCcwX, 0, innerCcwY)
          const p2 = new Vector3(innerCwX, 0, innerCwY)
          geometries.push(createPipe(p1, p2))
        }

        if (!cell.cw || !isLinked(cell, cell.cw)) {
          const p1 = new Vector3(innerCwX, 0, innerCwY)
          const p2 = new Vector3(outerCwX, 0, outerCwY)
          geometries.push(createPipe(p1, p2))
        }

        if (cell.row === grid.length - 1 && cell.col !== row.length * 0.75) {
          const p1 = new Vector3(outerCcwX, 0, outerCcwY)
          const p2 = new Vector3(outerCwX, 0, outerCwY)
          geometries.push(createPipe(p1, p2))
        }
      }
  const geometry = BufferGeometryUtils.mergeBufferGeometries(geometries)
  const material = new THREE.MeshLambertMaterial({ color: 'gray' })
  return new THREE.Mesh(geometry, material)
}

const mesh = createCircularMazeMesh({ grid: grid.grid, rows: grid.rows })
centerObject(mesh)
scene.add(mesh)

hemLight()

camera.position.set(0, 150, 10)
const controls = createOrbitControls()

/* LOOP */

void function gameLoop() {
  requestAnimationFrame(gameLoop)
  controls.update()
  renderer.render(scene, camera)
}()
