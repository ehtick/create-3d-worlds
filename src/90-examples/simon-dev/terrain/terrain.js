import * as THREE from '/node_modules/three127/build/three.module.js'
import { scene } from '/utils/scene.js'

import { Noise } from '../shared/noise.mjs'
import { QuadTree } from './quadtree-old.js'
import { TerrainChunkRebuilder } from './terrain-builder.js'
import { LinearSpline } from '../shared/spline.mjs'
import { utils } from './utils.js'
import { HeightGenerator } from '../shared/terrain-height.mjs'

const _OCEAN = new THREE.Color(0xd9d592)
const _SNOW = new THREE.Color(0xFFFFFF)
const _FOREST_BOREAL = new THREE.Color(0x29c100)

const _MIN_CELL_SIZE = 500
const _FIXED_GRID_SIZE = 10
const _MIN_CELL_RESOLUTION = 64

// Cross-blended Hypsometric Tints
// http://www.shadedrelief.com/hypso/hypso.html
class HyposemetricTints {
  constructor(params) {
    const _colourLerp = (t, p0, p1) => {
      const c = p0.clone()

      return c.lerpHSL(p1, t)
    }
    this._colourSpline = [
      new LinearSpline(_colourLerp),
      new LinearSpline(_colourLerp)
    ]
    // Arid
    this._colourSpline[0].AddPoint(0.0, new THREE.Color(0xb7a67d))
    this._colourSpline[0].AddPoint(0.5, new THREE.Color(0xf1e1bc))
    this._colourSpline[0].AddPoint(1.0, _SNOW)

    // Humid
    this._colourSpline[1].AddPoint(0.0, _FOREST_BOREAL)
    this._colourSpline[1].AddPoint(0.5, new THREE.Color(0xcee59c))
    this._colourSpline[1].AddPoint(1.0, _SNOW)

    this._params = params
  }

  Get(x, y, z) {
    const m = this._params.biomeGenerator.Get(x, z)
    const h = y / 100.0

    if (h < 0.05)
      return _OCEAN

    const c1 = this._colourSpline[0].Get(h)
    const c2 = this._colourSpline[1].Get(h)

    return c1.lerpHSL(c2, m)
  }
}

export class TerrainChunkManager {
  constructor(userCamera) {
    this._Init()
    this._userCamera = userCamera
  }

  _Init() {
    this._material = new THREE.MeshStandardMaterial({
      wireframe: false,
      wireframeLinewidth: 1,
      color: 0xFFFFFF,
      side: THREE.FrontSide,
      vertexColors: THREE.VertexColors,
    })
    this._builder = new TerrainChunkRebuilder()

    this._InitNoise()
    this._InitBiomes()
    this._InitTerrain()
  }

  _InitNoise() {
    const noiseParams = {
      octaves: 6,
      persistence: 0.707,
      lacunarity: 1.8,
      exponentiation: 4.5,
      height: 300.0,
      scale: 1100.0,
      noiseType: 'simplex',
      seed: 1
    }
    this._noise = new Noise(noiseParams)
  }

  _InitBiomes() {
    const noiseParams = {
      octaves: 2,
      persistence: 0.5,
      lacunarity: 2.0,
      scale: 2048.0,
      noiseType: 'simplex',
      seed: 2,
      // exponentiation: 3.9,
      exponentiation: 1,
      height: 1
    }
    this._biomes = new Noise(noiseParams)
  }

  _InitTerrain() {
    this._group = new THREE.Group()
    scene.add(this._group)
    this._chunks = {}
  }

  _CellIndex(p) {
    const xp = p.x + _MIN_CELL_SIZE * 0.5
    const yp = p.z + _MIN_CELL_SIZE * 0.5
    const x = Math.floor(xp / _MIN_CELL_SIZE)
    const z = Math.floor(yp / _MIN_CELL_SIZE)
    return [x, z]
  }

  _CreateTerrainChunk(offset, width) {
    const params = {
      group: this._group,
      material: this._material,
      width,
      offset: new THREE.Vector3(offset.x, offset.y, 0),
      resolution: _MIN_CELL_RESOLUTION,
      biomeGenerator: this._biomes,
      colourGenerator: new HyposemetricTints({ biomeGenerator: this._biomes }),
      heightGenerators: [new HeightGenerator(this._noise, offset, 100000, 100000 + 1)],
    }

    return this._builder.AllocateChunk(params)
  }

  Update(_) {
    this._builder.Update()
    if (!this._builder.Busy)
      this._UpdateVisibleChunks_Quadtree()
  }

  _UpdateVisibleChunks_Quadtree() {
    function _Key(c) {
      return c.position[0] + '/' + c.position[1] + ' [' + c.dimensions[0] + ']'
    }

    const q = new QuadTree({
      size: 32000,
    })
    q.Insert(this._userCamera.position)

    const children = q.GetChildren()

    let newTerrainChunks = {}
    const center = new THREE.Vector2()
    const dimensions = new THREE.Vector2()
    for (const c of children) {
      c.bounds.getCenter(center)
      c.bounds.getSize(dimensions)

      const child = {
        position: [center.x, center.y],
        bounds: c.bounds,
        dimensions: [dimensions.x, dimensions.y],
      }

      const k = _Key(child)
      newTerrainChunks[k] = child
    }

    const intersection = utils.DictIntersection(this._chunks, newTerrainChunks)
    const difference = utils.DictDifference(newTerrainChunks, this._chunks)
    const recycle = Object.values(utils.DictDifference(this._chunks, newTerrainChunks))

    this._builder._old.push(...recycle)

    newTerrainChunks = intersection

    for (const k in difference) {
      const [xp, zp] = difference[k].position
      const offset = new THREE.Vector2(xp, zp)
      newTerrainChunks[k] = {
        position: [xp, zp],
        chunk: this._CreateTerrainChunk(offset, difference[k].dimensions[0]),
      }
    }

    this._chunks = newTerrainChunks
  }

  _UpdateVisibleChunks_FixedGrid() {
    function _Key(xc, zc) {
      return xc + '/' + zc
    }

    const [xc, zc] = this._CellIndex(this._userCamera.position)

    const keys = {}

    for (let x = -_FIXED_GRID_SIZE; x <= _FIXED_GRID_SIZE; x++)
      for (let z = -_FIXED_GRID_SIZE; z <= _FIXED_GRID_SIZE; z++) {
        const k = _Key(x + xc, z + zc)
        keys[k] = {
          position: [x + xc, z + zc]
        }
      }

    const difference = utils.DictDifference(keys, this._chunks)

    for (const k in difference) {
      if (k in this._chunks)
        continue

      const [xp, zp] = difference[k].position

      const offset = new THREE.Vector2(xp * _MIN_CELL_SIZE, zp * _MIN_CELL_SIZE)
      this._chunks[k] = {
        position: [xc, zc],
        chunk: this._CreateTerrainChunk(offset, _MIN_CELL_SIZE),
      }
    }
  }

  _UpdateVisibleChunks_Single() {
    function _Key(xc, zc) {
      return xc + '/' + zc
    }

    // Check the camera's position.
    const [xc, zc] = this._CellIndex(this._userCamera.position)
    const newChunkKey = _Key(xc, zc)

    // We're still in the bounds of the previous chunk of terrain.
    if (newChunkKey in this._chunks)
      return

    // Create a new chunk of terrain.
    const offset = new THREE.Vector2(xc * _MIN_CELL_SIZE, zc * _MIN_CELL_SIZE)
    this._chunks[newChunkKey] = {
      position: [xc, zc],
      chunk: this._CreateTerrainChunk(offset, _MIN_CELL_SIZE),
    }
  }
}
