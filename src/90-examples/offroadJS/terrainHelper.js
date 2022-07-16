/* global CANNON */
import heightMap from './data/terrainHeightMap.js'

const groundMaterial = new CANNON.Material('groundMaterial')

export function generateTerrain() {
  const terrainShape = new CANNON.Heightfield(heightMap, { elementSize: 1.475 })
  const terrain = new CANNON.Body({ mass: 0, shape: terrainShape, material: groundMaterial })

  terrain.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
  terrain.position.set(-69.07913208007812, 0, 68.98860168457031)

  return terrain
}
