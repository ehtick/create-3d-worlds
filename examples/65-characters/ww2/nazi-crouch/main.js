import Player from '/utils/player/Player.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { loadModel, loadRifle } from '/utils/loaders.js'
import { naziCrouchAnimations } from '/data/animations.js'

scene.add(createSun())

scene.add(createGround({ size: 100 }))

const { mesh, animations } = await loadModel({ file: 'nazi.fbx', animDict: naziCrouchAnimations, prefix: 'character/nazi/', angle: Math.PI, fixColors: true })
const player = new Player({ mesh, animations, animDict: naziCrouchAnimations })

scene.add(mesh)

const { mesh: weapon } = await loadRifle()
player.addRifle(weapon)

const controls = createOrbitControls()
controls.target = mesh.position

/* LOOP */

void function update() {
  requestAnimationFrame(update)
  const delta = clock.getDelta()

  player.update(delta)
  renderer.render(scene, camera)
}()
