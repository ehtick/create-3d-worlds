import { scene, camera, renderer, clock } from '/utils/scene.js'
import { loadModel } from '/utils/loaders.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'

scene.add(createSun())
scene.add(createGround({ color: 0x509f53 }))

camera.position.set(0, 2, 4)

/* VEHICLE */

const { mesh } = await loadModel({ file: 'tank/a7v/model.fbx' })
// mesh.position.set(0, 20, 0)

scene.add(mesh)

/* LOOP */

void function loop() {
  requestAnimationFrame(loop)
  const dt = clock.getDelta()
  renderer.render(scene, camera)
}()
