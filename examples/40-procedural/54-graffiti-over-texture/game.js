import * as THREE from 'three'
import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { createBuilding } from '/utils/city.js'
import { createSun } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'

const controls = createOrbitControls()
camera.position.set(0, 25, 50)

scene.add(createSun({ position: [50, 100, 50] }))
scene.add(createFloor())

export async function createImgTexture({ width = 256, height = 256 } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  const img = new Image()
  img.src = '/assets/textures/terrain/concrete.jpg'
  await new Promise(resolve => img.addEventListener('load', resolve))
  ctx.drawImage(img, 5, 5)

  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

scene.add(createBuilding({ color: 0xcccccc, map: await createImgTexture() }))

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}()
