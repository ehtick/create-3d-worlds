import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { loadModel } from '/utils/loaders.js'
import { SovietPartisanPlayer } from '/utils/player/ai-characters/SovietPartisan.js'

scene.add(createSun())

scene.add(createGround({ size: 100 }))

const player = new SovietPartisanPlayer()
scene.add(player.mesh)

const { mesh: weapon } = await loadModel({ file: 'weapon/mg-42/model.fbx', scale: .4 })
player.addRifle(weapon)

const controls = createOrbitControls()
controls.target = player.mesh.position

/* LOOP */

void function update() {
  requestAnimationFrame(update)
  const delta = clock.getDelta()

  player.update(delta)
  renderer.render(scene, camera)
}()
