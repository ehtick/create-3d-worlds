import * as THREE from 'three'
import * as BufferGeometryUtils from '/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js'
import { centerGeometry, getTexture } from '/utils/helpers.js'
import { createBuildingTexture, createBuildingGeometry } from '/utils/city.js'
import chroma from '/libs/chroma.js'

const { Vector2, Vector3 } = THREE
const { randInt, randFloat } = THREE.MathUtils

const EMPTY = 0
const WALL = 1

const textureLoader = new THREE.TextureLoader()

/* HELPERS */

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

export const cellToPos = (matrix, cell, size = 1) => {
  const origin = {
    x: size * matrix.length / 2,
    z: size * matrix[0].length / 2
  }
  const x = -origin.x + cell[0] * size + size / 2
  const z = -origin.z + cell[1] * size + size / 2
  return { x, z }
}

export const firstCellPos = (matrix, size) => cellToPos(matrix, [1, 1], size)

/* MESH FROM MATRIX */

const scale = (value, range1, range2) =>
  (value - range1[0]) * (range2[1] - range2[0]) / (range1[1] - range1[0]) + range2[0]

const isRing = (row, j, i, ringIndex) => i == ringIndex || j == ringIndex || j == row.length - (1 + ringIndex) || i == row.length - (1 + ringIndex)

const pyramidHeight = (row, j, i, size, maxHeight) => {
  const flatRoof = 2
  const cityCenter = row.length / 2 - flatRoof
  let height = size
  for (let ringIndex = 0; ringIndex < cityCenter; ringIndex++) {
    height = scale(ringIndex, [0, cityCenter], [size, maxHeight])
    if (isRing(row, j, i, ringIndex)) return height
  }
  return height
}

const randomHeight = (row, j, i, size, maxHeight) => isRing(row, j, i, 0) ? size : randFloat(size, maxHeight)

const addColors = ({ geometry, color, height, maxHeight } = {}) => {
  const f = chroma.scale([0x999999, 0xffffff]).domain([0, maxHeight])
  const shade = new THREE.Color(color || f(height).hex())
  const colors = []
  for (let i = 0, l = geometry.attributes.position.count; i < l; i++)
    colors.push(shade.r, shade.g, shade.b)
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
}

const createBoxGeometry = ({ size, height, maxHeight, texture }) => {
  const geometry = new THREE.BoxGeometry(size, height, size)
  if (!texture) addColors({ geometry, height, maxHeight })
  return geometry
}

export function meshFromMatrix({ matrix = randomMatrix(), size = 1, maxHeight = size, texture, bumpFile, calcHeight = randomHeight, material, city = false, cityTexture = false } = {}) {
  const geometries = []
  matrix.forEach((row, j) => row.forEach((val, i) => {
    if (!val) return
    if (val > 0) {
      const height = maxHeight ? calcHeight(row, j, i, size, maxHeight) : randInt(size, size * 4)
      const block = city
        ? createBuildingGeometry({ width: size, height })
        : createBoxGeometry({ size, height, maxHeight, texture })
      block.translate(i * size, city ? 0 : height * .5, j * size)
      geometries.push(block)
    } else {
      // render path if exists
      const ball = new THREE.SphereGeometry(size * .1)
      ball.translate(i * size, size * .05, j * size)
      if (!texture && !city) addColors({ geometry: ball, color: 0xff0000 })
      geometries.push(ball)
    }
  }))

  const geometry = BufferGeometryUtils.mergeBufferGeometries(geometries)
  centerGeometry(geometry)

  const options = {
    vertexColors: !texture,
    map: cityTexture ? createBuildingTexture() : texture ? textureLoader.load(`/assets/textures/${texture}`) : null,
    bumpMap: bumpFile ? textureLoader.load(`/assets/textures/${bumpFile}`) : null,
  }
  const mesh = new THREE.Mesh(geometry, material || new THREE.MeshPhongMaterial(options))
  return mesh
}

export const cityFromMatrix = params =>
  meshFromMatrix({ city: true, maxHeight: 0, cityTexture: true, ...params })

export const pyramidFromMatrix = ({ matrix, size = 1, maxHeight = size * matrix.length * .33, ...params } = {}) =>
  meshFromMatrix({ matrix, size, maxHeight, calcHeight: pyramidHeight, ...params })

export function putInMaze(mesh, matrix, size) {
  const { x, z } = firstCellPos(matrix, size)
  mesh.position.set(x, 0, z)
  mesh.lookAt(x, 0, z - 1)
}

/* MESH FROM GRID */

const turnTo = (geometry, p1, p2) => {
  const mesh = new THREE.Mesh(geometry)
  mesh.position.set(p1.x, 0, p1.z)
  mesh.lookAt(p2)
  mesh.updateMatrix()
  geometry.applyMatrix4(mesh.matrix)
}

function createPipe(p1, p2) {
  const distance = p1.distanceTo(p2)
  const geometry = new THREE.CylinderGeometry(1, 1, distance, 12)
  geometry.translate(0, -distance / 2, 0)
  geometry.rotateX(-Math.PI / 2)

  turnTo(geometry, p1, p2)
  return geometry
}

function createCityWall(p1, p2, castle = true) {
  const distanceToCenter = new Vector2(0, 0).distanceTo(new Vector2(p1.x, p1.z))
  const width = randFloat(2, 4)
  const height = castle ? (21 - distanceToCenter / 10) * 5 : randFloat(2, 8)
  const depth = p1.distanceTo(p2)
  const geometry = new THREE.BoxGeometry(width, height, depth)
  geometry.translate(0, height / 2, depth / 2)

  turnTo(geometry, p1, p2)
  return geometry
}

const createRandomWall = (p1, p2) => createCityWall(p1, p2, false)

export function meshFromGrid({ grid, cellSize = 10, connect = createRandomWall, color = 'white', texture } = {}) {
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
  geometry.translate(0, .5, 0)
  centerGeometry(geometry)
  const material = new THREE.MeshLambertMaterial({
    color,
    map: texture ? getTexture({ file: texture }) : null
  })
  const mesh = new THREE.Mesh(geometry, material)
  return mesh
}

/* MESH FROM POLAR GRID */

export function meshFromPolarGrid({ grid, connect = createPipe, color = 'gray', cellSize = 10, texture } = {}) {
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

      // last ringIndex with entrance
      if (cell.row === grid.size - 1 && cell.column !== row.length * 0.75) {
        const p1 = new Vector3(bx, 0, by)
        const p2 = new Vector3(dx, 0, dy)
        geometries.push(connect(p1, p2))
      }
    }

  const geometry = BufferGeometryUtils.mergeBufferGeometries(geometries)
  geometry.translate(0, .5, 0)
  const material = new THREE.MeshLambertMaterial({
    color,
    map: texture ? getTexture({ file: texture }) : null
  })
  const mesh = new THREE.Mesh(geometry, material)
  return mesh
}

export const polarMazePipes = ({ grid, ...params }) => meshFromPolarGrid({ grid, connect: createPipe, color: 'gray', ...params })

export const polarMazeCity = ({ grid, ...params }) => meshFromPolarGrid({ grid, connect: createCityWall, color: 0xffffff, ...params })

export const polarMazeRuins = ({ grid, ...params }) => meshFromPolarGrid({ grid, connect: (p1, p2) => createCityWall(p1, p2, false), color: 'white', ...params })
