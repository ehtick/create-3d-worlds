import * as THREE from 'three'
import { BufferGeometryUtils } from '/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js'
import { createBox } from '/utils/geometry.js'
import { centerObject } from '/utils/helpers.js'

const { Vector2, Vector3 } = THREE
const { randInt, randFloat } = THREE.Math

const EMPTY = 0
const WALL = 1

const textureLoader = new THREE.TextureLoader()

/* MAZE GENERATION */

/**
 * Generates a square maze, with a path from one corner to another.
 * https://github.com/wwwtyro/Astray/blob/master/maze.js
 */
export function generateSquareMaze(size) {
  let matrix = new Array(size)
  for (let i = 0; i < size; i++) {
    matrix[i] = new Array(size)
    for (let j = 0; j < size; j++)
      matrix[i][j] = WALL
  }

  function iterate(matrix, x, y) {
    matrix[x][y] = EMPTY
    while (true) {
      const directions = []
      if (x > 1 && matrix[x - 2][y] == WALL)
        directions.push([-1, 0])

      if (x < size - 2 && matrix[x + 2][y] == WALL)
        directions.push([1, 0])

      if (y > 1 && matrix[x][y - 2] == WALL)
        directions.push([0, -1])

      if (y < size - 2 && matrix[x][y + 2] == WALL)
        directions.push([0, 1])

      if (directions.length == 0) return matrix

      const dir = directions[Math.floor(Math.random() * directions.length)]
      matrix[x + dir[0]][y + dir[1]] = EMPTY
      iterate(matrix, x + dir[0] * 2, y + dir[1] * 2) // recursion
    }
  }

  matrix = iterate(matrix, 1, 1)

  matrix[size - 1][size - 2] = EMPTY // exit hole
  return matrix
}

/*
  Prim's Algorithm
  https://stackoverflow.com/questions/54613229
*/

export function primsAlgorithm(cols = 60, rows = 60) {
  // 1. Start with a grid full of walls.
  const maze = []
  for (let i = 0; i < cols; i++) {
    maze.push([])
    for (let j = 0; j < rows; j++)
      maze[i][j] = WALL
  }

  // 2. Pick a cell, mark it as part of the maze.
  const cell = {
    x: Math.floor(Math.random() * cols),
    y: Math.floor(Math.random() * rows)
  }
  maze[cell.x][cell.y] = EMPTY

  // 2.1 Add the walls of the cell to the wall list.
  const walls = []
  if (cell.x + 1 < cols) walls.push({
    x: cell.x + 1,
    y: cell.y
  })
  if (cell.x - 1 >= 0) walls.push({
    x: cell.x - 1,
    y: cell.y
  })
  if (cell.y + 1 < rows) walls.push({
    x: cell.x,
    y: cell.y + 1
  })
  if (cell.y - 1 >= 0) walls.push({
    x: cell.x,
    y: cell.y - 1
  })

  // 3. While there are walls in the list:
  while (walls.length > 0) {

    // 3.1 Pick a random wall from the list.
    const wallIndex = Math.floor(Math.random() * walls.length)
    const wall = walls[wallIndex]

    // 3.2 If only one of the two cells that the wall divides is visited, then:
    const uc = [] // unvisited cell

    if (wall.x + 1 < cols && maze[wall.x + 1][wall.y] === EMPTY) uc.push({
      x: wall.x - 1,
      y: wall.y
    })
    if (wall.x - 1 >= 0 && maze[wall.x - 1][wall.y] === EMPTY) uc.push({
      x: wall.x + 1,
      y: wall.y
    })
    if (wall.y + 1 < rows && maze[wall.x][wall.y + 1] === EMPTY) uc.push({
      x: wall.x,
      y: wall.y - 1
    })
    if (wall.y - 1 >= 0 && maze[wall.x][wall.y - 1] === EMPTY) uc.push({
      x: wall.x,
      y: wall.y + 1
    })

    if (uc.length === 1) {
      // 3.2.1 Make the wall a passage and mark the unvisited cell as part of the maze.
      maze[wall.x][wall.y] = EMPTY
      if (uc[0].x >= 0 && uc[0].x < cols && uc[0].y >= 0 && uc[0].y < rows) {
        maze[uc[0].x][uc[0].y] = EMPTY

        // 3.2.2 Add the neighboring walls of the cell to the wall list.
        if (uc[0].x + 1 < cols && maze[uc[0].x + 1][uc[0].y] === WALL) walls.push({
          x: uc[0].x + 1,
          y: uc[0].y
        })
        if (uc[0].x - 1 >= 0 && maze[uc[0].x - 1][uc[0].y] === WALL) walls.push({
          x: uc[0].x - 1,
          y: uc[0].y
        })
        if (uc[0].y + 1 < rows && maze[uc[0].x][uc[0].y + 1] === WALL) walls.push({
          x: uc[0].x,
          y: uc[0].y + 1
        })
        if (uc[0].y - 1 >= 0 && maze[uc[0].x][uc[0].y - 1] === WALL) walls.push({
          x: uc[0].x,
          y: uc[0].y - 1
        })
      }
    }
    // 3.3 Remove the wall from the list.
    walls.splice(wallIndex, 1)
  }
  return maze
}

/* MESH FROM MATRIX */

// TODO: merge geometries with different textures if possible
export function create3DMap({ matrix = randomMatrix(), size = 1, yModifier } = {}) {
  const origin = {
    x: -matrix[0].length * size * .5,
    z: -matrix.length * size * .5
  }
  const textures = ['concrete.jpg', 'crate.gif', 'brick.png']
  const group = new THREE.Group()
  matrix.forEach((row, rowIndex) => row.forEach((val, columnIndex) => {
    if (!val) return
    const x = (columnIndex * size) + origin.x
    const z = (rowIndex * size) + origin.z
    const file = textures[val - 1] || textures[0]
    const box = createBox({ x, z, size, file, yModifier })
    box.position.set(x, 0, z)
    group.add(box)
  }))
  return group
}

export function createMazeMesh({ matrix, size = 1, maxSize = size, texture = 'concrete.jpg' } = {}) {
  const map = textureLoader.load(`/assets/textures/${texture}`)
  const geometries = []
  matrix.forEach((row, j) => row.forEach((val, i) => {
    if (!val) return
    if (val > 0) {
      // render wall
      const height = randInt(size, maxSize)
      const geometry = new THREE.BoxGeometry(size, height, size)
      geometry.translate(i, height * .5, j)
      geometries.push(geometry)
    } else {
      // render path
      const geometry = new THREE.SphereGeometry(size * .1)
      geometry.translate(i, size * .05, j)
      geometries.push(geometry)
    }
  }))

  const geometry = BufferGeometryUtils.mergeBufferGeometries(geometries)
  geometry.translate(-matrix[0].length * size * .5, 0, -matrix.length * size * .5)
  const material = new THREE.MeshPhongMaterial({ map })
  const mesh = new THREE.Mesh(geometry, material)
  return mesh
}

/* HELPERS */

export function randomField(matrix) {
  const y = Math.floor(Math.random() * matrix.length)
  const x = Math.floor(Math.random() * matrix[0].length)
  return [x, y]
}

export const getMapPosition = ({ obj, map, cellSize }) => {
  const mapWidth = map.length
  const mapHeight = map[0].length
  return {
    x: Math.floor((obj.x + cellSize * .5) / cellSize + mapHeight * .5),
    z: Math.floor((obj.z + cellSize * .5) / cellSize + mapWidth * .5)
  }
}

export function randomMatrix(size = 10, wallPercent = .3) {
  const matrix = []
  for (let y = 0; y < size; y++) {
    matrix[y] = []
    for (let x = 0; x < size; x++)
      matrix[y][x] = Math.random() < wallPercent ? WALL : EMPTY
  }
  return matrix
}

/* CIRCULAR MAZE */

const isLinked = (cellA, cellB) => {
  const cellLinks = Array.isArray(cellA.links) ? cellA.links : Object.values(cellA.links)
  const link = cellLinks.find(l => l.row === cellB.row && l.col === cellB.col)
  return !!link
}

// TODO: implement without a mesh?
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

function createBlock(p1, p2, castle = true) {
  const distanceToCenter = new Vector2(0, 0).distanceTo(new Vector2(p1.x, p1.z))
  const width = randFloat(2, 4)
  const height = castle ? (21 - distanceToCenter / 10) * 5 : randFloat(2, 8)
  const depth = p1.distanceTo(p2)
  const geometry = new THREE.BoxGeometry(width, height, depth)
  geometry.translate(0, height / 2, depth / 2)

  turnTo(geometry, p1, p2)
  return geometry
}

export const createCircularMazeMesh = (grid, connect = createBlock, color = 'white', cellSize = 10) => {
  const center = 0
  const geometries = []
  for (const row of grid)
    for (const cell of row)
      if (cell.row) {
        const theta = 2 * Math.PI / row.length
        const inner_radius = cell.row * cellSize
        const outer_radius = (cell.row + 1) * cellSize
        const theta_ccw = cell.col * theta
        const theta_cw = (cell.col + 1) * theta

        const ax = Math.round(center + (inner_radius * Math.cos(theta_ccw)))
        const ay = Math.round(center + (inner_radius * Math.sin(theta_ccw)))
        const bx = Math.round(center + (outer_radius * Math.cos(theta_ccw)))
        const by = Math.round(center + (outer_radius * Math.sin(theta_ccw)))
        const cx = Math.round(center + (inner_radius * Math.cos(theta_cw)))
        const cy = Math.round(center + (inner_radius * Math.sin(theta_cw)))
        const dx = Math.round(center + (outer_radius * Math.cos(theta_cw)))
        const dy = Math.round(center + (outer_radius * Math.sin(theta_cw)))

        if (!cell.inward || !isLinked(cell, cell.inward)) {
          const p1 = new Vector3(ax, 0, ay)
          const p2 = new Vector3(cx, 0, cy)
          geometries.push(connect(p1, p2))
        }

        if (!cell.cw || !isLinked(cell, cell.cw)) {
          const p1 = new Vector3(cx, 0, cy)
          const p2 = new Vector3(dx, 0, dy)
          geometries.push(connect(p1, p2))
        }

        if (cell.row === grid.length - 1 && cell.col !== row.length * 0.75) {
          const p1 = new Vector3(bx, 0, by)
          const p2 = new Vector3(dx, 0, dy)
          geometries.push(connect(p1, p2))
        }
      }
  const geometry = BufferGeometryUtils.mergeBufferGeometries(geometries)
  const material = new THREE.MeshLambertMaterial({ color })
  return new THREE.Mesh(geometry, material)
}

/* ALIASES */

export const createCircularCity = grid => createCircularMazeMesh(grid, createBlock)

export const createCircularPipes = grid => createCircularMazeMesh(grid, createPipe, 'gray')

export const createCircularRuins = grid => createCircularMazeMesh(grid, (p1, p2) => createBlock(p1, p2, false))

/* MESH FROM GRID */

export function meshFromGrid(grid, cellSize = 10, connect = createPipe, color = 'white') {
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
  const material = new THREE.MeshLambertMaterial({ color })
  const mesh = new THREE.Mesh(geometry, material)
  return mesh
}

/* MESH FROM POLAR GRID */

export function meshFromPolarGrid(grid, connect = createPipe, color = 'gray', cellSize = 10) {
  const center = 0
  const geometries = []

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
  const material = new THREE.MeshLambertMaterial({ color })
  const mesh = new THREE.Mesh(geometry, material)
  return mesh
}

export const polarMazeCity = grid => meshFromPolarGrid(grid, createBlock, 'white')

export const polarMazePipes = grid => meshFromPolarGrid(grid, createPipe, 'gray')

export const polarMazeRuins = grid => meshFromPolarGrid(grid, (p1, p2) => createBlock(p1, p2, false), 'white')
