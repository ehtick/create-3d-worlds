import { SimplexNoise } from './simplex-noise.mjs'

export class Noise {
  constructor(params) {
    this.params = params
    this._Init()
  }

  _Init() {
    this._noise = new SimplexNoise(this.params.seed)
  }

  Get(x, y, z) {
    const G = 2.0 ** (-this.params.persistence)
    const xs = x / this.params.scale
    const ys = y / this.params.scale
    const zs = z / this.params.scale
    const noiseFunc = this._noise

    let amplitude = 1.0
    let frequency = 1.0
    let normalization = 0
    let total = 0
    for (let o = 0; o < this.params.octaves; o++) {
      const noiseValue = z
        ? noiseFunc.noise3D(xs * frequency, ys * frequency, zs * frequency) * 0.5 + 0.5
        : noiseFunc.noise2D(xs * frequency, ys * frequency) * 0.5 + 0.5
      total += noiseValue * amplitude
      normalization += amplitude
      amplitude *= G
      frequency *= this.params.lacunarity
    }
    total /= normalization
    return Math.pow(total, this.params.exponentiation) * this.params.height
  }
}
