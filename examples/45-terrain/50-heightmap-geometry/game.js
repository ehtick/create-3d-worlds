import * as THREE from 'three'
import {
  scene, camera, renderer, createOrbitControls, hemLight
} from '/utils/scene.js'
import { dirLight } from '/utils/light.js'

hemLight()
dirLight()

const controls = createOrbitControls()
camera.position.y = 200

const img = new Image()
img.onload = () => {
  const data = getHeightData(img)
  const { width, height } = img

  const geometry = new THREE.PlaneGeometry(width, height, width - 1, height - 1)
  geometry.rotateX(- Math.PI / 2)
  const { position } = geometry.attributes
  const vertex = new THREE.Vector3()

  for (let i = 0, l = position.count; i < l; i++) {
    vertex.fromBufferAttribute(position, i)
    vertex.y = data[i]
    position.setXYZ(i, vertex.x, vertex.y, vertex.z)
  }

  const material = new THREE.MeshBasicMaterial({ color: 0x7a8a46, wireframe: true })
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)
}
img.src = '/assets/heightmaps/wiki.png'

/* FUNCTIONS */

// http://danni-three.blogspot.com/2013/09/threejs-heightmaps.html
function getHeightData(img, scale = 1) {
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  console.log('img:', canvas.width, canvas.height)
  const context = canvas.getContext('2d')

  const size = img.width * img.height
  const data = new Float32Array(size)

  context.drawImage(img, 0, 0)

  for (let i = 0; i < size; i ++)
    data[i] = 0

  const imgd = context.getImageData(0, 0, img.width, img.height)
  const pix = imgd.data

  let j = 0
  for (let i = 0; i < pix.length; i += 4) {
    const all = pix[i] + pix[i + 1] + pix[i + 2]
    data[j++] = all / (12 * scale)
  }

  return data
}

/* LOOP */

void function update() {
  renderer.render(scene, camera)
  controls.update()
  requestAnimationFrame(update)
}()
