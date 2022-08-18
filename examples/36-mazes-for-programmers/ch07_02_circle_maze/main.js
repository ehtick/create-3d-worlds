import PolarGrid from '../mazes/PolarGrid.js'
import RecursiveBacktracker from '../mazes/algorithms/RecursiveBacktracker.js'

const grid = new PolarGrid(10)
console.log(grid)
RecursiveBacktracker.on(grid)

grid.init_path()
grid.draw(20)
