import { scene, camera, renderer, createOrbitControls, hemLight } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { createCity } from '/utils/city.js'

hemLight({ intensity: 1.25 })

const size = 400
const numBuildings = 300

camera.position.set(0, size * .3, size * .4)
createOrbitControls()
renderer.setClearColor(0x070b34)

const floor = createFloor({ size: size * 1.1, color: 0x101018 })

const city = createCity({ numBuildings, size, addWindows: true, colorParams: null, rotateEvery: 9, emptyCenter: 50, addLampposts: true, addStreetLights: true })

scene.add(floor, city)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}()