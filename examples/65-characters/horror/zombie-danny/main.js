import Player from '/utils/player/Player.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { loadModel } from '/utils/loaders.js'
import { zombieDannyAnimations } from '/data/animations.js'

scene.add(createSun())

scene.add(createGround({ size: 100 }))

const { mesh, animations, animDict } = await loadModel({ file: 'zombie-danny.fbx', prefix: 'character/zombie/', angle: Math.PI, fixColors: true, animDict: zombieDannyAnimations })
const player = new Player({ mesh, animations, animDict, speed: .5 })

scene.add(mesh)

const controls = createOrbitControls()
controls.target = mesh.position

/* LOOP */

void function update() {
  requestAnimationFrame(update)
  const delta = clock.getDelta()

  player.update(delta)
  renderer.render(scene, camera)
}()
