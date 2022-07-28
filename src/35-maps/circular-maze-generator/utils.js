const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const pixelRatio = window.devicePixelRatio || 1
const lineWidth = 4

const isLinked = (cellA, cellB) => {
  const link = cellA.links.find(l => l.row === cellB.row && l.col === cellB.col)
  return !!link
}

export const renderMaze = (grid, width) => {
  ctx.clearRect(0, 0, width * pixelRatio, width * pixelRatio)

  ctx.strokeStyle = '#000'
  ctx.lineWidth = lineWidth

  for (const row of grid)
    for (const cell of row)
      if (cell.row) {
        if (!cell.inward || !isLinked(cell, cell.inward)) {
          ctx.beginPath()
          ctx.moveTo(cell.innerCcwX, cell.innerCcwY)
          ctx.lineTo(cell.innerCwX, cell.innerCwY)
          ctx.stroke()
        }

        if (!cell.cw || !isLinked(cell, cell.cw)) {
          ctx.beginPath()
          ctx.moveTo(cell.innerCwX, cell.innerCwY)
          ctx.lineTo(cell.outerCwX, cell.outerCwY)
          ctx.stroke()
        }

        if (cell.row === grid.length - 1 && cell.col !== row.length * 0.75) {
          ctx.beginPath()
          ctx.moveTo(cell.outerCcwX, cell.outerCcwY)
          ctx.lineTo(cell.outerCwX, cell.outerCwY)
          ctx.stroke()
        }
      }

}
