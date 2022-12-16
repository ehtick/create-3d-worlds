import * as THREE from 'three'
import { Ammo } from '/utils/physics.js'

export default class AmmoTerrain {
  constructor(terrainWidth, terrainDepth, terrainMinHeight, terrainMaxHeight, terrain3dWidth, terrain3dDepth) {
    const heightData = generateHeightRocket(terrainWidth, terrainDepth, terrainMinHeight, terrainMaxHeight)
    const geometry = new THREE.PlaneBufferGeometry(terrain3dWidth, terrain3dDepth, terrainWidth - 1, terrainDepth - 1)
    geometry.rotateX(-Math.PI / 2)
    const vertices = geometry.attributes.position.array
    for (let i = 0; i < vertices.length; i++)
      vertices[i * 3 + 1] = heightData[i] // + 1 because we modify y component
    geometry.computeVertexNormals()
    const material = new THREE.MeshLambertMaterial({ color: 0xfffacd })

    const meshGround = new THREE.Mesh(geometry, material)
    meshGround.receiveShadow = true

    const groundShape = createTerrainShape(heightData)
    const groundTransform = new Ammo.btTransform()
    groundTransform.setIdentity()
    // Shifts the terrain, since bullet re-centers it on its bounding box.
    groundTransform.setOrigin(new Ammo.btVector3(0, (terrainMaxHeight + terrainMinHeight) / 2, 0))
    const groundMass = 0
    const groundLocalInertia = new Ammo.btVector3(0, 0, 0)
    const groundMotionState = new Ammo.btDefaultMotionState(groundTransform)
    const groundBody = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(groundMass, groundMotionState, groundShape, groundLocalInertia))

    this.object3d = meshGround
    this.body = groundBody

    function createTerrainShape(heightData) {
    // This parameter is not really used, since we are using PHY_FLOAT height data type and hence it is ignored
      const heightScale = 1
      // 0 for X, 1 for Y, 2 for Z
      const upAxis = 1
      // hdt, height data type. "PHY_FLOAT" is used. Possible values are "PHY_FLOAT", "PHY_UCHAR", "PHY_SHORT"
      const hdt = 'PHY_FLOAT'
      // inverts the triangles
      const flipQuadEdges = false
      // allocate height data in Ammo heap
      const ammoHeightData = Ammo._malloc(4 * terrainWidth * terrainDepth)
      // Copy the javascript height data array to the Ammo one
      let p = 0
      let p2 = 0
      for (let j = 0; j < terrainDepth; j++)
        for (let i = 0; i < terrainWidth; i++) {
          // write 32-bit float data to memory
          Ammo.HEAPF32[ammoHeightData + p2 >> 2] = heightData[p]
          p++
          // 4 bytes/float
          p2 += 4
        }

      const heightFieldShape = new Ammo.btHeightfieldTerrainShape(
        terrainWidth,
        terrainDepth,
        ammoHeightData,
        heightScale,
        terrainMinHeight,
        terrainMaxHeight,
        upAxis,
        hdt,
        flipQuadEdges
      )
      // Set horizontal scale
      const scaleX = terrain3dWidth / (terrainWidth - 1)
      const scaleZ = terrain3dDepth / (terrainDepth - 1)
      heightFieldShape.setLocalScaling(new Ammo.btVector3(scaleX, 1, scaleZ))
      heightFieldShape.setMargin(0.05)
      return heightFieldShape
    }

    function generateHeightRocket(width, depth, minHeight) {
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
