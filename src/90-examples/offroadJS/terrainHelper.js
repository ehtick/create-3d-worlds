import terrainHeightMap from './terrainHeightMap.js'

const groundMaterial = new CANNON.Material('groundMaterial')

export function generateTerrain() {
  const { heightMap, pointDistance, position: [x, y, z] } = terrainHeightMap
  const terrainShape = new CANNON.Heightfield(heightMap, { elementSize: pointDistance })
  const terrain = new CANNON.Body({ mass: 0, shape: terrainShape, material: groundMaterial })

  terrain.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
  terrain.position.set(x, y, z)

  return terrain
}
