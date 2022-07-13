import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.112.1/build/three.module.js'

import { math } from './math.js'
import { noise } from './noise.js'
import { quadtree } from './quadtree.js'
import { spline } from './spline.js'
import { utils } from './utils.js'

export const terrain = (function() {

  class HeightGenerator {
    constructor(generator, position, minRadius, maxRadius) {
      this._position = position.clone()
      this._radius = [minRadius, maxRadius]
      this._generator = generator
    }

    Get(x, y) {
      const distance = this._position.distanceTo(new THREE.Vector2(x, y))
      let normalization = 1.0 - math.sat(
        (distance - this._radius[0]) / (this._radius[1] - this._radius[0]))
      normalization = normalization * normalization * (3 - 2 * normalization)

      return [this._generator.Get(x, y), normalization]
    }
  }

  const _OCEAN = new THREE.Color(0xd9d592)
  const _SNOW = new THREE.Color(0xFFFFFF)
  const _FOREST_BOREAL = new THREE.Color(0x29c100)

  const _MIN_CELL_SIZE = 100
  const _FIXED_GRID_SIZE = 2
  const _MIN_CELL_RESOLUTION = 16

  // Cross-blended Hypsometric Tints
  // http://www.shadedrelief.com/hypso/hypso.html
  class HyposemetricTints {
    constructor(params) {
      const _colourLerp = (t, p0, p1) => {
        const c = p0.clone()
        return c.lerpHSL(p1, t)
      }

      this._colourSpline = [
        new spline.LinearSpline(_colourLerp),
        new spline.LinearSpline(_colourLerp)
      ]

      // Arid
      this._colourSpline[0].AddPoint(0, new THREE.Color(0xb7a67d))
      this._colourSpline[0].AddPoint(0.5, new THREE.Color(0xf1e1bc))
      this._colourSpline[0].AddPoint(1, _SNOW)

      // Humid
      this._colourSpline[1].AddPoint(0, _FOREST_BOREAL)
      this._colourSpline[1].AddPoint(0.5, new THREE.Color(0xcee59c))
      this._colourSpline[1].AddPoint(1, _SNOW)

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

  class TerrainChunk {
    constructor(params) {
      this._params = params
      this._Init(params)
    }

    Destroy() {
      this._params.group.remove(this._plane)
    }

    Hide() {
      this._plane.visible = false
    }

    Show() {
      this._plane.visible = true
    }

    _Init(params) {
      const size = new THREE.Vector3(params.width, 0, params.width)

      this._plane = new THREE.Mesh(
        new THREE.PlaneGeometry(size.x, size.z, params.resolution, params.resolution),
        params.material)
      this._plane.castShadow = false
      this._plane.receiveShadow = true
      this._plane.rotation.x = -Math.PI / 2
      this._params.group.add(this._plane)
    }

    _GenerateHeight(v) {
      const { offset } = this._params
      const heightPairs = []
      let normalization = 0
      let z = 0
      for (const gen of this._params.heightGenerators) {
        heightPairs.push(gen.Get(v.x + offset.x, -v.y + offset.y))
        normalization += heightPairs[heightPairs.length - 1][1]
      }

      if (normalization > 0)
        for (const h of heightPairs)
          z += h[0] * h[1] / normalization

      return z
    }

    *_Rebuild() {
      const NUM_STEPS = 2000
      const colours = []
      const { offset } = this._params
      let count = 0

      for (const v of this._plane.geometry.vertices) {
        v.z = this._GenerateHeight(v)
        colours.push(this._params.colourGenerator.Get(v.x + offset.x, v.z, -v.y + offset.y))

        count++
        if (count > NUM_STEPS) {
          count = 0
          yield
        }
      }

      for (const f of this._plane.geometry.faces) {
        const vs = [f.a, f.b, f.c]

        const vertexColours = []
        for (const v of vs)
          vertexColours.push(colours[v])

        f.vertexColors = vertexColours

        count++
        if (count > NUM_STEPS) {
          count = 0
          yield
        }
      }

      yield
      this._plane.geometry.elementsNeedUpdate = true
      this._plane.geometry.verticesNeedUpdate = true
      this._plane.geometry.computeVertexNormals()
      this._plane.position.set(offset.x, 0, offset.y)
    }
  }

  class TerrainChunkRebuilder {
    constructor(params) {
      this._pool = {}
      this._params = params
      this._Reset()
    }

    AllocateChunk(params) {
      const w = params.width

      if (!(w in this._pool))
        this._pool[w] = []

      let c = null
      if (this._pool[w].length > 0) {
        c = this._pool[w].pop()
        c._params = params
      } else
        c = new TerrainChunk(params)

      c.Hide()
      this._queued.push(c)
      return c
    }

    _RecycleChunks(chunks) {
      for (const c of chunks) {
        if (!(c.chunk._params.width in this._pool))
          this._pool[c.chunk._params.width] = []

        c.chunk.Hide()
        this._pool[c.chunk._params.width].push(c.chunk)
      }
    }

    _Reset() {
      this._active = null
      this._queued = []
      this._old = []
      this._new = []
    }

    get Busy() {
      return this._active
    }

    Update2() {
      for (const b of this._queued) {
        b._Rebuild().next()
        this._new.push(b)
      }
      this._queued = []

      if (this._active)
        return

      if (!this._queued.length) {
        this._RecycleChunks(this._old)
        for (const b of this._new)
          b.Show()

        this._Reset()
      }
    }

    Update() {
      if (this._active) {
        const r = this._active.next()
        if (r.done)
          this._active = null

      } else {
        const b = this._queued.pop()
        if (b) {
          this._active = b._Rebuild()
          this._new.push(b)
        }
      }

      if (this._active)
        return

      if (!this._queued.length) {
        this._RecycleChunks(this._old)
        for (const b of this._new)
          b.Show()

        this._Reset()
      }
    }
  }

  class TerrainChunkManager {
    constructor(params) {
      this._Init(params)
    }

    _Init(params) {
      this._params = params

      this._material = new THREE.MeshStandardMaterial({
        wireframe: false,
        wireframeLinewidth: 1,
        color: 0xFFFFFF,
        side: THREE.FrontSide,
        vertexColors: THREE.VertexColors,
      })
      this._builder = new TerrainChunkRebuilder()

      this._InitNoise(params)
      this._InitBiomes(params)
      this._InitTerrain(params)
    }

    _InitNoise(params) {
      params.noise = {
        octaves: 6,
        persistence: 0.707,
        lacunarity: 1.8,
        exponentiation: 4.5,
        height: 300,
        scale: 500,
        noiseType: 'simplex',
        seed: 1
      }
      this._noise = new noise.Noise(params.noise)
      params.heightmap = {
        height: 8,
      }
    }

    _InitBiomes(params) {
      params.biomes = {
        octaves: 2,
        persistence: 0.5,
        lacunarity: 2,
        exponentiation: 3.9,
        scale: 1024,
        noiseType: 'simplex',
        seed: 2,
        height: 1
      }

      this._biomes = new noise.Noise(params.biomes)
    }

    _InitTerrain(params) {
      params.terrain = {
        wireframe: false,
      }

      this._group = new THREE.Group()
      params.scene.add(this._group)

      this._chunks = {}
      this._params = params
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

      const q = new quadtree.QuadTree({
        min: new THREE.Vector2(-32000, -32000),
        max: new THREE.Vector2(32000, 32000),
      })
      q.Insert(this._params.camera.position)

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

      const [xc, zc] = this._CellIndex(this._params.camera.position)

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
      const [xc, zc] = this._CellIndex(this._params.camera.position)
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

  return {
    TerrainChunkManager
  }
})()
