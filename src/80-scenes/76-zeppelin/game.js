import { camera, scene, renderer, addUIControls } from '/utils/scene.js'
import { createHillyTerrain } from '/utils/ground/createHillyTerrain.js'
import { createSkySphere } from '/utils/geometry.js'
import { createSunLight } from '/utils/light.js'
import { createWater } from '/utils/ground.js'
import Zeppelin from '/classes/aircrafts/Zeppelin.js'
import { loadModel } from '/utils/loaders.js'

camera.position.set(0, 10, 25)

scene.add(createSkySphere({ r: 5000 }))
const light = createSunLight({ x: 500, y: 2000, z: 100, far: 5000 })
scene.add(light)

const water = createWater({ color: 0x003133 })
scene.add(water)

// file
const ground = createHillyTerrain({ size: 10000, y: 100, factorX: 5, factorZ: 2.5, factorY: 350, file: 'grass-512.jpg' })
scene.add(ground)

const { mesh } = await loadModel({
  file: 'airship/zeppelin-lowpoly/scene.gltf',
  size: 10,
  axis: [0, 1, 0], angle: Math.PI,
})

const zeppelin = new Zeppelin({ mesh })
zeppelin.mesh.add(camera)
scene.add(zeppelin.mesh)
mesh.position.y = 256

zeppelin.addSolids(ground, water)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  zeppelin.update()
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
