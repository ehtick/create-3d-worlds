function fromImage(image, width, depth, minHeight, maxHeight) {
  width |= 0
  depth |= 0

  let i, j
  const matrix = []
  const canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d')
  let imgData, pixel, channels = 4
  const heightRange = maxHeight - minHeight
  let heightData

  canvas.width = width
  canvas.height = depth

  ctx.drawImage(image, 0, 0, width, depth)
  imgData = ctx.getImageData(0, 0, width, depth).data

  for (i = 0 | 0; i < depth; i = (i + 1) | 0) { // row
    matrix.push([])

    for (j = 0 | 0; j < width; j = (j + 1) | 0) { // col
      pixel = i * depth + j
      heightData = imgData[pixel * channels] / 255 * heightRange + minHeight
      matrix[i].push(heightData)
    }
  }
  return matrix
}

export function fromUrl(url, width, depth, minHeight, maxHeight) {
  return new Promise((onFulfilled, onRejected) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = function() {
      const matrix = fromImage(image, width, depth, minHeight, maxHeight)
      onFulfilled(matrix)
    }
    image.src = url
  })
}
