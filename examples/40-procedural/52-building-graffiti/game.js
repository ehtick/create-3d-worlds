import { scene, camera, renderer, createOrbitControls } from '/utils/scene.js'
import { createBuilding } from '/utils/city.js'
import { createMoon } from '/utils/light.js'

const controls = createOrbitControls()
camera.position.set(0, 25, 50)
renderer.setClearColor(0x070b34)

scene.add(createBuilding({ addWindows: true })) // { addWindows: false, addTexture: true }
scene.add(createMoon({ position: [50, 50, 50], r: 1 }))

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}()
