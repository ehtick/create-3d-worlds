import { TerrainChunk } from './terrain-chunk-old.js'

export class TerrainChunkRebuilder {
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
