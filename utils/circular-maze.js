// credits to https://codepen.io/gnykka/pen/zYrbYmJ
export const createMaze = ({ size, cellSize, center = 0 }) => {
  const rows = Math.floor(size / 2 / cellSize)

  const positionCells = grid => {
    grid.forEach(row => {
      row.forEach(cell => {
        const theta = 2 * Math.PI / row.length
        const inner_radius = cell.row * cellSize
        const outer_radius = (cell.row + 1) * cellSize
        const theta_ccw = cell.col * theta
        const theta_cw = (cell.col + 1) * theta

        cell.innerCcwX = Math.round(center + (inner_radius * Math.cos(theta_ccw)))
        cell.innerCcwY = Math.round(center + (inner_radius * Math.sin(theta_ccw)))
        cell.outerCcwX = Math.round(center + (outer_radius * Math.cos(theta_ccw)))
        cell.outerCcwY = Math.round(center + (outer_radius * Math.sin(theta_ccw)))
        cell.innerCwX = Math.round(center + (inner_radius * Math.cos(theta_cw)))
        cell.innerCwY = Math.round(center + (inner_radius * Math.sin(theta_cw)))
        cell.outerCwX = Math.round(center + (outer_radius * Math.cos(theta_cw)))
        cell.outerCwY = Math.round(center + (outer_radius * Math.sin(theta_cw)))

        const centerAngle = (theta_ccw + theta_cw) / 2

        cell.centerX = (Math.round(center + (inner_radius * Math.cos(centerAngle))) +
        Math.round(center + (outer_radius * Math.cos(centerAngle)))) / 2
        cell.centerY = (Math.round(center + (inner_radius * Math.sin(centerAngle))) +
        Math.round(center + (outer_radius * Math.sin(centerAngle)))) / 2
      })
    })
  }

  const createGrid = () => {
    const rowHeight = 1 / rows
    const grid = []
    grid.push([{ row: 0, col: 0, links: [], outward: [] }])

    for (let i = 1; i < rows; i++) {
      const radius = i / rows
      const circumference = 2 * Math.PI * radius
      const prevCount = grid[i - 1].length
      const cellWidth = circumference / prevCount
      const ratio = Math.round(cellWidth / rowHeight)
      const count = prevCount * ratio

      const row = []

      for (let j = 0; j < count; j++)
        row.push({
          row: i,
          col: j,
          links: [],
          outward: [],
        })

      grid.push(row)
    }

    grid.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell.row > 0) {
          cell.cw = { row: i, col: (j === row.length - 1 ? 0 : j + 1) }
          cell.ccw = { row: i, col: (j === 0 ? row.length - 1 : j - 1) }

          const ratio = grid[i].length / grid[i - 1].length
          const parent = grid[i - 1][Math.floor(j / ratio)]

          cell.inward = { row: parent.row, col: parent.col }
          parent.outward.push({ row: cell.row, col: cell.col })
        }
      })
    })
    positionCells(grid)
    return grid
  }

  const getNeighbors = (grid, cell) => {
    const list = []
    if (cell.cw) list.push(grid[cell.cw.row][cell.cw.col])
    if (cell.ccw) list.push(grid[cell.ccw.row][cell.ccw.col])
    if (cell.inward) list.push(grid[cell.inward.row][cell.inward.col])

    cell.outward.forEach(out => {
      list.push(grid[out.row][out.col])
    })
    return list
  }

  const huntAndKill = grid => {
    const randomRow = Math.floor(Math.random() * rows)
    const randomCol = Math.floor(Math.random() * grid[randomRow].length)
    let current = grid[randomRow][randomCol]

    while (current) {
      const unvisitedNeighbors = getNeighbors(grid, current).filter(n => n.links.length === 0)
      const { length } = unvisitedNeighbors

      if (length) {
        const rand = Math.floor(Math.random() * length)
        const { row, col } = unvisitedNeighbors[rand]

        current.links.push({ row, col })
        grid[row][col].links.push({ row: current.row, col: current.col })

        current = unvisitedNeighbors[rand]
      } else {
        current = null

        loop:
        for (const row of grid)
          for (const cell of row) {
            const visitedNeighbors = getNeighbors(grid, cell).filter(n => n.links.length !== 0)

            if (cell.links.length === 0 && visitedNeighbors.length !== 0) {
              current = cell

              const rand = Math.floor(Math.random() * visitedNeighbors.length)
              const { row, col } = visitedNeighbors[rand]

              current.links.push({ row, col })
              grid[row][col].links.push({ row: current.row, col: current.col })

              break loop
            }
          }
      }
    }
  }

  const grid = createGrid()
  huntAndKill(grid)
  return grid
}
