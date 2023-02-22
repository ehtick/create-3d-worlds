import Player from '/utils/player/Player.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { loadSovietPartisan, loadModel } from '/utils/loaders.js'

scene.add(createSun())

scene.add(createGround({ size: 100 }))

const { mesh, animations, animDict } = await loadSovietPartisan()

const player = new Player({ mesh, animations, animDict })
scene.add(mesh)

const { mesh: weapon } = await loadModel({ file: 'weapon/mg-42/untitled.fbx', scale: .4 })
player.addWeapon(weapon)

const controls = createOrbitControls()
controls.target = mesh.position

/* LOOP */

void function update() {
  requestAnimationFrame(update)
  const delta = clock.getDelta()

  player.update(delta)
  renderer.render(scene, camera)
}()
