import { camera, scene, renderer, clock, addUIControls } from '/utils/scene.js'
import ThirdPersonCamera from '/utils/classes/ThirdPersonCamera.js'
import { createHillyTerrain, createWater } from '/utils/ground.js'
import { createSkySphere } from '/utils/geometry.js'
import { createSun } from '/utils/light.js'
import Zeppelin from '/utils/classes/aircrafts/Zeppelin.js'
import { loadModel } from '/utils/loaders.js'

scene.add(createSkySphere({ r: 5000 }))
const light = createSun({ x: 500, y: 2000, z: 100, far: 5000 })
scene.add(light)

const water = createWater({ color: 0x003133 })
scene.add(water)

const ground = createHillyTerrain({ size: 10000, y: 100, factorX: 5, factorZ: 2.5, factorY: 350, file: 'terrain/grass.jpg' })
scene.add(ground)

const { mesh } = await loadModel({
  file: 'airship/zeppelin.fbx',
  size: 10,
})

const zeppelin = new Zeppelin({ mesh })
const thirdPersonCamera = new ThirdPersonCamera({ camera, mesh, offset: [0, 15, 20], lookAt: [0, 10, 0], speed: 4 })

scene.add(zeppelin.mesh)
mesh.position.y = 256

zeppelin.addSolids(ground, water)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()
  zeppelin.update(delta)
  thirdPersonCamera.update(delta)
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
