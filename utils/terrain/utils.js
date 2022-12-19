export function generateSimplePlayground(width, depth, averageHeight) {
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
