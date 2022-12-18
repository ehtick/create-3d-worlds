import * as THREE from 'three'
import { Ammo } from '/utils/physics.js'

export default class AmmoTerrain {
  constructor({
    planeWidth = 90, planeDepth = 150, terrainWidth = 256, terrainDepth = 256,
    terrainMaxHeight = 48, terrainMinHeight = 0,
  } = {}) {
    const heightData = generateHeightData(terrainWidth, terrainDepth, terrainMinHeight, terrainMaxHeight)

    const geometry = new THREE.PlaneGeometry(planeWidth, planeDepth, terrainWidth - 1, terrainDepth - 1)
    geometry.rotateX(-Math.PI / 2)

    const vertices = geometry.attributes.position.array
    for (let i = 0; i < vertices.length; i++)
      vertices[i * 3 + 1] = heightData[i] // + 1 because we modify y
    geometry.computeVertexNormals()

    const material = new THREE.MeshLambertMaterial({ color: 0xfffacd })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.receiveShadow = true

    const shape = createTerrainShape(heightData)
    const transform = new Ammo.btTransform()
    transform.setIdentity()
    // Shifts the terrain, since bullet re-centers it on its bounding box.
    transform.setOrigin(new Ammo.btVector3(0, (terrainMaxHeight + terrainMinHeight) / 2, 0))
    const mass = 0
    const inertia = new Ammo.btVector3(0, 0, 0)
    const motionState = new Ammo.btDefaultMotionState(transform)
    const body = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, inertia))
    body.setRestitution(0.9)

    this.mesh = mesh
    this.body = body

    function createTerrainShape(heightData) {
      const heightScale = 1 // ignored for PHY_FLOAT
      const upAxis = 1 // 0=X, 1=Y, 2=Z
      const hdt = 'PHY_FLOAT' // possible values: PHY_FLOAT, PHY_UCHAR, PHY_SHORT
      const flipQuadEdges = false
      // allocate height data in Ammo heap
      const ammoHeightData = Ammo._malloc(4 * terrainWidth * terrainDepth)
      // copy javascript data array to the Ammo one
      let p = 0
      let p2 = 0
      for (let j = 0; j < terrainDepth; j++)
        for (let i = 0; i < terrainWidth; i++) {
          // write 32-bit float data to memory
          Ammo.HEAPF32[ammoHeightData + p2 >> 2] = heightData[p]
          p++
          p2 += 4 // 4 bytes/float
        }

      const heightFieldShape = new Ammo.btHeightfieldTerrainShape(
        terrainWidth, terrainDepth, ammoHeightData, heightScale,
        terrainMinHeight, terrainMaxHeight, upAxis, hdt, flipQuadEdges
      )
      // Set horizontal scale
      const scaleX = planeWidth / (terrainWidth - 1)
      const scaleZ = planeDepth / (terrainDepth - 1)
      heightFieldShape.setLocalScaling(new Ammo.btVector3(scaleX, 1, scaleZ))
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
