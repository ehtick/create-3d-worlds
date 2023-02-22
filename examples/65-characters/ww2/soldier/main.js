import Player from '/utils/player/Player.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { loadModel, loadRifle } from '/utils/loaders.js'
import { partisanAnimations } from '/data/animations.js'

scene.add(createSun())

scene.add(createGround({ size: 100 }))

const { mesh, animations, animDict } = await loadModel({ file: 'soldier.fbx', angle: Math.PI, animDict: partisanAnimations, prefix: 'character/soldier/', fixColors: true })

const player = new Player({ mesh, animations, animDict })

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
