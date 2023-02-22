import Player from '/utils/player/Player.js'
import { scene, renderer, camera, createOrbitControls, clock } from '/utils/scene.js'
import { createSun } from '/utils/light.js'
import { createGround } from '/utils/ground.js'
import { loadGermanSoldier, loadModel } from '/utils/loaders.js'

scene.add(createSun())

scene.add(createGround({ size: 100 }))

const { mesh, animations, animDict } = await loadGermanSoldier()
const player = new Player({ mesh, animations, animDict })

scene.add(mesh)

const { mesh: weapon } = await loadModel({ file: 'weapon/rifle.fbx', scale: 1.33, angle: Math.PI })
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
