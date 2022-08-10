import {
  Vector3,
  LineBasicMaterial,
  MeshPhongMaterial,
  PlaneGeometry,
  LineSegments,
  Mesh,
  Object3D,
  BufferGeometry,
  BufferAttribute,
} from 'three'

import { n, gap, size } from './config.js'
import rnd from '../../utils/random.js'

const random = rnd.seed(42)

const f = (A, B, x, C = 0, D = 0) => A * Math.sin(B * x + C) + D

const { PI } = Math

const subdivide = (start, end, q) => {
  const points = [] // array of Vector3's
	;(['x', 'y', 'z']).map(axis => {
    const step = (end[axis] - start[axis]) / (q - 1)
    for (let n = 1; n < (q - 1); n++) {
      if (!points[n - 1]) points[n - 1] = new Vector3(0, 0, 0)
      points[n - 1][axis] = start[axis] + n * step
    }
  })
  return [start, ...points, end]
}

const lineMaterial = new LineBasicMaterial({
  color: 0xEA29FA,
})

const planeMaterial = new MeshPhongMaterial({
  color: 0x1D1588,
  specular: 0xDD01F6,
})

class Landscape {
  constructor(scene) {
    this.container = new Object3D()
    this.container.position.set(-(size / 2), -1.5, 0)

    this.plane = new Mesh(
      new PlaneGeometry(size, size, (n - 1), (n - 1)),
      planeMaterial,
    )
    this.plane.rotation.x = -PI / 2
    this.plane.position.set((size / 2), -.001, -(size / 2), 0)

    // lines
    // horizontal
    {
      const positions = new Float32Array(n * n * 3)
      const indices = []

      for (let z = (n - 1), i = 0; z >= 0; z--, i++) {
        const vs = subdivide(new Vector3(0, 0, -z * gap), new Vector3(size, 0, -z * gap), n)
        vs.forEach((v, j) => {
          positions[i * (n * 3) + j * 3 + 0] = v.x
          positions[i * (n * 3) + j * 3 + 1] = v.y
          positions[i * (n * 3) + j * 3 + 2] = v.z
          if (j === n - 1) return

          indices.push(i * n + j, i * n + j + 1)
        })
      }

      const geometry = new BufferGeometry()
      geometry.setAttribute('position', new BufferAttribute(positions, 3))
      geometry.setIndex(new BufferAttribute(new Uint16Array(indices), 1))

      this.horizontal = new LineSegments(geometry, lineMaterial)
    }

    // vertical
    {
      const positions = new Float32Array(n * n * 3)
      const indices = []

      for (let i = 0; i < n; i++) {
        const vs = subdivide(new Vector3(i * gap, 0, -size), new Vector3(i * gap, 0, 0), n)
        vs.forEach((v, j) => {
          positions[i * n * 3 + j * 3] = v.x
          positions[i * n * 3 + j * 3 + 1] = v.y
          positions[i * n * 3 + j * 3 + 2] = v.z
          if (j === n - 1) return

          indices.push(i * n + j, i * n + j + 1)
        })
      }

      const geometry = new BufferGeometry()
      geometry.setAttribute('position', new BufferAttribute(positions, 3))
      geometry.setIndex(new BufferAttribute(new Uint16Array(indices), 1))
      this.vertical = new LineSegments(geometry, lineMaterial)
    }

    this.randoms = []
    for (let i = 0; i < n ** 2; i++)
      this.randoms.push(random.range(-1.5, 0))

    this.update()
    this.container.add(
      this.plane,
      this.horizontal,
      this.vertical,
    )
  }

  update() {
    for (let i = 0; i < n; i++) {
      let q = f(2, 4 * PI, i / (n - 1), -PI / 2) +
					Math.abs(f(random.range(1, 2), PI, i / (n - 1), PI))

      if (i === n - 1) q = -6 // meh

      for (let j = 0; j < n; j++) {
        const w = f(random.range(4, 5), 3 * PI, j / (n - 1))
        const offset = Math.max(1.5, w + q + this.randoms[i * n + j])
        this.horizontal.geometry.attributes.position.array[i * n * 3 + j * 3 + 1] = offset
        this.vertical.geometry.attributes.position.array[j * n * 3 + i * 3 + 1] = offset
      }
    }

    this.vertical.geometry.attributes.position.needsUpdate = true
    this.horizontal.geometry.attributes.position.needsUpdate = true
    this.plane.geometry.verticesNeedUpdate = true
  }
}

export default Landscape
