import * as THREE from 'three'
import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { randomInRange } from '/utils/helpers.js'
import { initLights, hemLight } from '/utils/light.js'
// import { createBuilding } from '/utils/city.js'
import { material } from '/utils/shaders/rectangles.js'

initLights()
hemLight()

const controls = createOrbitControls()
camera.position.set(0, 75, 75)
renderer.setClearColor(0x070b34)

const toonMaterial = new THREE.MeshToonMaterial({ color: 0x000000 })

function createBuilding({
  color = new THREE.Color(0x000000), bWidth = randomInRange(8, 20),
  bHeight = randomInRange(bWidth * 2, bWidth * 4), rotY = 0,
} = {}) {

  const geometry = new THREE.BoxBufferGeometry(bWidth, bHeight, bWidth)

  const colors = []
  for (let i = 0, l = geometry.attributes.position.count; i < l; i ++)
    colors.push(color.r, color.g, color.b)
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

  geometry.translate(0, bHeight * .5, 0)
  if (rotY) geometry.rotateY(rotY)

  const building = new THREE.Mesh(
    geometry,
    [material, material, toonMaterial, toonMaterial, material, material]
  )
  return building
}

scene.add(createBuilding())

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}()
