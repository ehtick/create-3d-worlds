import * as THREE from '/node_modules/three127/build/three.module.js'
// import { createBox } from '/utils/geometry.js'

const material = new THREE.LineBasicMaterial({ color: 0x0000ff })

const isLinked = (cellA, cellB) => {
  const link = cellA.links.find(l => l.row === cellB.row && l.col === cellB.col)
  return !!link
}

const createLine = (x1, z1, x2, z2) => {
  const points = []
  points.push(new THREE.Vector3(x1, 0, z1))
  points.push(new THREE.Vector3(x2, 0, z2))

  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const line = new THREE.Line(geometry, material)
  return line
}

export const renderCircularMaze = grid => {
  const group = new THREE.Group()
  for (const row of grid)
    for (const cell of row)
      if (cell.row) {
        if (!cell.inward || !isLinked(cell, cell.inward)) {
          const line = createLine(cell.innerCcwX, cell.innerCcwY, cell.innerCwX, cell.innerCwY)
          group.add(line)
        }

        if (!cell.cw || !isLinked(cell, cell.cw)) {
          const line = createLine(cell.innerCwX, cell.innerCwY, cell.outerCwX, cell.outerCwY)
          group.add(line)
        }

        if (cell.row === grid.length - 1 && cell.col !== row.length * 0.75) {
          const line = createLine(cell.outerCcwX, cell.outerCcwY, cell.outerCwX, cell.outerCwY)
          group.add(line)
        }
      }
  return group
}
