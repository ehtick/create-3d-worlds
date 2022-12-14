'use strict'

var THREEx = THREEx || {}

THREEx.AmmoTerrain = function(terrainWidth, terrainDepth, terrainMinHeight, terrainMaxHeight, terrain3dWidth, terrain3dDepth) {
  const _this = this

  const heightData = generateHeightRocket(terrainWidth, terrainDepth, terrainMinHeight, terrainMaxHeight)

  const geometry = new THREE.PlaneBufferGeometry(terrain3dWidth, terrain3dDepth, terrainWidth - 1, terrainDepth - 1)
  geometry.rotateX(-Math.PI / 2)
  const vertices = geometry.attributes.position.array
  for (let i = 0; i < vertices.length; i++)
  // j + 1 because it is the y component that we modify
    vertices[i * 3 + 1] = heightData[i]

  geometry.computeVertexNormals()
  const material = new THREE.MeshLambertMaterial({
    map: new THREE.TextureLoader().load('textures/grid.png', texture => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(terrain3dWidth, terrain3dDepth)
    }),
    side: THREE.DoubleSide
  })

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

  _this.object3d = meshGround
  _this.body = groundBody

  return

  function createTerrainShape(heightData) {
    // This parameter is not really used, since we are using PHY_FLOAT height data type and hence it is ignored
    const heightScale = 1
    // Up axis = 0 for X, 1 for Y, 2 for Z. Normally 1 = Y is used.
    const upAxis = 1
    // hdt, height data type. "PHY_FLOAT" is used. Possible values are "PHY_FLOAT", "PHY_UCHAR", "PHY_SHORT"
    const hdt = 'PHY_FLOAT'
    // Set this to your needs (inverts the triangles)
    const flipQuadEdges = false
    // Creates height data buffer in Ammo heap
    const ammoHeightData = Ammo._malloc(4 * terrainWidth * terrainDepth)
    // Copy the javascript height data array to the Ammo one.
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

    // Creates the heightfield physics shape
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
          var delta = x - (width - radiusX)
          var angle = Math.acos(delta / radiusX)
          height = Math.max(height, minHeight - Math.sin(angle) * radiusY + radiusY)
        }
        if (x < radiusX) {
          var delta = radiusX - x
          var angle = Math.acos(delta / radiusX)
          height = Math.max(height, minHeight - Math.sin(angle) * radiusY + radiusY)
        }
        if (z > depth - radiusZ) {
          var delta = z - (depth - radiusZ)
          var angle = Math.acos(delta / radiusZ)
          height = Math.max(height, minHeight - Math.sin(angle) * radiusY + radiusY)
        }
        if (z < radiusZ) {
          var delta = radiusZ - z
          var angle = Math.acos(delta / radiusZ)
          height = Math.max(height, minHeight - Math.sin(angle) * radiusY + radiusY)
        }
        data[index++] = height
      }

    return data
  }
}

THREEx.AmmoTerrain.prototype = Object.create(THREEx.AmmoControls.prototype)
THREEx.AmmoTerrain.prototype.constructor = THREEx.AmmoControls
