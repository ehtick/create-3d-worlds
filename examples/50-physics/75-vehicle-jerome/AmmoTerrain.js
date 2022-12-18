import * as THREE from 'three'
import { Ammo } from '/utils/physics.js'
import { geometryFromData, getHeightData } from '/utils/terrain/heightmap.js'

const { data, width, depth } = await getHeightData('/assets/heightmaps/wiki.png')

export default class AmmoTerrain {
  constructor({
    maxHeight = 24, minHeight = 0, // width = 90, depth = 150,
  } = {}) {
    // const data = generateHeightData(width, depth, minHeight, maxHeight)

    const geometry = geometryFromData({ data, width, depth })
    const material = new THREE.MeshLambertMaterial({ color: 0xfffacd })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.translateY(-maxHeight / 2)
    mesh.receiveShadow = true

    const shape = createTerrainShape(data)
    const transform = new Ammo.btTransform()
    transform.setIdentity()
    transform.setOrigin(new Ammo.btVector3(mesh.position.x, mesh.position.y + maxHeight / 2, mesh.position.z))
    const mass = 0
    const inertia = new Ammo.btVector3(0, 0, 0)
    const motionState = new Ammo.btDefaultMotionState(transform)
    const body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, inertia))
    body.setRestitution(0.9)

    this.mesh = mesh
    this.body = body

    function createTerrainShape(data) {
      const heightScale = 1 // ignored for PHY_FLOAT
      const upAxis = 1 // 0=X, 1=Y, 2=Z
      const hdt = 'PHY_FLOAT' // possible values: PHY_FLOAT, PHY_UCHAR, PHY_SHORT
      const flipQuadEdges = false
      const ammoHeightData = Ammo._malloc(4 * width * depth)
      // copy javascript data array to the Ammo one
      let p = 0
      let p2 = 0
      for (let j = 0; j < depth; j++)
        for (let i = 0; i < width; i++) {
          // write 32-bit float data to memory
          Ammo.HEAPF32[ammoHeightData + p2 >> 2] = data[p]
          p++
          p2 += 4 // 4 bytes/float
        }

      const heightFieldShape = new Ammo.btHeightfieldTerrainShape(
        width, depth, ammoHeightData, heightScale,
        minHeight, maxHeight, upAxis, hdt, flipQuadEdges
      )
      heightFieldShape.setMargin(0.05)
      return heightFieldShape
    }

    function generateHeightData(width, depth, minHeight) {
      const data = new Float32Array(width * depth)
      const radiusX = 24 * 2
      const radiusZ = 24 * 2
      const radiusY = radiusX / 4

      for (let index = 0, z = 0; z < depth; z++)
        for (let x = 0; x < width; x++) {
          let height = minHeight

          if (x > width - radiusX) {
            const delta = x - (width - radiusX)
            const angle = Math.acos(delta / radiusX)
            height = Math.max(height, minHeight - Math.sin(angle) * radiusY + radiusY)
          }
          if (x < radiusX) {
            const delta = radiusX - x
            const angle = Math.acos(delta / radiusX)
            height = Math.max(height, minHeight - Math.sin(angle) * radiusY + radiusY)
          }
          if (z > depth - radiusZ) {
            const delta = z - (depth - radiusZ)
            const angle = Math.acos(delta / radiusZ)
            height = Math.max(height, minHeight - Math.sin(angle) * radiusY + radiusY)
          }
          if (z < radiusZ) {
            const delta = radiusZ - z
            const angle = Math.acos(delta / radiusZ)
            height = Math.max(height, minHeight - Math.sin(angle) * radiusY + radiusY)
          }
          data[index++] = height
        }
      return data
    }
  }
}
