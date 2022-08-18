import { sample } from '../utils.js'
import Grid from '../Grid.js'

export default class SideWinder {
  static on(grid) {
    for (const row of grid.each_row()) {
      let run = []
      for (const cell of row) {
        run.push(cell)
        const should_close_out = !cell.east || (cell.north && Math.random() < 0.5)
        if (should_close_out) {
          const member = sample(run)
          if (member.north) member.link(member.north)
          run = []
        } else
          cell.link(cell.east)
      }
    }
  }
}

export function sideWinder(rows, columns) {
  const grid = new Grid(rows, columns)
  SideWinder.on(grid)
  const matrix = grid.toMatrix()
  return matrix
}