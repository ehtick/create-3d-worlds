import { camera, scene, renderer, clock, createOrbitControls } from '/utils/scene.js'
import { createFloor } from '/utils/ground.js'
import { ambLight } from '/utils/light.js'
import { loadGolem } from '/utils/loaders.js'
import { golemAnimation } from '/data/animations.js'
import AI from '/utils/player/AI.js'

const mapSize = 100

ambLight()
camera.position.set(0, 10, 15)
createOrbitControls()

scene.add(createFloor({ size: mapSize }))

const { mesh, animations } = await loadGolem()

const ai = new AI({ mesh, animations, dict: golemAnimation, defaultState: 'patrol' })
scene.add(ai.mesh)

/* LOOP */

void function animate() {
  requestAnimationFrame(animate)
  const delta = clock.getDelta()

  ai.update(delta)

  renderer.render(scene, camera)
}()
