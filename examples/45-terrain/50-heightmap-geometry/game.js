import * as THREE from 'three'
import { scene, camera, renderer, createOrbitControls, hemLight } from '/utils/scene.js'
import { dirLight } from '/utils/light.js'
import { material } from '/utils/shaders/heightmap-terrain.js'

hemLight()
dirLight()

const textureLoader = new THREE.TextureLoader()
const controls = createOrbitControls()
camera.position.y = 200

const { data, width, height, max } = await getHeightData('/assets/heightmaps/wiki.png')

const geometry = new THREE.PlaneGeometry(width, height, width - 1, height - 1)
geometry.rotateX(- Math.PI / 2)
const { position } = geometry.attributes
const vertex = new THREE.Vector3()

for (let i = 0, l = position.count; i < l; i++) {
  vertex.fromBufferAttribute(position, i)
  vertex.y = data[i]
  position.setXYZ(i, vertex.x, vertex.y, vertex.z)
}

material.uniforms.heightmap.value = textureLoader.load('/assets/heightmaps/wiki.png')

// const material = new THREE.MeshBasicMaterial({ color: 0x7a8a46, wireframe: true })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

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

  // get maximum height from data array
  let max = 0
  data.forEach(height => {
    if (height > max) max = height
  })
  console.log('max height:', max)

  return { data, width, height, max }
}

/* LOOP */

void function update() {
  renderer.render(scene, camera)
  controls.update()
  requestAnimationFrame(update)
}()
