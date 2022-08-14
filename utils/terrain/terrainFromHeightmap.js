import * as THREE from 'three'
import { material } from '/utils/shaders/heightmap-terrain.js'

const textureLoader = new THREE.TextureLoader()

export function shadeFromHeightmap({ file = 'wiki.png', size = 400, fragments = size, displacementScale = 100 } = {}) {
  material.uniforms.heightmap.value = textureLoader.load(`/assets/heightmaps/${file}`)
  material.uniforms.heightmap.displacementScale = displacementScale

  const geometry = new THREE.PlaneGeometry(size, size, fragments, fragments)
  geometry.rotateX(- Math.PI / 2)

  const mesh = new THREE.Mesh(geometry, material)
  return mesh
}

export async function terrainFromHeightmap({ file = 'wiki.png', scale = 1 } = {}) {

  const { data, width, height } = await getHeightData(`/assets/heightmaps/${file}`, scale)
  material.uniforms.heightmap.value = await textureLoader.loadAsync(`/assets/heightmaps/${file}`)

  const geometry = new THREE.PlaneGeometry(width, height, width - 1, height - 1)
  geometry.rotateX(- Math.PI / 2)
  const { position } = geometry.attributes
  const vertex = new THREE.Vector3()

  for (let i = 0, l = position.count; i < l; i++) {
    vertex.fromBufferAttribute(position, i)
    vertex.y = data[i]
    position.setXYZ(i, vertex.x, vertex.y, vertex.z)
  }

  const mesh = new THREE.Mesh(geometry, material)
  return mesh
}

/* FUNCTIONS */

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = url
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', () => reject())
  })
}

// http://danni-three.blogspot.com/2013/09/threejs-heightmaps.html
async function getHeightData(url, scale = 1) {
  const img = await loadImage(url)
  const { width, height } = img

  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const context = canvas.getContext('2d')

  const size = img.width * img.height
  const data = new Float32Array(size)

  context.drawImage(img, 0, 0)

  const imgd = context.getImageData(0, 0, img.width, img.height)
  const pix = imgd.data

  let j = 0
  for (let i = 0; i < pix.length; i += 4) {
    const all = pix[i] + pix[i + 1] + pix[i + 2]
    data[j++] = all / (12 * scale)
  }

  return { data, width, height }
}
