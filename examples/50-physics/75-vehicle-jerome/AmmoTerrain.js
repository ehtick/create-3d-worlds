import * as THREE from 'three'
import { Ammo } from '/utils/physics.js'
import { geometryFromData } from '/utils/terrain/heightmap.js'

function generatePlayground(width, depth, averageHeight) {
  const data = new Float32Array(width * depth)
  const radiusX = 24 * 2
  const radiusZ = 24 * 2
  const radiusY = radiusX / 4

  for (let index = 0, z = 0; z < depth; z++)
    for (let x = 0; x < width; x++) {
      let height = averageHeight

      if (x > width - radiusX) {
        const delta = x - (width - radiusX)
        const angle = Math.acos(delta / radiusX)
        height = Math.max(height, averageHeight - Math.sin(angle) * radiusY + radiusY)
      }
      if (x < radiusX) {
        const delta = radiusX - x
        const angle = Math.acos(delta / radiusX)
        height = Math.max(height, averageHeight - Math.sin(angle) * radiusY + radiusY)
      }
      if (z > depth - radiusZ) {
        const delta = z - (depth - radiusZ)
        const angle = Math.acos(delta / radiusZ)
        height = Math.max(height, averageHeight - Math.sin(angle) * radiusY + radiusY)
      }
      if (z < radiusZ) {
        const delta = radiusZ - z
        const angle = Math.acos(delta / radiusZ)
        height = Math.max(height, averageHeight - Math.sin(angle) * radiusY + radiusY)
      }
      data[index++] = height
    }
  return data
}

export default class AmmoTerrain {
  constructor({
    maxHeight = 24, minHeight = 0, width = 90, depth = 150, data = generatePlayground(width, depth, (maxHeight + minHeight) / 2)
  } = {}) {
    const averageHeight = (maxHeight + minHeight) / 2

    const geometry = geometryFromData({ data, width, depth })
    const material = new THREE.MeshLambertMaterial({ color: 0xfffacd })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.translateY(-averageHeight)
    mesh.receiveShadow = true

    const shape = createTerrainShape(data)

    const transform = new Ammo.btTransform()
    transform.setIdentity()
    transform.setOrigin(new Ammo.btVector3(mesh.position.x, mesh.position.y + averageHeight, mesh.position.z))
    const mass = 0
    const inertia = new Ammo.btVector3(0, 0, 0)
    const motionState = new Ammo.btDefaultMotionState(transform)
    const body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, inertia))
    body.setRestitution(0.9)

    mesh.userData.body = body
    this.mesh = mesh

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

  }
}
