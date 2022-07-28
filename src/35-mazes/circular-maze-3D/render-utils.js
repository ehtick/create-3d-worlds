import * as THREE from '/node_modules/three127/build/three.module.js'
import { randomInRange } from '/utils/helpers.js'

// https://stackoverflow.com/questions/11638883/thickness-of-lines-using-three-linebasicmaterial
// https://threejs.org/examples/#webgl_lines_fat

const isLinked = (cellA, cellB) => {
  const link = cellA.links.find(l => l.row === cellB.row && l.col === cellB.col)
  return !!link
}

// TODO: merge geometry
function createPipe(point1, point2) {
  const h = point1.distanceTo(point2)
  const geometry = new THREE.CylinderGeometry(1, 1, h, 12)
  geometry.translate(0, -h / 2, 0)
  geometry.rotateX(-Math.PI / 2)
  const material = new THREE.MeshLambertMaterial({ color: 'gray' })
  material.transparent = true
  const gun = new THREE.Mesh(geometry, material)
  gun.position.copy(point1)
  gun.lookAt(point2)
  return gun
}

function createBlock(point1, point2) {
  const width = randomInRange(2, 4)
  const height = randomInRange(2, 8)
  const depth = point1.distanceTo(point2)
  const geometry = new THREE.BoxGeometry(width, height, depth)
  geometry.translate(0, height / 2, depth / 2)
  const material = new THREE.MeshLambertMaterial({ color: 'gray' })
  material.transparent = true
  const gun = new THREE.Mesh(geometry, material)
  gun.position.copy(point1)
  gun.lookAt(point2)
  return gun
}

export const renderCircularMaze = (grid, connect = createBlock) => {
  const group = new THREE.Group()
  for (const row of grid)
    for (const cell of row)
      if (cell.row) {
        if (!cell.inward || !isLinked(cell, cell.inward)) {
          const point1 = new THREE.Vector3(cell.innerCcwX, 0, cell.innerCcwY)
          const point2 = new THREE.Vector3(cell.innerCwX, 0, cell.innerCwY)
          const line = connect(point1, point2)
          group.add(line)
        }

        if (!cell.cw || !isLinked(cell, cell.cw)) {
          const point1 = new THREE.Vector3(cell.innerCwX, 0, cell.innerCwY)
          const point2 = new THREE.Vector3(cell.outerCwX, 0, cell.outerCwY)
          const line = connect(point1, point2)
          group.add(line)
        }

        if (cell.row === grid.length - 1 && cell.col !== row.length * 0.75) {
          const point1 = new THREE.Vector3(cell.outerCcwX, 0, cell.outerCcwY)
          const point2 = new THREE.Vector3(cell.outerCwX, 0, cell.outerCwY)
          const line = connect(point1, point2)
          group.add(line)
        }
      }
  return group
}
