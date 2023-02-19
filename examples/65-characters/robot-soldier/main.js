import Player from '/utils/player/Player.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createFloor } from '/utils/ground.js'
import { loadModel } from '/utils/loaders.js'
import { robotSoldierAnimations } from '/data/animations.js'

scene.add(createSun())

scene.add(createFloor({ size: 100 }))

const { mesh, animations } = await loadModel({ file: 'robot-soldier.fbx', prefix: 'character/robot-soldier/', animDict: robotSoldierAnimations, angle: Math.PI, fixColors: true })
const player = new Player({ mesh, animations, animDict: robotSoldierAnimations })

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
