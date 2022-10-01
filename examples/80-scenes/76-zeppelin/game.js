import { camera, scene, renderer, addUIControls } from '/utils/scene.js'
import { createHillyTerrain, createWater } from '/utils/ground.js'
import { createSkySphere } from '/utils/geometry.js'
import { createSun } from '/utils/light.js'
import Zeppelin from '/utils/classes/aircrafts/Zeppelin.js'
import { loadModel } from '/utils/loaders.js'

camera.position.set(0, 12, 24)

scene.add(createSkySphere({ r: 5000 }))
const light = createSun({ x: 500, y: 2000, z: 100, far: 5000 })
scene.add(light)

const water = createWater({ color: 0x003133 })
scene.add(water)

// file
const ground = createHillyTerrain({ size: 10000, y: 100, factorX: 5, factorZ: 2.5, factorY: 350, file: 'terrain/grass.jpg' })
scene.add(ground)

const { mesh } = await loadModel({
  file: 'airship/zeppelin.fbx',
  size: 10,
})

const zeppelin = new Zeppelin({ mesh })
zeppelin.mesh.add(camera)
scene.add(zeppelin.mesh)
mesh.position.y = 256

zeppelin.addSolids(ground, water)

/* LOOP */

let propeler = null

mesh.traverse(child => {
  if (child.name === 'propeler') propeler = child
})

void function animate() {
  requestAnimationFrame(animate)
  zeppelin.update()

  propeler?.rotateY(-.1)

  renderer.render(scene, camera)
}()

/* UI */

const commands = {
  '←': 'levo',
  '→': 'desno',
  '↑': 'gore',
  '↓': 'dole',
  'PgUp': 'ubrzavanje',
  'PgDn': 'usporavanje',
}
addUIControls({ commands })
