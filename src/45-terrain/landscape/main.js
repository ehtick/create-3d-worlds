import { Fog } from 'three'
import { scene, camera, renderer } from '/utils/scene.js'
import Landscape from './Landscape.js'
import { size, count, speed } from './config.js'
import { initLights } from '/utils/light.js'

scene.fog = new Fog(0x100820, size, size * 2)

initLights()

camera.position.set(0, 1.8, 3)

const segments = []
for (let i = 0; i < count; i++) {
  const landscape = new Landscape(scene)
  landscape.container.position.z = -1 * i * size

  segments.push(landscape)
  scene.add(landscape.container)
}

/* LOOP */

void function update() {
  requestAnimationFrame(update)
  segments.forEach(({ container }) => {
    if (container.position.z >= size)
      container.position.z = -1 * size * (count - 1)
    container.position.z += speed
  })
  renderer.render(scene, camera)
}()