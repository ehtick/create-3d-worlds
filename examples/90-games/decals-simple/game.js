import { scene, renderer, camera, createOrbitControls } from '/utils/scene.js'
import { getMouseIntersects } from '/utils/helpers.js'
import { createBox } from '/utils/geometry.js'
import { hemLight } from '/utils/light.js'
import { shootDecals } from '/utils/decals.js'

hemLight()
createOrbitControls()

const mesh = createBox()
scene.add(mesh)

function shoot(e) {
  const intersects = getMouseIntersects(e, camera)
  if (intersects.length) shootDecals(intersects[0])
}

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}()

document.addEventListener('click', shoot)
