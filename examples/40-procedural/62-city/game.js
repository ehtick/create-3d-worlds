import { scene, camera, renderer, createOrbitControls, setBackground } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { createCity, createCityLights } from '/utils/city.js'
import { hemLight } from '/utils/light.js'

hemLight({ intensity: 1.25 })
setBackground(0x000000)

const size = 300
const numBuildings = 200

const controls = createOrbitControls()
camera.position.set(0, size * .6, size * 1.1)

const floor = createFloor({ size: size * 1.2, color: 0x606060 })
const streetLights = createCityLights({ size, numLights: 12 })

const city = createCity({ numBuildings, size, rotateEvery: 2, addWindows: true })

scene.add(floor, streetLights, city)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}()
