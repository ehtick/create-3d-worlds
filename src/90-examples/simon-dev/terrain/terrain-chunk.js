import * as THREE from '/node_modules/three127/build/three.module.js'

export class TerrainChunk {
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
    const NUM_STEPS = 5000
    const colors = []
    const { offset } = this._params
    let count = 0

    const positionAttribute = this._plane.geometry.getAttribute('position')
    const v = new THREE.Vector3()

    for (let i = 0; i < positionAttribute.count; i ++) {
      v.fromBufferAttribute(positionAttribute, i)
      v.z = this._GenerateHeight(v)
      const color = this._params.colourGenerator.Get(v.x + offset.x, v.z, -v.y + offset.y)
      colors.push(color.r, color.g, color.b)
      positionAttribute.setXYZ(i, v.x, v.y, v.z)

      count++
      if (count > NUM_STEPS) {
        count = 0
        yield
      }
    }
    this._plane.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    yield
    this._plane.geometry.elementsNeedUpdate = true
    this._plane.geometry.verticesNeedUpdate = true
    this._plane.geometry.computeVertexNormals()
    this._plane.position.set(offset.x, 0, offset.y)
  }
}
